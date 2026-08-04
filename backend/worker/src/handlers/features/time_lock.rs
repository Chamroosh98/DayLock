pub enum TimeLockResult {
    Locked { unlock_at: u64, remaining: u64 },
    Unlocked,
    Disabled,
}


pub fn check(now: u64, unlock_at: Option<u64>) -> TimeLockResult {
    let unlock = match unlock_at {
        None | Some(0) => return TimeLockResult::Disabled,
        Some(t) => t,
    };

    if now < unlock {
        TimeLockResult::Locked {
            unlock_at: unlock,
            remaining: unlock - now,
        }
    } else {
        TimeLockResult::Unlocked
    }
}


pub fn validate(unlock_at: u64, now: u64) -> Result<(), String> {
    if unlock_at <= now {
        return Err("❌ [worker ERROR in time_lock.rs] The time of Time-Lock must be in future!".to_string());
    }
    
    let max = now + 10 * 365 * 24 * 3600;
    if unlock_at > max {
        return Err("❌ [worker ERROR in time_lock.rs] The time of Time-Lock can not be more than 10 years!".to_string());
    }
    Ok(())
}


pub fn format_remaining(secs: u64) -> String {
    if secs < 60 {
        format!("⏰ {} seconds", secs)
    } else if secs < 3600 {
        format!("⏰ {} minutes and {} seconds", secs / 60, secs % 60)
    } else if secs < 86400 {
        let h = secs / 3600;
        let m = (secs % 3600) / 60;
        if m > 0 { format!("⏰ {} hours and {} minutes", h, m) }
        else { format!("⏰ {} hours", h) }
    } else {
        let d = secs / 86400;
        let h = (secs % 86400) / 3600;
        if h > 0 { format!("⏰ {} days and {} hours", d, h) }
        else { format!("⏰ {} days", d) }
    }
}
