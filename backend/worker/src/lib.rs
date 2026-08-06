mod handlers;
mod middleware;
mod models;
mod storage;
mod utils;

use models::ErrorResponse;
use worker::*;

const PASTE_PREFIX: &str = "/api/paste/";
const FILE_PREFIX:  &str = "/api/file/";

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    let rate_kv = env.kv("RATE_LIMIT_KV")?;
    let path = req.path();

    let ip = req.headers().get("CF-Connecting-IP")?
        .unwrap_or_else(|| "unknown".to_string());
    let api_key = req.headers().get("X-API-Key")?
        .unwrap_or_else(|| "anonymous".to_string());

    console_log!("📂 [worker log in lib.rs] {} {} ip={}", req.method().to_string(), path, ip);

    // ── Rate Limiting ──
    if let Some(blocked) = middleware::rate_limit::check_ip_and_key(
        &rate_kv, &ip, &api_key,
    ).await? {
        return Response::from_json(&ErrorResponse::new(
            format!("❌ [worker ERROR in lib.rs]  This IP has exceeded the rate limit! ({})", blocked)
        )).map(|r| r.with_status(429));
    }

    // ── CORS preflight ──
    if req.method() == Method::Options {
        let headers = Headers::new();
        headers.set("Access-Control-Allow-Origin", "*")?;
        headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")?;
        headers.set("Access-Control-Allow-Headers", "Content-Type, X-API-Key")?;
        return Ok(Response::empty()?.with_headers(headers));
    }

    // ── Paste API ──
    if req.method() == Method::Post && path == "/api/paste" {
        return handlers::paste::create(req, &env, &ip).await;
    }
    if req.method() == Method::Get && path.starts_with(PASTE_PREFIX) {
        let id = &path[PASTE_PREFIX.len()..];
        console_log!("📂 [worker log in lib.rs] paste id={}", id);
        return handlers::paste::get(id, &env, &req, &ip).await;
    }

    // ── E2E Message ──
    if req.method() == Method::Post && path.starts_with(PASTE_PREFIX) && path.ends_with("/e2e") {
        let id = path.trim_start_matches(PASTE_PREFIX).trim_end_matches("/e2e");
        return handlers::paste::add_e2e_message(id, req, &env).await;
    }

    // ── Delete (Self-Destruct) ──
    if req.method() == Method::Delete && path.starts_with(PASTE_PREFIX) {
        let id = &path[PASTE_PREFIX.len()..];
        return handlers::paste::delete(id, &env, &ip).await;
    }

    // ── File API ──
    if req.method() == Method::Post && path == "/api/file" {
        return handlers::file::upload(req, &env, &ip).await;
    }
    if req.method() == Method::Get && path.starts_with(FILE_PREFIX) {
        let id = &path[FILE_PREFIX.len()..];
        console_log!("📂 [worker log in lib.rs]  file id={}", id);
        return handlers::file::download(id, &env, &ip).await;
    }

    // ── WASM pkg ── 👉👉👉👉 Enable this when JUST for Local Testing! 👈👈👈👈
    // if req.method() == Method::Get && (path == "/pkg/wasm.js" || path == "/wasm.js") {
    //     let content = include_str!("../pkg/wasm.js");
    //     let headers = Headers::new();
    //     headers.set("Content-Type", "application/javascript")?;
    //     return Ok(Response::ok(content)?.with_headers(headers));
    // }
    
    // if req.method() == Method::Get && (path == "/pkg/wasm_bg.wasm" || path == "/wasm_bg.wasm") {
    //     let bytes = include_bytes!("../pkg/wasm_bg.wasm");
    //     let headers = Headers::new();
    //     headers.set("Content-Type", "application/wasm")?;
    //     return Ok(Response::from_bytes(bytes.to_vec())?.with_headers(headers));
    // }

    // ── Static Assets (UI) ──
    let assets = env.assets("ASSETS")?;
    return assets.fetch_request(req).await;

}
