use worker::{ Fetch, Headers, Method, Request, RequestInit, Url, wasm_bindgen};
use serde::Serialize;

// Sended payload into webhook
#[derive(Serialize)]
pub struct CanaryPayload {
    pub event: &'static str,        // carany.triggerd
    pub pasted_id: String,
    pub timestamp: u64,
    pub ip: String,
    pub country: String,
    pub user_agent: String,
    pub views: u32,
    pub message: String,
}


// Webhook URL validation
pub fn validate_url(url: &str) -> Result<(), String> {
    
    if url.is_empty() {
        return Ok(());    // Optional
    }

    if url.len() > 512 {
        return Err("❌ [worker ERROR in canary.rs] Webhook URL is toO long (maximum 512 characters!".to_string());
    }

    if !url.starts_with("https://") {
        return Err("❌ [worker ERROR in canary.rs] The webhook URL must start with https://".to_string());
    }

    // Prevent SSRF -> internal IPs are not allowed!
    let blocked = ["localhost", "127.", "10.", "192.168.", "172.16.", "0.0.0.0", "::1"];
    let lower = url.to_lowercase();

    for b in &blocked {
        if lower.contains(b) {
            return Err("❌ [worker ERROR in canary.rs] Webhook URL cannot point to an internal address!".to_string());
        }
    }

    Ok(())
}

// Send canary notification - fire and forget
// The errors doesn't block paste! just logged!
pub async fn fire(webhook_url: &str, paste_id: &str, ip: &str, req: &Request, views: u32, now: u64) {

    if webhook_url.is_empty() {
        return ;
    }

    let country = req.headers().get("CF-IPCountry")
        .ok().flatten()
        .unwrap_or_else(|| "XX".to_string());

    let user_agent = req.headers().get("User-Agent")
        .ok().flatten()
        .unwrap_or_else(|| "unknown".to_string());

    // Shorten User-Agnet fot security
    let user_agent = if user_agent.len() > 200 {
        user_agent[..200].to_string()
    } else {
        user_agent
    };

    let payload = CanaryPayload {
        event: "canary-triggered",
        pasted_id: paste_id.to_string(),
        timestamp: now,
        ip: ip.to_string(),
        country,
        user_agent,
        views,
        message: format!(
            "🐦 [worker log in canary.rs] Canary triggered! Paste '{}' was accessed (view #{}) from {}",
            &paste_id[..8], 
            views, 
            ip
        ),
    };

    let body = match serde_json::to_string(&payload) {
        Ok(b) => b,
        Err(e) => {
            worker::console_log!("❌ [worker ERROR in canary.rs] serialize Error : {}", e);
            return;
        }
    };

    let headers = Headers::new();
    let _ = headers.set("Content-Type", "application/json");
    let _ = headers.set("User-Agent", "SecurePaste-Canary/1.0");
    let _ = headers.set("X-Canary-Event", "pasted.accessed");

    let url = match Url::parse(webhook_url) {
        Ok(u) => u,
        Err(e) => {
            worker::console_log!("❌ [worker ERROR in canary.rs] invalid URL : {}", e);
            return;
        }
    };

    let mut init = RequestInit::new();
    init.with_method(Method::Post)
        .with_headers(headers)
        .with_body(Some(wasm_bindgen::JsValue::from_str(&body)));


    let fetch_req = match Request::new_with_init(url.as_str(), &init) {
        Ok(r) => r,
        Err(e) => {
            worker::console_log!("❌ [worker ERROR in canary.rs] request build error : {} ", e);
            return;
        }
    };

    // fire and forget - timeout : 5s
    match Fetch::Request(fetch_req).send().await {
        Ok(res) => {
            worker::console_log!(
                "🐦 [worker log in canary.rs] fired paste={} ip={} status={}",
                &paste_id[..8],
                ip,
                res.status_code()
            );
        }
        Err(e) => {
            worker::console_log!("❌ [worker ERROR in canary.rs] send error : {}", e);
        }
    }
}
