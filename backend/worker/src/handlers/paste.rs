use worker::{Date, Env, Request, Response, Result};
use crate::models::{ErrorResponse, paste::*};
use serde::Serialize;

#[derive(Serialize)]
struct GeoBlockedResponse {
    error: String,
    blocked: bool,
    your_country: String,
    allowed_countries: Vec<String>,
}
use crate::utils::{generate_id, is_valid_id};
use crate::handlers::features::geo_lock;
use crate::handlers::features::dead_mans_switch as dms;
use crate::handlers::features::canary;
use crate::handlers::features::time_lock;
use crate::handlers::features::asn_lock;

pub async fn create(mut req: Request, env: &Env, ip: &str) -> Result<Response> {
    let body: CreatePasteRequest = match req.json().await {
        Ok(b) => b,
        Err(e) => {
            worker::console_log!("❌ [worker handlers ERROR in paste.rs] [PASTE:CREATE] JSON parse error : {}", e);
            return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The input JSON isn't valid!"))
                .map(|r| r.with_status(400));
        }
    };
    worker::console_log!(
        "📂 [worker log in paste.rs] [PASTE:CREATE] data_len={} iv_len={} has_pwd={} has_honey={:?} dms={:?} geo={:?}",
        body.data.len(), body.iv.len(), body.has_password,
        body.has_honey, body.dead_mans_interval, body.allowed_countries
    );

    // ── Validation ──
    if body.data.is_empty() || body.data.len() > MAX_PASTE_SIZE {
        return Response::from_json(&ErrorResponse::new(
            format!("❌ [worker handlers ERROR in paste.rs] The value of data must be between 1 and {} bytes!", MAX_PASTE_SIZE)
        )).map(|r| r.with_status(400));
    }
    if body.iv.len() != 12 {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] IV must be exactly 12 bytes!"))
            .map(|r| r.with_status(400));
    }
    if body.has_password && body.salt.is_none() {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] A salt is required for password-protected pastes!"))
            .map(|r| r.with_status(400));
    }

    // ──  HoneyPot ──
    let has_honey = body.has_honey.unwrap_or(false);
    if has_honey {
        if body.honey_data.is_none() || body.honey_iv.is_none() || body.honey_salt.is_none() {
            return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The HoneyPot data is incomplete!"))
                .map(|r| r.with_status(400));
        }
    }

    let now = Date::now().as_millis() / 1000;

    // ──  Geo-Lock ──
    if let Some(ref countries) = body.allowed_countries {
        if let Err(e) = geo_lock::validate_countries(countries) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] Geo Lock : {}", e)))
                .map(|r| r.with_status(400));
        }
    }

    // ──  Time-Lock ──
    if let Some(unlock_at) = body.unlock_at {
        if let Err(e) = time_lock::validate(unlock_at, now) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] Time Lock : {}", e)))
                .map(|r| r.with_status(400));
        }
    }

    // ──  ASN Lock ──
    if let Some(ref asns) = body.block_asns {
        if let Err(e) = asn_lock::validate_asns(asns) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] ASN Lock [block_asns] : {}", e)))
                .map(|r| r.with_status(400));
        }
    }
    if let Some(ref asns) = body.allow_asns {
        if let Err(e) = asn_lock::validate_asns(asns) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] ASN Lock [allow_asns] : {}", e)))
                .map(|r| r.with_status(400));
        }
    }

    // ──  Decoy Mode ──
    let has_decoy = body.has_decoy.unwrap_or(false);
    if has_decoy {
        if let Some(ref dc) = body.decoy_content {
            if dc.len() > 10_000 {
                return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The decoy content is a maximum of 10,000 characters! "))
                    .map(|r| r.with_status(400));
            }
        } else {
            return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The decoy content is empty! "))
                .map(|r| r.with_status(400));
        }
    }

    // ──  Canary Token ──
    if let Some(ref url) = body.canary_url {
        if let Err(e) = canary::validate_url(url) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] Canary Token : {}", e)))
                .map(|r| r.with_status(400));
        }
    }

    // ──  Dead Man's Switch ──
    if let Some(interval) = body.dead_mans_interval {
        if let Err(e) = dms::validate_interval(interval) {
            return Response::from_json(&ErrorResponse::new(format!("❌ [worker handlers ERROR in paste.rs] Dead Man's Switch : {}", e)))
                .map(|r| r.with_status(400));
        }
    }

    let expires_in = body.expires_in.clamp(MIN_TTL, MAX_TTL);
    let id = generate_id();

    let paste = PasteStore {
        data: body.data,
        iv: body.iv,
        salt: body.salt,
        created: now,
        expires_at: now + expires_in,
        burn_after_read: body.burn_after_read,
        max_views: body.max_views,
        views: 0,
        has_password: body.has_password,
        honey_data: body.honey_data,
        honey_iv: body.honey_iv,
        honey_salt: body.honey_salt,
        has_honey,
        allowed_countries: body.allowed_countries.clone(),
        dead_mans_interval: body.dead_mans_interval,
        last_accessed: Some(now),
        canary_url: body.canary_url.clone(),
        unlock_at: body.unlock_at,
        self_destruct_hides: body.self_destruct_hides,
        self_destruct_triggers: body.self_destruct_triggers.clone(),
        block_asns: body.block_asns.clone(),
        allow_asns: body.allow_asns.clone(),
        is_e2e_channel: body.is_e2e_channel,
        e2e_public_key: body.e2e_public_key.clone(),
        e2e_messages: Some(Vec::new()),
        decoy_content: body.decoy_content.clone(),
        has_decoy,
    };

    let kv = env.kv("DAYLOCK_PASTE_KV")?;
    let json = serde_json::to_string(&paste)
        .map_err(|e| worker::Error::RustError(e.to_string()))?;

    kv.put(&id, json)?.expiration_ttl(expires_in).execute().await?;

    worker::console_log!(
        "📂 [worker log in paste.rs] [PASTE:CREATE] id={} ip={} ttl={} burn={} pwd={} honey={} geo={:?} dms={:?}",
        id, ip, expires_in, paste.burn_after_read,
        paste.has_password, paste.has_honey,
        paste.allowed_countries,
        paste.dead_mans_interval.map(|i| dms::format_interval(i))
    );

    Response::from_json(&CreatePasteResponse {
        id,
        expires_at: paste.expires_at,
    })
}

