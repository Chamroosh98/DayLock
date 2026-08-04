use wasm_bindgen::prelude::*;
use x25519_dalek::{EphemeralSecret, PublicKey, StaticSecret};
use hkdf::Hkdf;
use sha2::Sha256;
use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, KeyInit};
use crate::crypto::rand_bytes;

// ── Helpers ───────────────────────────────────────────────────

fn to_b64(bytes: &[u8]) -> String {
    
    let b64_chars: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    let mut i = 0;
    while i < bytes.len() {
        let b0 = bytes[i] as usize;
        let b1 = if i+1 < bytes.len() { bytes[i+1] as usize } else { 0 };
        let b2 = if i+2 < bytes.len() { bytes[i+2] as usize } else { 0 };
        out.push(b64_chars[b0 >> 2] as char);
        out.push(b64_chars[((b0 & 3) << 4) | (b1 >> 4)] as char);
        if i+1 < bytes.len() {
            out.push(b64_chars[((b1 & 0xf) << 2) | (b2 >> 6)] as char);
        } else { out.push('='); }
        if i+2 < bytes.len() {
            out.push(b64_chars[b2 & 0x3f] as char);
        } else { out.push('='); }
        i += 3;
    }
    out
}

fn from_b64(s: &str) -> Result<Vec<u8>, String> {
    let decode_char = |c: u8| -> Result<u8, String> {
        match c {
            b'A'..=b'Z' => Ok(c - b'A'),
            b'a'..=b'z' => Ok(c - b'a' + 26),
            b'0'..=b'9' => Ok(c - b'0' + 52),
            b'+' => Ok(62),
            b'/' => Ok(63),
            b'=' => Ok(0),
            _ => Err(format!("❌ [wasm ERROR in e2e.rs] Not verified base64 character : {}", c as char)),
        }
    };
    let s = s.trim_end_matches('=');
    let mut out = Vec::with_capacity(s.len() * 3 / 4);
    let bytes = s.as_bytes();
    let mut i = 0;
    while i + 3 < bytes.len() {
        let (a,b,c,d) = (
            decode_char(bytes[i])?,
            decode_char(bytes[i+1])?,
            decode_char(bytes[i+2])?,
            decode_char(bytes[i+3])?,
        );
        out.push((a << 2) | (b >> 4));
        out.push((b << 4) | (c >> 2));
        out.push((c << 6) | d);
        i += 4;
    }
    if i + 2 < bytes.len() {
        let (a,b,c) = (
            decode_char(bytes[i])?,
            decode_char(bytes[i+1])?,
            decode_char(bytes[i+2])?,
        );
        out.push((a << 2) | (b >> 4));
        out.push((b << 4) | (c >> 2));
    } else if i + 1 < bytes.len() {
        let (a,b) = (decode_char(bytes[i])?, decode_char(bytes[i+1])?);
        out.push((a << 2) | (b >> 4));
    }
    Ok(out)
}

fn hkdf_derive(shared: &[u8], ephemeral_pub: &[u8], recipient_pub: &[u8]) -> [u8; 32] {
    let hk = Hkdf::<Sha256>::new(None, shared);
    let mut info = Vec::with_capacity(64);
    info.extend_from_slice(ephemeral_pub);
    info.extend_from_slice(recipient_pub);
    let mut okm = [0u8; 32];
    hk.expand(&info, &mut okm).expect("❌ [wasm ERROR in e2e.rs] HKDF expand failed");
    okm
}

// ── Public WASM API ───────────────────────────────────────────

#[wasm_bindgen]
pub fn e2e_gen_keypair() -> Result<js_sys::Object, JsValue> {
    let secret = StaticSecret::random_from_rng(&mut rand::rngs::OsRng);
    let public = PublicKey::from(&secret);

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"public_key".into(),
        &to_b64(public.as_bytes()).into())?;
    js_sys::Reflect::set(&obj, &"private_key".into(),
        &to_b64(secret.as_bytes()).into())?;
    Ok(obj)
}


