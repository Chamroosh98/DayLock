use wasm_bindgen::prelude::*;
use crate::crypto::{
    aes_encrypt, aes_decrypt,
    derive_key_argon2id, rand_bytes,
};

// File's MetaData : before encrypting data
/*
    Header format : 
        [MAGIC:4][KIND:1][NAME_LEN:2][NAME:N][MIME_LEN:2][MIME:M][IV:12][SALT_FLAG:1][SALT?:32][DATA...]
*/

const FILE_MAGIC: &[u8] = b"SECF";

#[allow(dead_code)]
pub enum FileKind {
    File = 0,
    Voice = 1,
    Image = 2,
}

#[allow(dead_code)]
impl FileKind {
    fn from_u8(v: u8) -> Self {
        match v {
            1 => FileKind::Voice,
            2 => FileKind::Image,
            _ => FileKind::File,
        }
    }
}

// File encryption
/*
    Encrypt image/voice/file with password -> return {data, iv, salt} high encryption!
*/

#[wasm_bindgen]
pub fn encrypt_file_with_password(
    file_data: &[u8], 
    filename: &str, 
    mime_type: &str, 
    kind: u8, 
    password: &str
) -> Result<js_sys::Object, JsValue> {

    // create payload = header + file's data
    let payload = build_payload(file_data, filename, mime_type, kind);

    // ecryption
    let salt = rand_bytes(32);
    let key = derive_key_argon2id(password, &salt)
        .map_err(|e| JsValue::from_str(&e))?;

    let (ciphertext, iv) = aes_encrypt(&payload, &key)
        .map_err(|e| JsValue::from_str(&e))?;

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"data".into(), &js_sys::Uint8Array::from(ciphertext.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"iv".into(),   &js_sys::Uint8Array::from(iv.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"salt".into(), &js_sys::Uint8Array::from(salt.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"size".into(), &JsValue::from_f64(file_data.len() as f64))?;

    Ok(obj)
}

// encryption with random key (without password)
#[wasm_bindgen]
pub fn encrypt_file_with_random_key(
    file_data: &[u8],
    filename: &str
    , mime_type: &str,
    kind: u8
) -> Result<js_sys::Object, JsValue> {

    let payload = build_payload(file_data, filename, mime_type, kind);

    let key = rand_bytes(32);
    let (ciphertext, iv) = aes_encrypt(&payload, &key)
        .map_err(|e| JsValue::from_str(&e))?;


    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"data".into(), &js_sys::Uint8Array::from(ciphertext.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"iv".into(),   &js_sys::Uint8Array::from(iv.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"key".into(),  &js_sys::Uint8Array::from(key.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"size".into(), &JsValue::from_f64(file_data.len() as f64))?;
    
    Ok(obj)
}

// Decryption file with password
// returns : {data, filename, mime_type, kind}
#[wasm_bindgen]
pub fn decrypt_file_with_password(
    ciphertext: &[u8],
    iv: &[u8],
    salt: &[u8],
    password: &str
) -> Result<js_sys::Object, JsValue> {

    let key = derive_key_argon2id(password, salt)
        .map_err(|e| JsValue::from_str(&e))?;

    let payload = aes_decrypt(ciphertext, &key, iv)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in file.rs] The password is wrong or the data is corrupted!"))?;

    parse_payload_to_js(&payload)
}

// Decrypt file with direct key
#[wasm_bindgen]
pub fn decrypt_file_with_key(ciphertext: &[u8], iv: &[u8], key: &[u8]) -> Result<js_sys::Object, JsValue> {

    let payload = aes_decrypt(ciphertext, key, iv)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in file.rs] The key is wrong or the data is coruppted!"))?;

    parse_payload_to_js(&payload)
}

// Built-in Tools

// Creatng paylaod = Header of MetaData + file's data
fn build_payload(data: &[u8], filename: &str, mime: &str, kind: u8) -> Vec<u8> {

    let name_bytes = filename.as_bytes();
    let mime_bytes = mime.as_bytes();

    let mut payload = Vec::new();
    payload.extend_from_slice(FILE_MAGIC);      // 4 Bytes
    payload.push(kind);
    payload.extend_from_slice(&(name_bytes.len() as u16).to_be_bytes());         // 2 Bytes
    payload.extend_from_slice(name_bytes);
    payload.extend_from_slice(&(mime_bytes.len() as u16).to_be_bytes());       // 2 Bytes
    payload.extend_from_slice(mime_bytes);
    payload.extend_from_slice(&(data.len() as u32).to_be_bytes());           // 4 Bytes
    payload.extend_from_slice(data);

    payload
}

// Parse payload and return it to JS
fn parse_payload_to_js(payload: &[u8]) -> Result<js_sys::Object, JsValue>  {
    
    if payload.len() < 4 || &payload[0..4] != FILE_MAGIC {
        return Err(JsValue::from_str("❌ [wasm ERROR in file.rs] The file fotmat isn't valid!"));
    }

    let mut idx = 4;

    let kind = payload[idx];
    idx += 1;

    let name_len = u16::from_be_bytes([payload[idx], payload[idx+1]]) as usize;
    idx += 2;
    let filename = String::from_utf8_lossy(&payload[idx..idx+name_len]).to_string();
    idx += name_len;

    let mime_len = u16::from_be_bytes([payload[idx], payload[idx+1]]) as usize;
    idx += 2;
    let mime_type = String::from_utf8_lossy(&payload[idx..idx+mime_len]).to_string();
    idx += mime_len;

    let data_len = u32::from_be_bytes([
        payload[idx], payload[idx+1], payload[idx+2], payload[idx+3]
    ]) as usize;
    idx += 4;


    let file_data = &payload[idx..idx+data_len];


    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"data".into(), &js_sys::Uint8Array::from(file_data).into())?;
    js_sys::Reflect::set(&obj, &"filename".into(), &JsValue::from_str(&filename))?;
    js_sys::Reflect::set(&obj, &"mime_type".into(), &JsValue::from_str(&mime_type))?;
    js_sys::Reflect::set(&obj, &"kind".into(), &JsValue::from_f64(kind as f64))?;

    Ok(obj)
}
