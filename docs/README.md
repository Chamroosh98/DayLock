
<div align="center">
  <img src="../frontend/public/dl.svg" alt="DayLock Logo" width="77" height="77" style="vertical-align: middle; margin-right: 8px;">
  <h1>DayLock</h1>
</div>

<p align="center">
  <strong>🕊️ Remembering the IRAN Massacre on Jan 8-9, 2026</strong>
</p>

---

<p align="center">
  <a href="https://github.com/Chamroosh98/DayLock/releases"><img src="https://img.shields.io/badge/-v1.0.0-1D63ED?style=for-the-badge&logo=github&logoColor=white" alt="Release"></a>
  <a href="https://dash.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare"></a>
  <a href="https://webassembly.org/"><img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white" alt="WebAssembly"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-D34516?style=for-the-badge&logo=rust&logoColor=FFF7ED" alt="Rust"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=FBF0DF" alt="Bun"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
</p>

<p align="center">
  <a href="i18n/README_Fa.md"><strong>Persian</strong></a> | 
  <a href="i18n/README_Zh.md"><strong>中文指南</strong></a> | 
  <a href="i18n/README_Ru.md"><strong>Русский</strong></a>
</p>

---

## 🔖 Table of Contents

- [🚀 What is DayLock?](#-what-is-daylock)
- [✨ Key Features](#-key-features)
- [📖 Comprehensive User Guide](#-comprehensive-user-guide)
  - [0. Zero-Knowledge Concept](#0-zero-knowledge-concept)
  - [1. Core Encryption](#1-core-encryption)
  - [2. Steganography, Secret Sharing & Secure E2EE](#2-steganography-secret-sharing--secure-e2ee)
  - [3. Anti-Coercion & Decoy Protection](#3-anti-coercion--decoy-protection)
  - [4. Emergency Shields & Instant Sanitization](#4-emergency-shields--instant-sanitization)
  - [5. Perimeter Defense](#5-perimeter-defense)
- [🛠️ Prerequisites & Toolchain](#️-prerequisites--toolchain)
- [🚀 Deployment Options](#-deployment-options)
  - [Option 1: Automated CLI Wizard (Recommended)](#option-1-automated-cli-wizard-recommended)
  - [Option 2: Cloudflare Dashboard / Git Integration (Manual Deployment)](#option-2-cloudflare-dashboard--git-integration-manual-deployment)
- [🔑 Cloudflare API Token Setup (Optional)](#-cloudflare-api-token-setup-optional)
- [🏗️ Data Architecture Flow](#️-data-architecture-flow)

---

## 🚀 What is DayLock?

**DayLock** is an open-source digital vault, client-side encrypted paste service, and security suite engineered around a strict **Zero-Knowledge Architecture**.

Plaintext data and decryption keys **never** reach the server or the Cloudflare network. The entire encryption and key derivation chain is executed directly inside the user's browser using a high-performance Rust WebAssembly (WASM) kernel.

**The server only holds an encrypted, opaque payload blob with zero capability to inspect contents or recover keys.**

---

## ✨ Key Features

- 🔐 **Zero-Knowledge Architecture:**
  100% client-side execution leveraging standard AES-256-GCM encryption combined with Argon2id key derivation compiled into Rust/WASM.

- 🖼️ **Advanced Steganography:**
  Embed encrypted payloads seamlessly inside image (PNG) and audio (WAV/Voice) files without visible or audible distortions.

- 🍯 **Decoy / Honey Password Protection:**
  Create dual-layer vaults (Plausible Deniability) to display decoy, benign content when subjected to coercion or forced disclosure.

- 🧩 **Shamir's Secret Sharing:**
  Split the primary master key into $N$ distinct shares requiring a $K$-of-$N$ threshold (e.g., 3 out of 5) to reconstruct the secret.

- 🚨 **Emergency Shields:**
  Trigger instant browser memory sanitization on tab switches, screenshot/print attempts, or custom stealth tap patterns.

- 🌐 **Perimeter Controls:**
  Restrict access enforcement based on visitor country (Geo-Lock), network provider (ASN Lock), or specific future timestamps (Time-Lock).

- 💥 **Burn-on-Read & Self-Destruction:**
  Automatic payload purging immediately after the first read or upon reaching time-to-live (TTL) expiration.

- 💬 **Ephemeral E2E Chat:**
  Establish temporary, encrypted communication rooms without persistent server logs or message histories.

---

## 📖 Comprehensive User Guide

### 0. Zero-Knowledge Concept
* **Client-Only Operations:** Keys never cross network boundaries. Text and files are encrypted locally prior to transmission. Server seizures or database leaks yield nothing but undecipherable ciphertext.
* **Trace Elimination:** Burn-on-read items auto-purge upon access, while panic controls immediately wipe browser RAM state.
* **Important Warning:** Forgetting your primary password makes payload recovery mathematically impossible. There is no password reset mechanism.

### 1. Core Encryption
* **Text Vault:** Secure storage for notes, secrets, credentials, and sensitive logs while preserving formatting.
* **File & Image Encryption:** Files are chunked and encrypted in browser memory via AES-256-GCM prior to upload.
* **Burn-on-Read:** Enforce one-time access links that permanently purge payloads from edge KV storage instantly after decryption.
* **Expiration Windows:** Flexible retention controls ranging from a few minutes to multiple days.

### 2. Steganography, Secret Sharing & Secure E2EE
* **Image Steganography:** Inject encrypted payloads into LSB layers of PNG files.
  > ⚠️ **Note:** Always send stego-images as **Uncompressed Documents/Files** in messaging apps to prevent image re-encoding from stripping the hidden data.
* **Audio Steganography:** Hide sensitive payloads inside WAV audio recordings without introducing acoustic artifacts.
* **Shamir's Secret Sharing:** Partition keys into $N$ parts requiring a threshold of $K$ keys to restore access.
* **Ephemeral E2E Chat:** Spin up disposable chat channels for encrypted real-time exchanges without server logging.

### 3. Anti-Coercion & Decoy Protection
* **Dual-Layer Vaults:** Provision two distinct isolation zones inside a single encrypted link payload.
* **Decoy Passwords:** Provide an alternate password that decrypts innocent cover data (e.g., shopping lists, public notes).
* **Cryptographic Unprovability:** It is mathematically impossible to prove the existence of the hidden primary payload from the ciphertext alone.

### 4. Emergency Shields & Instant Sanitization
* **Tab-Switch Guard:** Wipes decrypted RAM state instantly when switching browser tabs or defocusing the window.
* **Print & Screenshot Defenses:** Obfuscates sensitive viewports and purges state during screen capture or print dialog calls.
* **Clipboard Shield:** Blocks direct clipboard copying and automatically flushes system clipboard buffers after a short timeout.
* **Stealth Tap Wipe:** Define custom tap or click sequences to purge active memory and redirect to a benign view.

### 5. Perimeter Defense
* **Geo & ASN Locking:** Restrict link decryption rights to target countries or specific Autonomous System Numbers (ASNs).
* **Time-Locking:** Lock decryption capabilities until a designated future date and time.
* **Canary Alert Tokens:** Send secret webhook alerts upon the first unauthorized or authorized link access attempt.
* **Dead Man's Switch:** Automated data destruction or fallback triggers if the link is not accessed within a set maintenance interval.

---

## 🛠️ Prerequisites & Toolchain

Required tooling for local development and deployment:

| Tool | Recommended | Purpose |
| :--- | :--- | :--- |
| **[Rust](https://rustup.rs/)** | `stable` | WebAssembly cryptography kernel compilation |
| **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** | `latest` | Rust to WASM bridge & optimization CLI |
| **[Bun](https://bun.sh/)** | `v1.0+` | Ultra-fast JavaScript runtime & package manager |
| **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** | `v3.0+` | Cloudflare Workers deployment tool |
| **Cloudflare Account** | Free Tier | Edge hosting for Workers & KV Storage namespaces |

---

## 🚀 Deployment Options

### Option 1: Automated CLI Wizard (Recommended)

Handles WebAssembly compilation, provisions KV storage, generates worker configurations, and deploys directly to Cloudflare Edge.

```bash
  git clone https://github.com/Chamroosh98/DayLock.git
  cd DayLock
  chmod +x setup.sh
  ./setup.sh
```

**What `setup.sh` automates:**

1. **Authentication:** Validates local session (`wrangler login`) or API Token.
2. **KV Provisioning:** Creates `DAYLOCK_RATE_LIMIT_KV` and `DAYLOCK_PASTE_KV` namespaces.
3. **Configuration:** Populates `wrangler.toml` with the created KV namespace IDs.
4. **Build Chain:** Compiles frontend assets and injects the Rust WASM package.
5. **Publishing:** Deploys the application and Worker API endpoints to Cloudflare Edge.

---

### Option 2: Cloudflare Dashboard / Git Integration (Manual Deployment)

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages**.
3. Create a **Pages** project connected to your `DayLock` GitHub repository.
4. Under **Workers & Pages -> KV**, create two KV namespaces:
* `DAYLOCK_RATE_LIMIT_KV`
* `DAYLOCK_PASTE_KV`


5. Map these namespaces under **Project Settings -> Bindings** to matching variable names.
6. Click **Save and Deploy**.

---

## 🔑 Cloudflare API Token Setup (Optional)

For automated CLI deployments without interactive browser authentication, issue an API Token via [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) with the following scopes:

* 📜 **Workers Scripts** -> `Edit`
* 🗄️ **Workers KV Storage** -> `Edit`

---

## 🏗️ Data Architecture Flow

```text
Browser Client
  ├── UI (React 19 Static Assets)
  └── Cryptographic Kernel (Rust/WASM - Encrypt/Decrypt & Steganography)
        │
        ▼  [Ciphertext Payloads Only]
Cloudflare Worker Edge API
  ├── /api/*   ──> Handles encrypted requests & rate-limiting logic
  └── /*       ──> Serves static web assets & WASM packages (/pkg)
        │
        ▼  [Encrypted Blobs]
Cloudflare KV Storage
  ├── DAYLOCK_PASTE_KV
  └── DAYLOCK_RATE_LIMIT_KV
```