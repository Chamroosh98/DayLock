pub mod paste;
pub mod file;

use serde::Serialize;

// Error Response -- common to all handler
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl ErrorResponse {
    pub fn new(msg: impl Into<String>) -> Self {
        Self { error: msg.into() }
    }
}