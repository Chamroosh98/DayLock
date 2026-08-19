import { LanguageManual } from './types';

export const enManual: LanguageManual = {
  title: "DayLock Manual",
  subtitle: "Comprehensive Zero-Knowledge Encryption & Threat Evasion Guide",
  startTourBtn: "Tour",
  closeBtn: "Close Guide",
  tabs: {
    overview: "0. System Architecture",
    coreModes: "1. Core Encryption",
    advancedModes: "2. Stego, Shamir & Chat",
    evasion: "3. Coercion & Decoy",
    emergency: "4. Panic Triggers",
    perimeter: "5. Outer Perimeter",
    shortcuts: "Keyboard Hotkeys",
  },
  overviewHeading: "Zero-Knowledge Cryptographic Architecture",
  overviewText: "DayLock is an offline-first, client-side cryptographic vault engineered for high-threat environments, investigative journalists, human rights defenders, and individuals navigating strict censorship checkpoints. All encryption and decryption algorithms execute strictly within your local browser's volatile RAM using industry-standard Web Crypto API (AES-GCM 256-bit). The backend server merely acts as an opaque storage locker for encrypted binary ciphertext and possesses zero technical capability or cryptographic keys to inspect your data.",
  overviewCards: [
    {
      title: "🔐 Absolute Local Isolation",
      description: "Your secret keys never traverse the network. Plaintext payloads are converted to AES-GCM encrypted blobs locally before transmission. Even under total server seizure or database subpoena, adversaries retrieve only unreadable mathematical noise."
    },
    {
      title: "🛡️ Zero-Trace Ephemerality",
      description: "Designed with strict memory sanitization principles. Single-use records vaporize instantly upon decryption. Active panic triggers immediately flush browser DOM and RAM state to prevent forensic recovery."
    },
    {
      title: "🎭 Plausible Deniability",
      description: "When operating under physical duress or forced checkpoint inspection, DayLock's dual-layer Honey-Decoy architecture allows you to surrender decoy passwords that reveal harmless secondary travel itineraries."
    },
    {
      title: "🌐 Geographic & Canary Fences",
      description: "Enforce strict IP jurisdiction boundaries and attach silent webhook tripwires. Any unauthorized scanning bot or adversarial probe immediately triggers automated purging and dispatch of real-time telemetry alerts."
    }
  ],
  quickNote: "Operational Directive: Never rely solely on software tools. Always maintain strict physical security protocols, use Tor/VPN relays, and rehearse emergency procedures before entering checkpoint zones.",
  warningText: "Critical Security Disclaimer: This documentation outlines advanced defensive cybersecurity practices. Loss of your Master Encryption Password results in permanent, irreversible data loss. No recovery backdoor exists.",
  steps: {
    coreModes: {
      title: "Core Payload Creation & File Vault",
      badge: "Fundamental Cryptography",
      description: "DayLock supports seamless client-side encryption of text notes, confidential documents, and sensitive media. Follow these foundational operating guidelines:",
      points: [
        "Text & Markdown Vault: Select the 'Text' tab to draft confidential logs, passwords, or reports. Full formatting is preserved inside the encrypted payload.",
        "Encrypted File & Media Upload: Switch to 'File' or 'Image' to secure archives, PDFs, or photos. Files are encrypted in chunks directly inside browser RAM before upload.",
        "Burn-on-Read (One-Time View): Enable this modifier for ultra-sensitive payloads. Once the recipient unlocks the link, the server permanently deletes the database record.",
        "Master Password Lock: Define a robust passphrase. DayLock derives 256-bit keys using secure key derivation functions. Never forget this passphrase—it cannot be reset.",
        "Custom Expiration Timers: Set exact time-to-live (TTL) durations (from 5 minutes to 30 days) to ensure automated cleanup of abandoned data."
      ],
      tip: "Vault Best Practice: For file uploads exceeding 10MB, ensure your device has adequate free RAM memory to prevent local out-of-memory browser crashes during client-side encryption."
    },
    advancedModes: {
      title: "Steganography, Shamir's Secret Sharing & E2E Channels",
      badge: "Advanced Concealment",
      description: "When standard encrypted links attract unwanted attention from deep packet inspection (DPI) or network censors, utilize advanced data concealment protocols:",
      points: [
        "Image Steganography (Stego): Embed secret text payloads invisibly inside standard PNG images. The resulting image looks and opens like a normal photograph while concealing encrypted bitstreams in pixel color channels.",
        "Audio Steganography: Hide confidential text messages inside WAV audio clips or live microphone recordings. The secret message is imperceptibly woven into audio frequencies.",
        "Shamir's Secret Sharing: Split your master secret into multiple mathematical shares (e.g., 3-of-5 threshold). Distribute shares among trusted allies or disparate storage locations; reconstructing the secret requires assembling the exact threshold number of shares.",
        "Ephemeral E2E Chat Channels: Spawn instant, zero-trace encrypted peer-to-peer communication rooms for live coordination without leaving server chat histories."
      ],
      tip: "Stego Operational Tip: When sharing steganographic PNG images over messaging apps, ensure the platform sends files as 'uncompressed documents' to prevent image compression algorithms from corrupting the hidden bitstream."
    },
    evasion: {
      title: "Coercion Defense & Honey-Decoy Operations",
      badge: "Plausible Deniability",
      description: "Physical border checkpoints and coercive interrogations present severe threats where adversaries demand decryption passwords. Honey-Decoy mode neutralizes this coercion:",
      points: [
        "Dual-Layer Encryption: Enable 'Honeypot Decoy' prior to payload generation. This creates two distinct cryptographic compartments within a single ciphertext blob.",
        "Plausible Decoy Passphrase: Set a benign secondary password (e.g., 'TravelLog2026') tied to innocent cover content (e.g., public tourist itineraries, grocery lists, or recipes).",
        "Surrendering Under Duress: If detained and forced to unlock your link, input the Decoy Password. DayLock decrypts the compartment seamlessly, showing innocent material without triggering warnings.",
        "Undetectable Genuine Secret: The genuine confidential payload remains hidden inside the encrypted noise. Mathematically, inspectors cannot prove a second secret compartment exists."
      ],
      tip: "Coercion Psychology: Choose a decoy password that mirrors your everyday password patterns (e.g., family names or birth years) so your compliance appears completely authentic under questioning."
    },
    emergency: {
      title: "Active Panic Triggers & Instant Self-Destruct",
      badge: "Threat Neutralization",
      description: "In volatile field environments, device confiscation or shoulder surfing can occur without warning. DayLock's active panic mechanisms sanitize browser state instantly:",
      points: [
        "Emergency Self-Destruct Modifier: Arm active sensors before generating sensitive sessions to protect against sudden physical device seizure.",
        "Tab Switch Sensor: Automatically flushes decrypted plaintext from memory and destroys the session the exact millisecond browser tab focus is lost.",
        "Print Shortcut Interceptor: Instantly wipes local DOM keys and blanks the viewport if Ctrl+P / Cmd+P or screen capture commands are initiated.",
        "Background Tap Wipe (Hides): Configure a hidden click threshold. Tapping the neutral canvas area X times immediately vaporizes active secrets and redirects to a safe screen.",
        "Failed Attempt Lockout: Permanently purges the stored payload after consecutive incorrect passphrase attempts.",
        "Silent Clipboard Shield: Blocks direct clipboard copying (scraping prevention) and automatically neutralizes clipboard contents with 30-second self-destruct or instant clear upon window lock/blur."
      ],
      tip: "Field Reflex Rehearsal: If approached by hostile personnel, immediately switch to a benign background tab or tap the canvas. The local RAM state purges itself instantly."
    },
    perimeter: {
      title: "Outer Perimeter Defense: Geo-Lock, Canary & Dead Man's Switch",
      badge: "Perimeter Hardening",
      description: "Protect your shared links against automated intelligence crawlers, unauthorized network probes, and operator incapacitation:",
      points: [
        "Geo-Lock Access Control: Restrict link decryption strictly to authorized IP jurisdictions (e.g., Switzerland, Germany). Access attempts from unauthorized nations are dropped instantly.",
        "Canary Alert Webhooks: Attach a silent webhook URL (Discord, Slack, or custom server). Any unauthorized probe or bot scan dispatches an instant telemetry alert with IP and timestamp metadata.",
        "Dead Man's Switch Fail-Safe: Establish an automated creator check-in countdown interval (e.g., 24h or 7 days). If you are detained or unable to check in before expiration, the backend executes an irreversible purge.",
        "QR Code Hub & Air-Gapped Verification: Generate secure QR codes for air-gapped optical transfer to clean secondary mobile devices."
      ],
      tip: "Perimeter Synergy: Always combine Geo-Lock restrictions with anonymous Tor/VPN routing to maximize operational security and obscure physical origins."
    }
  }
};