#[wasm_bindgen]
pub fn e2e_encrypt(message: &str, recipient_public_b64: &str) -> Result<js_sys::Object, JsValue> {
    let map_err = |e: String| JsValue::from_str(&e);

    // decode recipient public key
    let rec_pub_bytes = from_b64(recipient_public_b64).map_err(map_err)?;
    if rec_pub_bytes.len() != 32 {
        return Err(JsValue::from_str("❌ [wasm ERROR in e2e.rs] The public_key doesn't valid! this must be 32 characters!"));
    }
    let mut rec_pub_arr = [0u8; 32];
    rec_pub_arr.copy_from_slice(&rec_pub_bytes);
    let recipient_pub = PublicKey::from(rec_pub_arr);

    // ephemeral keypair 
    let eph_secret = EphemeralSecret::random_from_rng(&mut rand::rngs::OsRng);
    let eph_pub    = PublicKey::from(&eph_secret);

    // ECDH → shared secret
    let shared = eph_secret.diffie_hellman(&recipient_pub);

    // HKDF
    let aes_key = hkdf_derive(shared.as_bytes(), eph_pub.as_bytes(), &rec_pub_arr);

    // AES-256-GCM encrypt
    let nonce_bytes = rand_bytes(12);
    let key    = Key::<Aes256Gcm>::from_slice(&aes_key);
    let cipher = Aes256Gcm::new(key);
    let nonce  = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher.encrypt(nonce, message.as_bytes())
        .map_err(|e| JsValue::from_str(&format!("❌ [wasm ERROR in e2e.rs] Failed encryption : {}", e)))?;

    let obj = js_sys::Object::new();
    js_sys::Reflect::set(&obj, &"ciphertext".into(),   &to_b64(&ciphertext).into())?;
    js_sys::Reflect::set(&obj, &"nonce".into(),        &to_b64(&nonce_bytes).into())?;
    js_sys::Reflect::set(&obj, &"ephemeral_pub".into(),&to_b64(eph_pub.as_bytes()).into())?;
    Ok(obj)
}

#[wasm_bindgen]
pub fn e2e_decrypt(
    ciphertext_b64: &str,
    nonce_b64: &str,
    ephemeral_pub_b64: &str,
    private_key_b64: &str,
) -> Result<String, JsValue> {
    let map_err = |e: String| JsValue::from_str(&e);

    let ciphertext  = from_b64(ciphertext_b64).map_err(map_err)?;
    let nonce_bytes = from_b64(nonce_b64).map_err(map_err)?;
    let eph_bytes   = from_b64(ephemeral_pub_b64).map_err(map_err)?;
    let priv_bytes  = from_b64(private_key_b64).map_err(map_err)?;

    if nonce_bytes.len() != 12 {
        return Err(JsValue::from_str("❌ [wasm ERROR in e2e.rs] Not verified nonce!"));
    }
    if eph_bytes.len() != 32 {
        return Err(JsValue::from_str("❌ [wasm ERROR in e2e.rs] Not verified ephemeral_pub!"));
    }
    if priv_bytes.len() != 32 {
        return Err(JsValue::from_str("❌ [wasm ERROR in e2e.rs] Not verified private_key!"));
    }

    let mut priv_arr = [0u8; 32];
    priv_arr.copy_from_slice(&priv_bytes);
    let my_secret = StaticSecret::from(priv_arr);

    let mut eph_arr = [0u8; 32];
    eph_arr.copy_from_slice(&eph_bytes);
    let eph_pub = PublicKey::from(eph_arr);

    // ECDH
    let shared = my_secret.diffie_hellman(&eph_pub);

    // public key 
    let my_pub = PublicKey::from(&my_secret);

    // HKDF
    let aes_key = hkdf_derive(shared.as_bytes(), &eph_bytes, my_pub.as_bytes());

    // AES-256-GCM decrypt
    let key    = Key::<Aes256Gcm>::from_slice(&aes_key);
    let cipher = Aes256Gcm::new(key);
    let nonce  = Nonce::from_slice(&nonce_bytes);
    let plaintext = cipher.decrypt(nonce, ciphertext.as_slice())
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in e2e.rs] Decryption Failed! - the key is wrong OR the message was corrupted!"))?;

    String::from_utf8(plaintext)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in e2e.rs] The message isn't UTF-8!"))
}
