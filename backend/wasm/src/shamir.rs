use wasm_bindgen::prelude::*;
use sharks::{ Share, Sharks };
use rand::SeedableRng;
use rand::rngs::StdRng;

fn getrandom_rng() -> StdRng {
    let mut seed = [0u8; 32];
    getrandom::getrandom(&mut seed).expect("❌ [wasm ERROR in shamir.rs] rng Failed!");
    StdRng::from_seed(seed)
}

fn to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}",b)).collect()
}

fn from_hex(s: &str) -> Result<Vec<u8>, String> {

    if s.len() % 2 != 0 {
        return Err("❌ [wasm ERROR in shamir.rs] Hex invalid length!".to_string());
    }

    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i+2], 16)
            .map_err(|_| format!("❌ [wasm ERROR in shamir.rs] Invalid hex at position")))
        .collect()
}

// Divide secret into N shares
// threshold : minimum share for reconstruction (k)
// Total: total number of shares (n)
#[wasm_bindgen]
pub fn split_secret(secret: &str, threshold: u8, total: u8) -> Result<js_sys::Array, JsValue> {

    if threshold < 2 {
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] Threshold must be atleast 2!"));
    }

    if total < threshold {
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] Total number of shares must be >= threshold!"));
    }
    #[allow(unused_comparisons)]
    if total > 255 { 
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] Maximum 255 characters for share allowed!"));
    }

    if secret.is_empty() {
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] The secrect cannot empty!"));
    }

    if secret.len() > 256 {
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] The secret must be max = 256"));
    }

    let sharks = Sharks(threshold);
    let secret_bytes = secret.as_bytes();
    let mut rng = getrandom_rng();
    let shares: Vec<Share> = sharks.dealer_rng(secret_bytes, &mut rng).take(total as usize).collect();

    let result = js_sys::Array::new();

    for share in &shares {
        let bytes: Vec<u8> = share.into();
        result.push(&JsValue::from_str(&to_hex(&bytes)));
    }

    Ok(result)

}


// Recontruction secret from K share
#[wasm_bindgen]
pub fn combine_shares(shares_hex: js_sys::Array) -> Result<String, JsValue> {
    
    if shares_hex.length() < 2 {
        return Err(JsValue::from_str("❌ [wasm ERROR in shamir.rs] At least 2 shares required!"));
    }

    let mut shares: Vec<Share> = Vec::new();

    for i in 0..shares_hex.length() {

        let hex = shares_hex.get(i).as_string()
            .ok_or_else(|| JsValue::from_str("❌ [wasm ERROR in shamir.rs] The share must be string!"))?;

        let bytes = from_hex(&hex)
            .map_err(|e| JsValue::from_str(&e))?;

        let share = Share::try_from(bytes.as_slice())
            .map_err(|_| JsValue::from_str("❌ [wasm ERROR in shamir.rs] The share is invalid!"))?;

        shares.push(share);
    }

    let sharks = Sharks(shares.len() as u8);
    let secret_bytes = sharks.recover(&shares)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in shamir.rs] Rebuild Failed! -- shares are incorrect or insufficient!"))?;

    String::from_utf8(secret_bytes)
        .map_err(|_| JsValue::from_str("❌ [wasm ERROR in shamir.rs] The Utf-8 outout is invalid!"))

}

// Validate a share hex
#[wasm_bindgen]
pub fn validate_share(share_hex: &str) -> bool {

    if let Ok(bytes) = from_hex(share_hex) {
        Share::try_from(bytes.as_slice()).is_ok()
    } else {
        false
    }
}
