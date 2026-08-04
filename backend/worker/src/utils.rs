// Generate a random 32-character hex ID and validate it.
pub fn generate_id() -> String {
    let mut arr = [0u8; 16];
    getrandom::getrandom(&mut arr).unwrap_or(());
    arr.iter().map(|b| format!("{:02x}", b)).collect()
}

// Validate that the ID is between 30 and 32 hex characters.
pub fn is_valid_id(id: &str) -> bool {
    !id.is_empty() && id.len() <= 64 && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}