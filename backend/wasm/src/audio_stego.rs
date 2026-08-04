use wasm_bindgen::prelude::*;
use crate::crypto::{aes_encrypt, aes_decrypt, derive_key_argon2id, rand_bytes};

const MAGIC: &[u8] = b"AWAV";
const HEADER_SIZE: usize = 52;           // [MAGIC:4][LEN:4][IV:12][SALT:32]

// ── WAV Parser ──────────────────────────────────────────────

struct WavInfo {
    header: Vec<u8>,                  // All bytes before of data chunk
    samples: Vec<i16>,               // 16-bits PCM sample
    data_chunk_offset: usize,       // Offset of begining data in file
}

fn parse_wav(bytes: &[u8]) -> Result<WavInfo, String> {
    if bytes.len() < 44 {
        return Err("❌ [wasm ERROR in audio_stego.rs] The wave file is very small!".to_string());
    }
    if &bytes[0..4] != b"RIFF" {
        return Err("❌ [wasm ERROR in audio_stego.rs] The wave file is not valid!".to_string());
    }
    if &bytes[8..12] != b"WAVE" {
        return Err("❌ [wasm ERROR in audio_stego.rs] The wave file is not valid!".to_string());
    }

    let mut pos               = 12usize;
    let mut bits_per_sample: u16     = 16;
    let mut num_channels:    u16     = 1;

    while pos + 8 <= bytes.len() {
        let chunk_id   = &bytes[pos..pos+4];
        let chunk_size = u32::from_le_bytes(bytes[pos+4..pos+8].try_into().unwrap()) as usize;

        if chunk_id == b"fmt " && pos + 24 <= bytes.len() {
            let audio_format = u16::from_le_bytes(bytes[pos+8..pos+10].try_into().unwrap());
            if audio_format != 1 && audio_format != 0xFFFE {
                return Err(format!("❌ [wasm ERROR in audio_stego.rs] This wave file foramt doesn't support : (format={})", audio_format));
            }
            num_channels    = u16::from_le_bytes(bytes[pos+10..pos+12].try_into().unwrap());
            bits_per_sample = u16::from_le_bytes(bytes[pos+22..pos+24].try_into().unwrap());
        }

        if chunk_id == b"data" {
            let data_offset    = pos + 8;
            let data_size      = chunk_size.min(bytes.len().saturating_sub(data_offset));
            let header       = bytes[..data_offset].to_vec();
            let bps            = (bits_per_sample / 8).max(1) as usize;       // bytes per sample
            let frame_size     = bps * num_channels as usize;
            let frame_count    = data_size / frame_size;

            let mut samples = Vec::with_capacity(frame_count);
            for i in 0..frame_count {
                // just 1st channel (left/mono)
                let off = data_offset + i * frame_size;
                let s: i16 = match bits_per_sample {
                    8 => ((bytes[off] as i16) - 128) << 8,
                    16 => {
                        if off + 2 > bytes.len() { break; }
                        i16::from_le_bytes(bytes[off..off+2].try_into().unwrap())
                    }
                    24 => {
                        if off + 3 > bytes.len() { break; }
                        let v = (bytes[off] as i32) | ((bytes[off+1] as i32)<<8) | ((bytes[off+2] as i32)<<16);
                        let v32 = if v & 0x800000 != 0 { v | !0xFFFFFF } else { v };
                        (v32 >> 8) as i16
                    }
                    32 => {
                        if off + 4 > bytes.len() { break; }
                        (i32::from_le_bytes(bytes[off..off+4].try_into().unwrap()) >> 16) as i16
                    }
                    _ => 0i16,
                };
                samples.push(s);
            }

            return Ok(WavInfo { header, samples, data_chunk_offset: data_offset });
        }

        pos += 8 + chunk_size + (chunk_size & 1);
    }

    Err("❌ [wasm ERROR in audio_stego.rs] data chunk not found!".to_string())
}

fn assemble_wav(info: &WavInfo) -> Vec<u8> {
    let mut out = info.header.clone();
    for &s in &info.samples {
        out.extend_from_slice(&s.to_le_bytes());
    }

    let riff_size = (out.len() - 8) as u32;
    out[4..8].copy_from_slice(&riff_size.to_le_bytes());
    
    let data_size = (info.samples.len() * 2) as u32;
    let data_offset = info.data_chunk_offset;
    out[data_offset-4..data_offset].copy_from_slice(&data_size.to_le_bytes());
    out
}

// ── LSB Embed/Extract ────────────────────────────────────────

// Embed bytes in LSB sample
fn embed_lsb(samples: &mut Vec<i16>, data: &[u8]) -> Result<(), String> {
    let bits_needed = data.len() * 8;
    if bits_needed > samples.len() {
        return Err(format!(
            "❌ [wasm ERROR in audio_stego.rs] Insufficiant storage - {} u have sample! but {} data needed! : {} Bytes ",
            samples.len(), bits_needed, data.len()
        ));
    }

    for (byte_idx, &byte) in data.iter().enumerate() {
        for bit_idx in 0..8 {
            let sample_idx = byte_idx * 8 + bit_idx;
            let bit = (byte >> (7 - bit_idx)) & 1;
            
            samples[sample_idx] = (samples[sample_idx] & !1) | (bit as i16);
        }
    }
    Ok(())
}

