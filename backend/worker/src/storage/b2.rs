use hmac::{ Hmac, Mac };
use sha2::{ Digest, Sha256 };
use worker::{ Env, Fetch, Headers, Method, Request, RequestInit, Result, js_sys, ok::Ok };

type HmacSha256 = Hmac<Sha256>;


// Signature's tools
fn hmac_sign(key: &[u8], msg: &[u8]) -> Vec<u8> {
    
    let mut mac = HmacSha256::new_from_slice(key)
        .expect("HMAC key invalid");

    mac.update(msg);
    mac.finalize().into_bytes().to_vec()
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn sha256_hex(data: &[u8]) -> String {
    hex_encode(&Sha256::digest(data))
}

// B2 Client
pub struct B2Client {
    key_id: String,
    app_key: String,
    bucket: String,
    endpoint: String,
    region: String
}

impl B2Client {
    pub fn from_env(env: &Env) -> Result<Self> {
        Ok(Self { 
            key_id:    env.secret("B2_KEY_ID")?.to_string(), 
            app_key:   env.secret("B2_APP_KEY")?.to_string(), 
            bucket:    env.secret("B2_BUCKET")?.to_string(), 
            endpoint:  env.secret("B2_ENDPOINT")?.to_string(), 
            region:    env.secret("B2_REGION")?.to_string() 
        })
    }

    // Upload
    pub async fn upload(&self, key:&str, data: Vec<u8>) -> Result<()> {

        let url = format!("https://{}/{}/{}", self.endpoint, self.bucket, key);
        let headers = self.sign_headers("PUT", key, &data, "application/octet-stream")?;

        let mut init = RequestInit::new();
        init.with_method(Method::Put)
            .with_headers(headers)
            .with_body(Some(js_sys::Uint8Array::from(data.as_slice()).into()));

        let req = Request::new_with_init(&url, &init)?;
        let mut res = Fetch::Request(req).send().await?;

        if res.status_code() >= 400 {
            let body = res .text().await.unwrap_or_default();

            return Err(worker::Error::RustError(
                format!("❌ [worker storage ERROR in b2.rs] B2 upload ERROR : {} ---- {}", res.status_code(), body)
            ));
        }

        Ok(())
    }

    // Download
    pub async fn download(&self, key: &str)-> Result<Vec<u8>> {

        let url = format!("https://{}/{}/{}", self.endpoint, self.bucket, key);
        let headers = self.sign_headers("GET", key, &[], "application/octet-stream")?;

        let mut init = RequestInit::new();
        init.with_method(Method::Get).with_headers(headers);

        let req = Request::new_with_init(&url, &init)?;
        let mut res = Fetch::Request(req).send().await?;

        if res.status_code() >= 400 {
            return Err(worker::Error::RustError(
                format!("❌ [worker storage ERROR in b2.rs] B2 download ERROR : {}", res.status_code())
            ));
        }

        Ok(res.bytes().await?)
    }

    // Delete
    pub async fn delete(&self, key: &str) -> Result<()> {

        let url = format!("https://{}/{}/{}", self.endpoint, self.bucket, key);
        let headers = self.sign_headers("DELETE", key, &[], "application/octet-stream")?;

        let mut init = RequestInit::new();
        init.with_method(Method::Delete).with_headers(headers);

        let req = Request::new_with_init(&url, &init)?;

        Fetch::Request(req).send().await?;

        Ok(())
    }

    // AWS Signature v4
    fn sign_headers(&self, method: &str, key: &str, body: &[u8], content_type: &str) -> Result<Headers> {

        let now_ms = worker::Date::now().as_millis();
        let datetime = format_datetime(now_ms);
        let date = &datetime[..8];

        let payload_hash = sha256_hex(body);
        let host = self.endpoint.clone();
        let region = &self.region;

        // canonial request
        let canonical = format!(
            "{method}\n/{bucket}/{key}\n\ncontent-type:{ct}\nhost:{host}\nx-amz-content-sha256:{hash}\nx-amz-date:{dt}\n\ncontent-type;host;x-amz-content-sha256;x-amz-date\n{hash}",
            method = method,
            bucket = self.bucket,
            key = key,
            ct = content_type,
            host = host,
            hash = payload_hash,
            dt = datetime
        );

        // String to sign 
        let credential_scope = format!("{}/{}/{}/s3/aws4_request", date, region, "s3");
        let string_to_sign = format!(
            "AWS4-HMAC-SHA256\n{}\n{}\n{}",
            datetime,
            credential_scope,
            sha256_hex(canonical.as_bytes())
        );

        // siging key 
        let signing_key = hmac_sign(
            &hmac_sign(
                    &hmac_sign(
                            &hmac_sign(
                                format!("AWS4{}", self.app_key).as_bytes(),
                                date.as_bytes(),
                            ), 
                        region.as_bytes()), 
                    b"s3",
                ), 
            b"aws4_request",
        );

        let signature = hex_encode(&hmac_sign(&signing_key, string_to_sign.as_bytes()));

        let auth = format!(
            "AWS4-HMAC-SHA256 Credential={key_id}/{scope}, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature={sig}",
            key_id = self.key_id,
            scope = credential_scope,
            sig = signature,
        );

        let headers = Headers::new();
        headers.set("Authorization", &auth)?;
        headers.set("Content-Type", content_type)?;
        headers.set("x-amz-date", &datetime)?;
        headers.set("x-amz-content-sha256", &payload_hash)?;
        headers.set("Host", &host)?;

        Ok(headers)

    }
}

fn format_datetime(ms: u64)-> String {
    let secs = ms / 1000;
    let s = secs % 60;
    let m = (secs / 60) % 60;
    let h = (secs / 3600) % 24;
    let days = secs / 86400;
    let (y, mo,d) = days_to_ymd(days);

    format!("{:04}{:02}{:02}T{:02}{:02}{:02}Z", y, mo, d, h, m, s)
}

fn days_to_ymd(mut days: u64) -> (u64, u64, u64) {

    days += 719468;
    
    let era = days / 146097;
    let doe = days % 146097;
    let yoe = (doe - doe/1460 + doe/36524 - doe/146096)/365;
    let y = yoe + era * 400;
    let doy = doe - (365*yoe + yoe/4 - yoe/100);
    let mp = (5 * doy + 2)/153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let mo = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if mo <= 2 { y + 1 } else { y };

    (y, mo, d)
}
