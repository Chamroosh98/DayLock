pub enum DeadMansResult {
    // paste is alive -> last_accessed => reset
    Alive,
    // paset must remove -> interval expired
    Triggered { 
        last_accessed: u64, 
        interval: u64 
    },
    // Dead man's switch is disabled!
    Disabled,
}

pub fn check (now: u64, last_accessed: Option<u64>, interval_secs: Option<u64>) -> DeadMansResult {

    let interval = match interval_secs {
        None | Some(0) => return DeadMansResult::Disabled,
        Some(i) => i,
    };

    let last = last_accessed.unwrap_or(now);
    let elapsed = now.saturating_sub(last);

    if elapsed > interval {
        DeadMansResult::Triggered { 
            last_accessed: last, 
            interval
        }
    } else {
        DeadMansResult::Alive
    }
}

// Validation
pub fn validate_interval(secs: u64) -> Result<(), String> {

    const MIN: u64 = 60;                  // One Minute
    const MAX: u64 = 365 * 24 * 3600;       // One year

    if secs < MIN {
        return Err("❌ [worker ERROR in dead_mans_switch.rs] Dead Man's Switch must be active one hour!".to_string());
    }
    if secs > MAX {
        return Err("❌ [worker ERROR in dead_mans_switch.rs] Dead's Man Switch can be up to one year!".to_string());
    }
    
    Ok(())

}

// Convert second into readble context
pub fn format_interval(secs: u64) -> String {

    if secs < 3600 {
        format!("{} Minute", secs/60)
    }
    else if secs < 86400 {
        format!("{} Hours", secs/3600)
    }
    else {
        format!("{} Days", secs/86400)
    }

}
