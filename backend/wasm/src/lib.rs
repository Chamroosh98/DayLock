mod crypto;
mod stego;
mod file;
mod shamir;
mod audio_stego;
mod e2e;

use wasm_bindgen::prelude::*;

// wasm module version
#[wasm_bindgen]
pub fn version() -> String {
    "🛡️ DayLock WASM v1.0.0".to_string()
}

// Setup panic handler for better debugging
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}