pub async fn get(id: &str, env: &Env, req: &Request, ip: &str) -> Result<Response> {
    if !is_valid_id(id) {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The ID is invalid!"))
            .map(|r| r.with_status(400));
    }

    let kv = env.kv("DAYLOCK_PASTE_KV")?;

    let raw = match kv.get(id).text().await? {
        Some(v) => v,
        None => {
            worker::console_log!("📂 [worker log in paste.rs] [PASTE:GET] not_found id={} ip={}", id, ip);
            return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The Paste not found or expired!"))
                .map(|r| r.with_status(404));
        }
    };

    let mut paste: PasteStore = serde_json::from_str(&raw)
        .map_err(|e| worker::Error::RustError(e.to_string()))?;

    // ──  انقضا ──
    let now = Date::now().as_millis() / 1000;
    if now >= paste.expires_at {
        let _ = kv.delete(id).await;
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The Paste expired!"))
            .map(|r| r.with_status(404));
    }

    // ──  Time-Lock ──
    match time_lock::check(now, paste.unlock_at) {
        time_lock::TimeLockResult::Locked { unlock_at, remaining } => {
            worker::console_log!(
                "📂 [worker log in paste.rs] [TIME-LOCK] id={} unlock_at={} remaining={}s",
                id, unlock_at, remaining
            );
            return Response::from_json(&serde_json::json!({
                "error": "❌ [worker handlers ERROR in paste.rs] This paste is still locked!",
                "time_locked": true,
                "unlock_at": unlock_at,
                "remaining": remaining,
                "remaining_human": time_lock::format_remaining(remaining),
            })).map(|r| r.with_status(423)); // 423 Locked
        }
        time_lock::TimeLockResult::Unlocked | time_lock::TimeLockResult::Disabled => {}
    }

    // ──  Dead Man's Switch ──
    match dms::check(now, paste.last_accessed, paste.dead_mans_interval) {
        dms::DeadMansResult::Triggered { last_accessed, interval } => {
            worker::console_log!(
                "📂 [worker log in paste.rs] [DMS:TRIGGERED] id={} last_accessed={} interval={}",
                id, last_accessed, dms::format_interval(interval)
            );
            let _ = kv.delete(id).await;
            return Response::from_json(&serde_json::json!({
                "error": "❌ [worker handlers ERROR in paste.rs] This paste was deleted — Dead Man's Switch activated!",
                "dead_mans": true,
                "last_accessed": last_accessed,
                "interval": interval,
                "interval_human": dms::format_interval(interval),
            })).map(|r| r.with_status(410)); // 410 Gone
        }
        dms::DeadMansResult::Alive | dms::DeadMansResult::Disabled => {}
    }

    // ──  Geo-Lock — قبل از increment views ──
    match geo_lock::check(req, &paste.allowed_countries) {
        geo_lock::GeoCheckResult::Blocked { country, allowed } => {
            worker::console_log!(
                "📂 [worker log in paste.rs] [GEO-LOCK] id={} ip={} country={} allowed={:?}",
                id, ip, country, allowed
            );
            return Response::from_json(&GeoBlockedResponse {
                error: format!(
                    "❌ [worker handlers ERROR in paste.rs] Access from {} is not allowed!",
                    geo_lock::country_name(&country)
                ),
                blocked: true,
                your_country: country.clone(),
                allowed_countries: allowed.clone(),
            }).map(|r| r.with_status(403));
        }
        geo_lock::GeoCheckResult::UnknownCountry => {
            // اگه Geo-Lock فعاله و کشور ناشناسه → بلاک
            if paste.allowed_countries.as_ref().map_or(false, |l| !l.is_empty()) {
                worker::console_log!("📂 [worker log in paste.rs] [GEO-LOCK] unknown country, blocking id={}", id);
                return Response::from_json(&GeoBlockedResponse {
                    error: "❌ [worker handlers ERROR in paste.rs] Your country was not detected — access blocked!".to_string(),
                    blocked: true,
                    your_country: "XX".to_string(),
                    allowed_countries: paste.allowed_countries.clone().unwrap_or_default(),
                }).map(|r| r.with_status(403));
            }
        }
        geo_lock::GeoCheckResult::Allowed => {}
    }

    // ──  ASN Lock ──
    match asn_lock::check(req, &paste.block_asns, &paste.allow_asns) {
        asn_lock::AsnCheckResult::Blocked { asn, asn_name } => {
            worker::console_log!("📂 [worker log in paste.rs] [ASN-LOCK] id={} ip={} asn={} name={}", id, ip, asn, asn_name);
            return Response::from_json(&serde_json::json!({
                "error": format!("❌ [worker handlers ERROR in paste.rs] Access from {} ({}) is blocked!", asn_name, asn),
                "blocked": true,
                "your_asn": asn,
                "asn_name": asn_name,
            })).map(|r| r.with_status(403));
        }
        asn_lock::AsnCheckResult::UnknownAsn => {
            let has_asn_lock = paste.block_asns.as_ref().map_or(false, |l| !l.is_empty())
                || paste.allow_asns.as_ref().map_or(false, |l| !l.is_empty());
            if has_asn_lock {
                return Response::from_json(&serde_json::json!({
                    "error": "❌ [worker handlers ERROR in paste.rs] Your ASN was not recognized — access blocked!",
                    "blocked": true,
                })).map(|r| r.with_status(403));
            }
        }
        asn_lock::AsnCheckResult::Allowed => {}
    }

    paste.views += 1;

    worker::console_log!(
        "📂 [worker log in paste.rs] [PASTE:GET] id={} ip={} views={} burn={} geo={:?}",
        id, ip, paste.views, paste.burn_after_read, paste.allowed_countries
    );

    let should_delete = paste.burn_after_read
        || paste.max_views.map_or(false, |m| paste.views >= m);

    // ── Canary Token — fire and forget ──
    if let Some(ref webhook_url) = paste.canary_url {
        if !webhook_url.is_empty() {
            canary::fire(webhook_url, id, ip, req, paste.views, now).await;
        }
    }

    if should_delete {
        let _ = kv.delete(id).await;
    } else {
        paste.last_accessed = Some(now);
        let remaining = paste.expires_at.saturating_sub(now);
        if remaining > 0 {
            let updated = serde_json::to_string(&paste)
                .map_err(|e| worker::Error::RustError(e.to_string()))?;
            let _ = kv.put(id, updated)?.expiration_ttl(remaining).execute().await;
        }
    }

    Response::from_json(&GetPasteResponse {
        id: id.to_string(),
        data: paste.data,
        iv: paste.iv,
        salt: paste.salt,
        has_password: paste.has_password,
        burn_after_read: paste.burn_after_read,
        views: paste.views,
        created: paste.created,
        expires_at: paste.expires_at,
        honey_data: paste.honey_data,
        honey_iv: paste.honey_iv,
        honey_salt: paste.honey_salt,
        has_honey: paste.has_honey,
        geo_locked: paste.allowed_countries.as_ref().map_or(false, |l| !l.is_empty()),
        allowed_countries: paste.allowed_countries,
        asn_locked: paste.block_asns.as_ref().map_or(false, |l| !l.is_empty())
            || paste.allow_asns.as_ref().map_or(false, |l| !l.is_empty()),
        block_asns: paste.block_asns.clone(),
        allow_asns: paste.allow_asns.clone(),
        dead_mans_interval: paste.dead_mans_interval,
        last_accessed: paste.last_accessed,
        canary_has_token: paste.canary_url.as_ref().map_or(false, |u| !u.is_empty()),
        unlock_at: paste.unlock_at,
        self_destruct_hides: paste.self_destruct_hides,
        self_destruct_triggers: paste.self_destruct_triggers.clone(),
        e2e_messages: paste.e2e_messages.clone(),
        decoy_content: paste.decoy_content.clone(),
        has_decoy: paste.has_decoy,
    })
}

