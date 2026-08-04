use worker::Request;

pub enum GeoCheckResult {
    Allowed,
    Blocked { country: String, allowed: Vec<String> },
    UnknownCountry,
}

pub fn check(req: &Request, allowed_countries: &Option<Vec<String>>) -> GeoCheckResult {
    
    let allowed = match allowed_countries {
        None => return GeoCheckResult::Allowed,
        Some(list) if list.is_empty() => return GeoCheckResult::Allowed,
        Some(list) => list,
    };

    
    let ip = req.headers().get("CF-Connecting-IP")
        .ok().flatten()
        .unwrap_or_default();
    let is_local_ip = ip.starts_with("127.")
        || ip.starts_with("::1")
        || ip == "localhost"
        || ip.is_empty();

    
    let country = match req.headers().get("CF-IPCountry") {
        Ok(Some(c)) => c.to_uppercase(),
        
        _ => {
            if is_local_ip {
                worker::console_log!("🌍 [worker log in geo_lock.rs] dev mode (no CF-IPCountry + local IP) → bypass");
                return GeoCheckResult::Allowed;
            }
            return GeoCheckResult::UnknownCountry;
        }
    };

    
    if country == "XX" && is_local_ip {
        worker::console_log!("🌍 [worker log in geo_lock.rs] dev mode (XX + local IP) → bypass");
        return GeoCheckResult::Allowed;
    }

    
    if country == "T1" || country == "XX" {
        return GeoCheckResult::Blocked {
            country,
            allowed: allowed.clone(),
        };
    }

    if allowed.iter().any(|a| a.to_uppercase() == country) {
        GeoCheckResult::Allowed
    } else {
        GeoCheckResult::Blocked {
            country,
            allowed: allowed.clone(),
        }
    }
}


pub fn country_name(code: &str) -> &'static str {
    match code.to_uppercase().as_str() {
        "IR" => "Iran",
        "US" => "United States",
        "DE" => "Germany",
        "FR" => "France",
        "GB" => "United Kingdom",
        "RU" => "Russia",
        "CN" => "China",
        "TR" => "Turkey",
        "AE" => "United Arab Emirates",
        "NL" => "Netherlands",
        "CA" => "Canada",
        "AU" => "Australia",
        "JP" => "Japan",
        "T1" => "Tor Network",
        _    => "Unknown",
    }
}

pub fn validate_countries(countries: &[String]) -> Result<(), String> {
    for code in countries {
        if code.len() != 2 || !code.chars().all(|c| c.is_ascii_alphabetic()) {
            return Err(format!(
                "❌ [worker ERROR in geo_lock.rs] The country code '{}' isn't validate! it's must be two characters!",
                code
            ));
        }
    }
    if countries.len() > 50 {
        return Err("❌ [worker ERROR in geo_lock.rs] A maximum of 50 countries are allowed! ".to_string());
    }
    Ok(())
}
