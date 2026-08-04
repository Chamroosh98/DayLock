use wasm_bindgen::prelude::*;
use crate::crypto::{aes_encrypt, aes_decrypt, derive_key_argon2id, rand_bytes};

const MAGIC: &[u8] = b"SCRT";
const HEADER_SIZE: usize = 52; // [MAGIC:4][LEN:4][IV:12][SALT:32]

fn decode_png(png_bytes: &[u8]) -> Result<(Vec<u8>, u32, u32), String> {
    let decoder = png::Decoder::new(std::io::Cursor::new(png_bytes));
    let mut reader = decoder.read_info().map_err(|e| format!("❌ [wasm ERROR in stego.rs] PNG decode error: {}", e))?;
    let mut pixels = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut pixels).map_err(|e| format!("❌ [wasm ERROR in stego.rs] PNG frame error: {}", e))?;
    let width = info.width;
    let height = info.height;

    let rgba = match info.color_type {
        png::ColorType::Rgba => pixels[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => {
            let rgb = &pixels[..info.buffer_size()];
            let mut out = Vec::with_capacity(width as usize * height as usize * 4);
            for chunk in rgb.chunks(3) {
                out.extend_from_slice(chunk);
                out.push(255);
            }
            out
        }
        png::ColorType::Grayscale => {
            let gray = &pixels[..info.buffer_size()];
            let mut out = Vec::with_capacity(width as usize * height as usize * 4);
            for &g in gray { out.extend_from_slice(&[g, g, g, 255]); }
            out
        }
        png::ColorType::GrayscaleAlpha => {
            let ga = &pixels[..info.buffer_size()];
            let mut out = Vec::with_capacity(width as usize * height as usize * 4);
            for chunk in ga.chunks(2) { out.extend_from_slice(&[chunk[0], chunk[0], chunk[0], chunk[1]]); }
            out
        }
        _ => return Err("❌ [wasm ERROR in stego.rs] The png format doesn't support!".to_string()),
    };
    Ok((rgba, width, height))
}

fn encode_png(rgba: &[u8], width: u32, height: u32) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    {
        let mut encoder = png::Encoder::new(std::io::Cursor::new(&mut out), width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_compression(png::Compression::Fast);
        encoder.set_filter(png::FilterType::NoFilter);
        let mut writer = encoder.write_header().map_err(|e| format!("❌ [wasm ERROR in stego.rs] PNG header: {}", e))?;
        writer.write_image_data(rgba).map_err(|e| format!("❌ [wasm ERROR in stego.rs] PNG write: {}", e))?;
    }
    Ok(out)
}

fn lsb_encode(pixels: &mut Vec<u8>, data: &[u8]) -> Result<(), String> {
    let available = (pixels.len() / 4) * 3;
    let needed = data.len() * 8;
    if needed > available {
        return Err(format!("❌ [wasm ERROR in stego.rs] The capacity of image is small! ({} bytes) its capacity must be {} bytes! atleast", available / 8, data.len()));
    }
    let mut bit = 0usize;
    'outer: for px in 0..(pixels.len() / 4) {
        for ch in 0..3usize {
            if bit >= needed { break 'outer; }
            let b = (data[bit/8] >> (7 - bit%8)) & 1;
            pixels[px*4 + ch] = (pixels[px*4 + ch] & 0xFE) | b;
            bit += 1;
        }
    }
    Ok(())
}

fn lsb_decode(pixels: &[u8], byte_count: usize) -> Vec<u8> {
    let mut out = vec![0u8; byte_count];
    let needed = byte_count * 8;
    let mut bit = 0usize;
    'outer: for px in 0..(pixels.len() / 4) {
        for ch in 0..3usize {
            if bit >= needed { break 'outer; }
            out[bit/8] |= (pixels[px*4 + ch] & 1) << (7 - bit%8);
            bit += 1;
        }
    }
    out
}