/// حذف paste — برای Self-Destruct on Screenshot
pub async fn delete(id: &str, env: &Env, ip: &str) -> Result<Response> {
    if !is_valid_id(id) {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The ID is invalid!"))
            .map(|r| r.with_status(400));
    }

    let kv = env.kv("DAYLOCK_PASTE_KV")?;

    match kv.get(id).text().await? {
        None => {
            return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The Paste not found!"))
                .map(|r| r.with_status(404));
        }
        Some(_) => {
            let _ = kv.delete(id).await;
            worker::console_log!("📂 [worker log in paste.rs] [PASTE:DELETE] id={} ip={} reason=self-destruct", id, ip);
            Response::from_json(&serde_json::json!({
                "ok": true,
                "message": "📂 [worker log in paste.rs] The paste deleted!"
            }))
        }
    }
}

/// اضافه کردن پیام E2E به channel
pub async fn add_e2e_message(id: &str, mut req: Request, env: &Env) -> Result<Response> {
    if !is_valid_id(id) {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] The ID is invalid!"))
            .map(|r| r.with_status(400));
    }

    #[derive(serde::Deserialize)]
    struct E2EPayload { e2e_message: crate::models::paste::E2EMessage }

    let body: E2EPayload = req.json().await
        .map_err(|_| worker::Error::RustError("❌ [worker handlers ERROR in paste.rs] Invalid body!".to_string()))?;

    let kv = env.kv("DAYLOCK_PASTE_KV")?;
    let raw = match kv.get(id).text().await? {
        Some(v) => v,
        None => return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] Channel not found!"))
            .map(|r| r.with_status(404)),
    };

    let mut paste: PasteStore = serde_json::from_str(&raw)
        .map_err(|e| worker::Error::RustError(e.to_string()))?;

    if !paste.is_e2e_channel.unwrap_or(false) {
        return Response::from_json(&ErrorResponse::new("❌ [worker handlers ERROR in paste.rs] This paste isn't an E2E channel!"))
            .map(|r| r.with_status(400));
    }

    let msgs = paste.e2e_messages.get_or_insert_with(Vec::new);
    msgs.push(body.e2e_message);
    
    if msgs.len() > 100 { msgs.drain(0..msgs.len()-100); }

    let now = Date::now().as_millis() / 1000;
    let remaining = paste.expires_at.saturating_sub(now);
    if remaining > 0 {
        let updated = serde_json::to_string(&paste)
            .map_err(|e| worker::Error::RustError(e.to_string()))?;
        kv.put(id, updated)?.expiration_ttl(remaining).execute().await?;
    }

    Response::from_json(&serde_json::json!({ "ok": true }))
}