// Extract sample
fn extract_lsb(samples: &[i16], byte_count: usize) -> Vec<u8> {
    let mut result = Vec::with_capacity(byte_count);
    for byte_idx in 0..byte_count {
        let mut byte = 0u8;
        for bit_idx in 0..8 {
            let sample_idx = byte_idx * 8 + bit_idx;
            if sample_idx >= samples.len() { break; }
            let bit = (samples[sample_idx] & 1) as u8;
            byte = (byte << 1) | bit;
        }
        result.push(byte);
    }
    result
}

// ── Public WASM API ──────────────────────────────────────────

// Embed hidden message in WAV with AES-256-GCM Encryption!
#[wasm_bindgen]
pub fn audio_stego_embed(
    wav_bytes: &[u8],
    secret: &str,
    password: &str,
) -> Result<js_sys::Uint8Array, JsValue> {
    let map_err = |e: String| JsValue::from_str(&e);

    if secret.is_empty() {
        return Err(JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] The secret key is empty!"));
    }
    if password.is_empty() {
        return Err(JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] The passward is empty!"));
    }

    let mut wav = parse_wav(wav_bytes).map_err(map_err)?;

    // Encryption
    let salt = rand_bytes(32);
    let key  = derive_key_argon2id(password, &salt)
        .map_err(|e| JsValue::from_str(&e))?;
    // aes_encrypt → (ciphertext, iv)
    let (ciphertext, iv) = aes_encrypt(secret.as_bytes(), &key)
        .map_err(|e| JsValue::from_str(&e))?;

    // Creating payload
    let mut payload = Vec::new();
    payload.extend_from_slice(MAGIC);
    payload.extend_from_slice(&(ciphertext.len() as u32).to_le_bytes());
    
    let mut iv_fixed = [0u8; 12];
    let copy_len = iv.len().min(12);
    iv_fixed[..copy_len].copy_from_slice(&iv[..copy_len]);
    payload.extend_from_slice(&iv_fixed);
    payload.extend_from_slice(&salt);
    payload.extend_from_slice(&ciphertext);

    
    let bits_needed = payload.len() * 8;
    let available = wav.samples.len();
    if bits_needed > available {
        return Err(JsValue::from_str(&format!(
            "❌ [wasm ERROR in audio_stego.rs] The wav file does not have sufficciant storage! the message is {} bytes but wav just has {} sample bytes!",
            payload.len(), available / 8
        )));
    }

    embed_lsb(&mut wav.samples, &payload).map_err(map_err)?;

    let result = assemble_wav(&wav);
    Ok(js_sys::Uint8Array::from(result.as_slice()))
}

// Extract Audio
#[wasm_bindgen]
pub fn audio_stego_extract(
    wav_bytes: &[u8],
    password: &str,
) -> Result<String, JsValue> {
    let map_err = |e: String| JsValue::from_str(&e);

    let wav = parse_wav(wav_bytes).map_err(map_err)?;

    
    if wav.samples.len() < HEADER_SIZE * 8 {
        return Err(JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] The wav file does not have any data! it's very small!"));
    }

    let header_bytes = extract_lsb(&wav.samples, HEADER_SIZE);

    
    if &header_bytes[0..4] != MAGIC {
        return Err(JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] This wav doesn't hidden message!"));
    }

    let data_len = u32::from_le_bytes(header_bytes[4..8].try_into().unwrap()) as usize;
    let iv   = &header_bytes[8..20];
    let salt = &header_bytes[20..52];

    
    let total_bytes = HEADER_SIZE + data_len;
    if total_bytes * 8 > wav.samples.len() {
        return Err(JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] The hidden message/file is corrupted!"));
    }

    let all_bytes = extract_lsb(&wav.samples, total_bytes);
    let encrypted = &all_bytes[HEADER_SIZE..];

    let key = derive_key_argon2id(password, salt)
        .map_err(|e| JsValue::from_str(&e))?;
    // aes_decrypt(ciphertext, key, iv)
    let decrypted = aes_decrypt(encrypted, &key, iv)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] Failed to decrypt the hidden message! because of incorrect password or corrupted data"))?;
    

    String::from_utf8(decrypted)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in audio_stego.rs] The extracted content isn't UTF-8!"))
}

#[wasm_bindgen]
pub fn audio_stego_capacity(wav_bytes: &[u8]) -> Result<u32, JsValue> {
    let wav = parse_wav(wav_bytes)
        .map_err(|e| JsValue::from_str(&e))?;
    let total_bits = wav.samples.len();
    let usable_bytes = total_bits / 8;
    
    let net = usable_bytes.saturating_sub(HEADER_SIZE + 16); // +16 AES tag
    Ok(net as u32)
}
