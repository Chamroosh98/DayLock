use serde::{Deserialize, Serialize};

pub const MAX_FILE_SIZE: usize = 100 * 1024 * 1024;  // 100MB
pub const KV_THRESHOLD: usize = 512 * 1024;       
pub const MAX_TTL: u64 = 30 * 24 * 3600;
pub const MIN_TTL: u64 = 3600;


#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum StorageBackend {
    Kv,
    B2,
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum FileKind {
    File,
    Voice,
    Image,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FileMeta {
    pub id: String,
    pub kind: FileKind,
    pub original_name: String,
    pub mime_type: String,
    pub size: usize,
    pub iv: Vec<u8>,
    pub salt: Option<Vec<u8>>,
    pub has_password: bool,
    pub burn_after_read: bool,
    pub max_views: Option<u32>,
    pub views: u32,
    pub created: u64,
    pub expires_at: u64,
    pub storage: StorageBackend,
    pub inline_data: Option<Vec<u8>>,
}

#[derive(Deserialize)]
pub struct UploadFileRequest {
    pub data: Vec<u8>,
    pub iv: Vec<u8>,
    pub salt: Option<Vec<u8>>,
    pub original_name: String,
    pub mime_type: String,
    pub size: usize,
    pub kind: FileKind,
    pub has_password: bool,
    pub burn_after_read: bool,
    pub max_views: Option<u32>,
    pub expires_in: u64,
}

#[derive(Serialize)]
pub struct UploadFileResponse {
    pub id: String,
    pub expires_at: u64,
    pub storage: StorageBackend,
}

#[derive(Serialize)]
pub struct DownloadFileResponse {
    pub data: Vec<u8>,
    pub iv: Vec<u8>,
    pub salt: Option<Vec<u8>>,
    pub original_name: String,
    pub mime_type: String,
    pub kind: FileKind,
    pub has_password: bool,
    pub burn_after_read: bool,
    pub views: u32,
    pub expires_at: u64,
}
