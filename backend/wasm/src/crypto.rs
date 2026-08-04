use aes_gcm::{
    aead::{ Aead, KeyInit },
    Aes256Gcm, Key, Nonce,
};

use argon2::{ Algorithm, Argon2, Params, Version };
use getrandom::getrandom;
use wasm_bindgen::prelude::*;


// Generate random bytes
pub fn rand_bytes(n: usize) -> Vec<u8> {
    let mut buf = vec![0u8; n];
    getrandom(&mut buf).expect("❌ [wasm ERROR in crypto.rs] Getrandom failed!");
    buf
}

// Argon2 Key Derivation
pub fn derive_key_argon2id(password: &str, salt: &[u8]) -> Result<Vec<u8>, String> {

    let params = Params::new(
        65536,              // m_cast: 64 Mb
        3,                 // t_cost : 3 iteration
        1,                // p_cost: 1 thread
        Some(32),
    ).map_err(|e| e.to_string())?;

    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);

    let mut key = vec![0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| e.to_string())?;

    Ok(key)
}

// AES-256-GCM Enryption
pub fn aes_encrypt(plaintext: &[u8], key_bytes: &[u8]) -> Result<(Vec<u8>, Vec<u8>), String> {

    let key = Key::<Aes256Gcm>::from_slice(key_bytes);
    let cipher = Aes256Gcm::new(key);

    let iv = rand_bytes(12);
    let nonce = Nonce::from_slice(&iv);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("❌ [wasm ERROR in crypto.rs] Encryption failure : {}", e))?;

    Ok((ciphertext, iv))

}

// AES-256-GCM Decryption
pub fn aes_decrypt(ciphertext: &[u8], key_bytes: &[u8], iv: &[u8]) -> Result<Vec<u8>, String> {

    let key = Key::<Aes256Gcm>::from_slice(key_bytes);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(iv);

    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "❌ [wasm ERROR in crypto.rs] The key or data is wrong! / encryption failed!".to_string())

}

// Export function into JS
// Encryption with password (Argon2id + AES-GCM)
// returns : {data, iv, slat} into Vec<u8>

#[wasm_bindgen]
pub fn encrypt_with_password(plaintext: &[u8], password: &str) -> Result<js_sys::Object, JsValue> {

    let salt = rand_bytes(32);
    let key = derive_key_argon2id(password, &salt)
        .map_err(|e| JsValue::from_str(&e))?;

    let (ciphertext, iv) = aes_encrypt(plaintext, &key)
        .map_err(|e| JsValue::from_str(&e))?;

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"data".into(), &js_sys::Uint8Array::from(ciphertext.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"iv".into(),   &js_sys::Uint8Array::from(iv.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"salt".into(), &js_sys::Uint8Array::from(salt.as_slice()).into())?;

    Ok(obj)
}

// Encription without password (with random key)
// returns {data, iv, key}
#[wasm_bindgen]
pub fn encrypt_with_random_key(plaintext: &[u8]) -> Result<js_sys::Object, JsValue> {

    let key = rand_bytes(32);
    let (ciphertext, iv) = aes_encrypt(plaintext, &key)
        .map_err(|e| JsValue::from_str(&e))?;

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"data".into(), &js_sys::Uint8Array::from(ciphertext.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"iv".into(),   &js_sys::Uint8Array::from(iv.as_slice()).into())?;
    js_sys::Reflect::set(&obj, &"key".into(),  &js_sys::Uint8Array::from(key.as_slice()).into())?;

    Ok(obj)
}

// Decryption with password
#[wasm_bindgen]
pub fn decrypt_with_password(ciphertext: &[u8], iv: &[u8], salt: &[u8], password: &str,) -> Result<js_sys::Uint8Array, JsValue> {
    
    let key = derive_key_argon2id(password, salt)
        .map_err(|e| JsValue::from_str(&e))?;

    let plaintext = aes_decrypt(ciphertext, &key, iv)
        .map_err(|e| JsValue::from_str(&e))?;

    Ok(js_sys::Uint8Array::from(plaintext.as_slice()))
}

// Decryption with direct key
#[wasm_bindgen]
pub fn decrypt_with_key(ciphertext: &[u8], iv: &[u8], key: &[u8]) -> Result<js_sys::Uint8Array, JsValue> {

    let plaintext = aes_decrypt(ciphertext, key, iv)
        .map_err(|e| JsValue::from_str(&e))?;

    Ok(js_sys::Uint8Array::from(plaintext.as_slice()))
}

// Generate random bytes for use in JS
#[wasm_bindgen]
pub fn random_bytes(n: usize) -> js_sys::Uint8Array {
    let bytes = rand_bytes(n);
    js_sys::Uint8Array::from(bytes.as_slice())
}
