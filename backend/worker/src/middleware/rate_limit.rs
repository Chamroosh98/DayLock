use worker::{ Date, Result, kv };

pub const RATE_LIMIT_BY_IP: u32 = 30;
pub const RATE_LIMIT_BY_API_KEY: u32 = 60;
pub const WINDOW_SECONDS: u64 = 60;


// Checking a special identifier
pub async fn check(kv: &kv::KvStore, identifier: &str, limit:u32) -> Result<bool> {

    let key = format!("rl:{}", identifier);
    let now = Date::now().as_millis() / 1000;
    let window_start = now - WINDOW_SECONDS;

    let count: u32 = match kv.get(&key).text().await? {
        Some(val) => {
            let parts: Vec<&str> = val.splitn(2, ':').collect();

            if parts.len() == 2 {
                let ts: u64 = parts[0].parse().unwrap_or(0);

                if ts < window_start {
                    0
                }
                else {
                    parts[1].parse().unwrap_or(0)
                }
            }
            else {
                0
            }
        }
        None => 0,
    };

    if count >= limit {
        return Ok(false);
    }

    let new_val= format!("{}:{}", now, count + 1);
    kv.put(&key, new_val)?
        .expiration_ttl(WINDOW_SECONDS)
        .execute()
        .await?;

    Ok(true)
}


// Check IP and API Key -> returns which one blocked!
pub async fn check_ip_and_key(kv: &kv::KvStore, ip: &str, api_key: &str) -> Result<Option<&'static str>> {

    if !check(kv, &format!("ip:{}", ip), RATE_LIMIT_BY_IP).await? {
        return Ok(Some("IP"));
    }

    if api_key != "anonymous" {
        if !check(kv, &format!("key:{}", api_key), RATE_LIMIT_BY_API_KEY).await? {
            return Ok(Some("KEY"));
        }
    }

    Ok(None)
}
