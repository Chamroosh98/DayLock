use serde::{Deserialize, Serialize};

pub const MAX_PASTE_SIZE: usize = 512 * 1024;
pub const MAX_TTL: u64 = 30 * 24 * 3600;
pub const MIN_TTL: u64 = 3600;

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct E2EMessage {
    pub ciphertext:    String,
    pub nonce:         String,
    pub ephemeral_pub: String,
    pub timestamp:     u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct PasteStore {
    pub data:            Vec<u8>,
    pub iv:              Vec<u8>,
    pub salt:            Option<Vec<u8>>,
    pub created:         u64,
    pub expires_at:      u64,
    pub burn_after_read: bool,
    pub max_views:       Option<u32>,
    pub views:           u32,
    pub has_password:    bool,

    // ── HoneyPot ──
    pub honey_data: Option<Vec<u8>>,
    pub honey_iv:   Option<Vec<u8>>,
    pub honey_salt: Option<Vec<u8>>,
    pub has_honey:  bool,

    // ── Geo-Lock ──
    pub allowed_countries: Option<Vec<String>>,

    // ── Dead Man's Switch ──
    pub dead_mans_interval: Option<u64>,
    pub last_accessed:      Option<u64>,

    // ── Canary Token ──
    pub canary_url: Option<String>,

    // ── Time-Lock ──
    pub unlock_at: Option<u64>,

    // ── Self-Destruct ──
    pub self_destruct_hides:    Option<u32>,
    pub self_destruct_triggers: Option<String>,

    // ── Decoy Mode ──
    pub decoy_content: Option<String>,
    pub has_decoy:     bool,

    // ── ASN Lock ──
    pub block_asns: Option<Vec<String>>,
    pub allow_asns: Option<Vec<String>>,

    // ── E2E Channel ──
    pub is_e2e_channel: Option<bool>,
    pub e2e_public_key: Option<String>,
    pub e2e_messages:   Option<Vec<E2EMessage>>,
}

#[derive(Deserialize)]
pub struct CreatePasteRequest {
    pub data:            Vec<u8>,
    pub iv:              Vec<u8>,
    pub salt:            Option<Vec<u8>>,
    pub expires_in:      u64,
    pub burn_after_read: bool,
    pub max_views:       Option<u32>,
    pub has_password:    bool,

    // ── HoneyPot ──
    pub honey_data: Option<Vec<u8>>,
    pub honey_iv:   Option<Vec<u8>>,
    pub honey_salt: Option<Vec<u8>>,
    pub has_honey:  Option<bool>,

    // ── Geo-Lock ──
    pub allowed_countries: Option<Vec<String>>,

    // ── Dead Man's Switch ──
    pub dead_mans_interval: Option<u64>,

    // ── Canary Token ──
    pub canary_url: Option<String>,

    // ── Time-Lock ──
    pub unlock_at: Option<u64>,

    // ── Self-Destruct ──
    pub self_destruct_hides:    Option<u32>,
    pub self_destruct_triggers: Option<String>,

    // ── Decoy Mode ──
    pub has_decoy:     Option<bool>,
    pub decoy_content: Option<String>,

    // ── ASN Lock ──
    pub block_asns: Option<Vec<String>>,
    pub allow_asns: Option<Vec<String>>,

    // ── E2E Channel ──
    pub is_e2e_channel: Option<bool>,
    pub e2e_public_key: Option<String>,
}

#[derive(Serialize)]
pub struct CreatePasteResponse {
    pub id:         String,
    pub expires_at: u64,
}

#[derive(Serialize)]
pub struct GetPasteResponse {
    pub id:              String,
    pub data:            Vec<u8>,
    pub iv:              Vec<u8>,
    pub salt:            Option<Vec<u8>>,
    pub has_password:    bool,
    pub burn_after_read: bool,
    pub views:           u32,
    pub created:         u64,
    pub expires_at:      u64,

    // ── HoneyPot ──
    pub honey_data: Option<Vec<u8>>,
    pub honey_iv:   Option<Vec<u8>>,
    pub honey_salt: Option<Vec<u8>>,
    pub has_honey:  bool,

    // ── Geo-Lock ──
    pub geo_locked:        bool,
    pub allowed_countries: Option<Vec<String>>,

    // ── Dead Man's Switch ──
    pub dead_mans_interval: Option<u64>,
    pub last_accessed:      Option<u64>,

    // ── Canary Token ──
    pub canary_has_token: bool,

    // ── Time-Lock ──
    pub unlock_at: Option<u64>,

    // ── Self-Destruct ──
    pub self_destruct_hides:    Option<u32>,
    pub self_destruct_triggers: Option<String>,

    // ── Decoy Mode ──
    pub decoy_content: Option<String>,
    pub has_decoy:     bool,

    // ── ASN Lock ──
    pub block_asns: Option<Vec<String>>,
    pub allow_asns: Option<Vec<String>>,

    // ── ASN Lock ──
    pub asn_locked: bool,

    // ── E2E Channel ──
    pub e2e_messages: Option<Vec<E2EMessage>>,
}
