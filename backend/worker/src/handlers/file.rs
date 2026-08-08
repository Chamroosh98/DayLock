use worker::{Date, Env, Request, Response, Result};

use crate::models::{ErrorResponse, file::*};
use crate::storage::b2::B2Client;
use crate::utils::{generate_id, is_valid_id};

pub async fn upload(mut req: Request, env: &Env, ip: &str) -> Result<Response> {
    let body: UploadFileRequest = match req.json().await {
        Ok(b) => b,
        Err(_) => return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] The input JSON is not valid!"))
            .map(|r| r.with_status(400)),
    };

    // ── Validation ──
    if body.data.is_empty() {
        return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] The data is empty"))
            .map(|r| r.with_status(400));
    }

    if body.data.len() > MAX_FILE_SIZE {
        return Response::from_json(&ErrorResponse::new(
            format!("❌ [worker ERROR in file.rs] The file size must not exceed {} bytes", MAX_FILE_SIZE)
        )).map(|r| r.with_status(400));
    }

    if body.iv.len() != 12 {
        return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] IV must be exactly 12 bytes"))
            .map(|r| r.with_status(400));
    }

    let expires_in = body.expires_in.clamp(MIN_TTL, MAX_TTL);
    let now = Date::now().as_millis() / 1000;
    let id = generate_id();

    // ── Selection KV or B2 ──
    let storage = if body.data.len() <= KV_THRESHOLD {
        StorageBackend::Kv
    } else {
        StorageBackend::B2
    };

    worker::console_log!(
        "📂 [worker log in file.rs] [FILE:UPLOAD] id={} ip={} size={} kind={:?} storage={:?}",
        id, ip, body.data.len(), body.kind, storage
    );

    // ── if B2 → upload it! ──
    if storage == StorageBackend::B2 {
        let b2 = B2Client::from_env(env)?;
        b2.upload(&id, body.data.clone()).await?;
        worker::console_log!("📂 [worker log in file.rs] [FILE:B2_UPLOAD] id={} ok", id);
    }

    let meta = FileMeta {
        id: id.clone(),
        kind: body.kind,
        original_name: body.original_name,
        mime_type: body.mime_type,
        size: body.size,
        iv: body.iv,
        salt: body.salt,
        has_password: body.has_password,
        burn_after_read: body.burn_after_read,
        max_views: body.max_views,
        views: 0,
        created: now,
        expires_at: now + expires_in,
        storage: storage.clone(),
        
        inline_data: if storage == StorageBackend::Kv {
            Some(body.data)
        } else {
            None
        },
    };

    let kv = env.kv("DAYLOCK_PASTE_KV")?;
    let meta_json = serde_json::to_string(&meta)
        .map_err(|e| worker::Error::RustError(e.to_string()))?;

    kv.put(&format!("file:{}", id), meta_json)?
        .expiration_ttl(expires_in)
        .execute()
        .await?;

    Response::from_json(&UploadFileResponse {
        id,
        expires_at: meta.expires_at,
        storage,
    })
}

pub async fn download(id: &str, env: &Env, ip: &str) -> Result<Response> {
    if !is_valid_id(id) {
        return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] ID is not valid!"))
            .map(|r| r.with_status(400));
    }

    let kv = env.kv("DAYLOCK_PASTE_KV")?;
    let meta_key = format!("file:{}", id);

    let raw = match kv.get(&meta_key).text().await? {
        Some(v) => v,
        None => return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] File not found or expired!"))
            .map(|r| r.with_status(404)),
    };

    let mut meta: FileMeta = serde_json::from_str(&raw)
        .map_err(|e| worker::Error::RustError(e.to_string()))?;

    let now = Date::now().as_millis() / 1000;

    if now >= meta.expires_at {
        let _ = kv.delete(&meta_key).await;
        return Response::from_json(&ErrorResponse::new("❌ [worker ERROR in file.rs] File expired!"))
            .map(|r| r.with_status(404));
    }

    meta.views += 1;

    worker::console_log!(
        "📂 [worker log in file.rs] [FILE:DOWNLOAD] id={} ip={} views={} storage={:?}",
        id, ip, meta.views, meta.storage
    );

    let data = match &meta.storage {
        StorageBackend::Kv => {
            meta.inline_data.clone().unwrap_or_default()
        }
        StorageBackend::B2 => {
            let b2 = B2Client::from_env(env)?;
            b2.download(id).await?
        }
    };

    // ── burn / max_views ──
    let should_delete = meta.burn_after_read
        || meta.max_views.map_or(false, |m| meta.views >= m);

    if should_delete {
        let _ = kv.delete(&meta_key).await;
        if meta.storage == StorageBackend::B2 {
            let b2 = B2Client::from_env(env)?;
            let _ = b2.delete(id).await;
        }
        worker::console_log!("📂 [worker log in file.rs] [FILE:DELETE] id={} reason=burn_or_max", id);
    } else {
        let remaining = meta.expires_at.saturating_sub(now);
        if remaining > 0 {
            let mut updated = meta.clone();
            updated.inline_data = None;
            let updated_json = serde_json::to_string(&updated)
                .map_err(|e| worker::Error::RustError(e.to_string()))?;
            let _ = kv.put(&meta_key, updated_json)?.expiration_ttl(remaining).execute().await;
        }
    }

    Response::from_json(&DownloadFileResponse {
        data,
        iv: meta.iv,
        salt: meta.salt,
        original_name: meta.original_name,
        mime_type: meta.mime_type,
        kind: meta.kind,
        has_password: meta.has_password,
        burn_after_read: meta.burn_after_read,
        views: meta.views,
        expires_at: meta.expires_at,
    })
}