#[wasm_bindgen]
pub fn stego_hide(png_bytes: &[u8], secret_text: &[u8], password: &str) -> Result<js_sys::Uint8Array, JsValue> {
    let salt = rand_bytes(32);
    let key = derive_key_argon2id(password, &salt).map_err(|e| JsValue::from_str(&e))?;
    let (ciphertext, iv) = aes_encrypt(secret_text, &key).map_err(|e| JsValue::from_str(&e))?;

    let mut payload = Vec::with_capacity(HEADER_SIZE + ciphertext.len());
    payload.extend_from_slice(MAGIC);
    payload.extend_from_slice(&(ciphertext.len() as u32).to_be_bytes());
    payload.extend_from_slice(&iv);
    payload.extend_from_slice(&salt);
    payload.extend_from_slice(&ciphertext);

    let (mut pixels, w, h) = decode_png(png_bytes).map_err(|e| JsValue::from_str(&e))?;
    lsb_encode(&mut pixels, &payload).map_err(|e| JsValue::from_str(&e))?;
    let out_png = encode_png(&pixels, w, h).map_err(|e| JsValue::from_str(&e))?;
    Ok(js_sys::Uint8Array::from(out_png.as_slice()))
}

#[wasm_bindgen]
pub fn stego_extract(png_bytes: &[u8], password: &str) -> Result<js_sys::Uint8Array, JsValue> {
    let (pixels, _, _) = decode_png(png_bytes).map_err(|e| JsValue::from_str(&e))?;

    let header = lsb_decode(&pixels, HEADER_SIZE);
    if &header[0..4] != MAGIC {
        return Err(JsValue::from_str("❌ [wasm ERROR in stego.rs] No hidden data found in this image!"));
    }

    let data_len = u32::from_be_bytes([header[4], header[5], header[6], header[7]]) as usize;
    if data_len == 0 || data_len > 50 * 1024 * 1024 {
        return Err(JsValue::from_str("❌ [wasm ERROR in stego.rs] Corrupt or incomplete data!"));
    }

    let total = HEADER_SIZE + data_len;
    if total * 8 > (pixels.len() / 4) * 3 {
        return Err(JsValue::from_str("❌ [wasm ERROR in stego.rs] The image is incomplete!"));
    }

    let iv = &header[8..20];
    let salt = &header[20..52];
    let full = lsb_decode(&pixels, total);
    let key = derive_key_argon2id(password, salt).map_err(|e| JsValue::from_str(&e))?;
    let plain = aes_decrypt(&full[HEADER_SIZE..], &key, iv)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in stego.rs] The password is wrong!"))?;

    Ok(js_sys::Uint8Array::from(plain.as_slice()))
}

#[wasm_bindgen]
pub fn stego_capacity(width: u32, height: u32) -> u32 {
    let avail = (width * height * 3) as usize / 8;
    if avail > HEADER_SIZE { (avail - HEADER_SIZE) as u32 } else { 0 }
}

#[wasm_bindgen]
pub fn stego_has_data_in_png(png_bytes: &[u8]) -> bool {
    match decode_png(png_bytes) {
        Ok((pixels, _, _)) => {
            if (pixels.len() / 4) * 3 / 8 < HEADER_SIZE { return false; }
            lsb_decode(&pixels, 4) == MAGIC
        }
        Err(_) => false,
    }
}

#[wasm_bindgen]
pub fn stego_has_data(pixels: &[u8]) -> bool {
    if (pixels.len() / 4) * 3 / 8 < HEADER_SIZE { return false; }
    lsb_decode(pixels, 4) == MAGIC
}

#[wasm_bindgen]
pub fn stego_capacity_png(png_bytes: &[u8]) -> u32 {
    match decode_png(png_bytes) {
        Ok((pixels, _, _)) => {
            let avail = (pixels.len() / 4) * 3 / 8;
            if avail > HEADER_SIZE { (avail - HEADER_SIZE) as u32 } else { 0 }
        }
        Err(_) => 0,
    }
}
