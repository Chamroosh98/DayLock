use worker::Request;

#[allow(dead_code)]
pub enum AsnLockMode {
    BlockList,
    AllowList,
}

pub enum AsnCheckResult {
    Allowed,
    Blocked { asn: String, asn_name: String },
    UnknownAsn,
}

pub fn check(
    req: &Request,
    block_asns: &Option<Vec<String>>,
    allow_asns: &Option<Vec<String>>,
) -> AsnCheckResult {
    
    let has_block = block_asns.as_ref().map_or(false, |l| !l.is_empty());
    let has_allow = allow_asns.as_ref().map_or(false, |l| !l.is_empty());
    if !has_block && !has_allow {
        return AsnCheckResult::Allowed;
    }

    
    let ip = req.headers().get("CF-Connecting-IP")
        .ok().flatten().unwrap_or_default();
    let is_local = ip.starts_with("127.") || ip.starts_with("::1")
        || ip == "localhost" || ip.is_empty();

    // Read ASN from Cloudflare header
    let raw_asn = match req.headers().get("CF-ASN") {
        Ok(Some(v)) => v,
        _ => {
            if is_local {
                worker::console_log!("🌥️ [asn_lock.rs] Dev mode → bypass");
                return AsnCheckResult::Allowed;
            }
            return AsnCheckResult::UnknownAsn;
        }
    };

    // normalize: remove "AS" prefix
    let asn = normalize_asn(&raw_asn);

    if asn.is_empty() && is_local {
        return AsnCheckResult::Allowed;
    }

    if has_allow {
        let allowed_list = allow_asns.as_ref().unwrap();
        if allowed_list.iter().any(|a| normalize_asn(a) == asn) {
            return AsnCheckResult::Allowed;
        } else {
            return AsnCheckResult::Blocked {
                asn_name: asn_name(&asn).to_string(),
                asn: format!("AS{}", asn),
            };
        }
    }

    if has_block {
        let blocked_list = block_asns.as_ref().unwrap();
        if blocked_list.iter().any(|b| normalize_asn(b) == asn) {
            return AsnCheckResult::Blocked {
                asn_name: asn_name(&asn).to_string(),
                asn: format!("AS{}", asn),
            };
        }
    }

    AsnCheckResult::Allowed
}

fn normalize_asn(s: &str) -> String {
    let trimmed = s.trim().to_uppercase();
    let digits = trimmed.trim_start_matches("AS");
    // remove leading zeros
    let num: u64 = digits.parse().unwrap_or(0);
    num.to_string()
}

pub fn asn_name(asn: &str) -> &'static str {
    match asn {
        "197207" => "MCI / Hamrah Aval",
        "44244"  => "Irancell / MTN",
        "16322"  => "Pars Online",
        "48159"  => "TCI / Shatel",
        "58224"  => "TCI",
        "44285"  => "MobinNet",
        "43754"  => "Asiatech",
        "25184"  => "Afranet",
        "12880"  => "DCI",
        "48431"  => "Fanava",
        "49666"  => "Pishgaman",
        "20115"  => "Charter Communications",
        "7922"   => "Comcast",
        "15169"  => "Google",
        "16509"  => "Amazon AWS",
        "14061"  => "DigitalOcean",
        "13335"  => "Cloudflare",
        "32934"  => "Meta / Facebook",
        "8075"   => "Microsoft",
        _        => "Unknown ISP",
    }
}

pub fn validate_asns(asns: &[String]) -> Result<(), String> {
    for asn in asns {
        let digits = asn.trim().to_uppercase();
        let digits = digits.trim_start_matches("AS");
        if digits.is_empty() || !digits.chars().all(|c| c.is_ascii_digit()) {
            return Err(format!(
                "❌ [worker ERROR in asn_lock.rs] The ASN doesn't verified!'{}' it must be number!",
                asn
            ));
        }
        let num: u64 = digits.parse().unwrap_or(0);
        if num == 0 || num > 4_294_967_295 {
            return Err(format!("❌ [worker ERROR in asn_lock.rs] The ASN '{}' is out of the valid range", asn));
        }
    }
    if asns.len() > 100 {
        return Err("❌ [worker ERROR in asn_lock.rs] Maximum 100 ASNs allowed".to_string());
    }
    Ok(())
}

#[allow(dead_code)]
pub fn iran_asns() -> Vec<(&'static str, &'static str)> {
    vec![
        ("197207", "MCI / Hamrah Aval"),
        ("44244",  "Irancell / MTN"),
        ("58224",  "TCI"),
        ("48159",  "TCI / Shatel"),
        ("16322",  "Pars Online"),
        ("44285",  "MobinNet"),
        ("43754",  "Asiatech"),
        ("25184",  "Afranet"),
        ("12880",  "DCI"),
        ("49666",  "Pishgaman"),
        ("48431",  "Fanava"),
    ]
}
