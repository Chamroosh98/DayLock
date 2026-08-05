# 🔒 DayLock

> **Zero-Knowledge Pastebin & Secure File Sharing** powered by Cloudflare Workers at the Edge.

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/)
[![Built with Rust](https://img.shields.io/badge/Built%20with-Rust-000000?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Runtime Bun](https://img.shields.io/badge/Runtime-Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![UI React](https://img.shields.io/badge/UI-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

**DayLock** is an open-source, client-side encrypted paste service. Plaintext data and decryption keys **never** reach the server or Cloudflare network. Encryption and key derivation happen entirely within your browser via high-performance Rust WebAssembly (WASM).

---

## ✨ Features

- 🔐 **Zero-Knowledge Architecture:** AES-256-GCM encryption + Argon2 key derivation executed strictly client-side via Rust/WASM.
- ⚡ **Edge-Powered Speed:** Serverless API endpoints & static asset delivery powered by Cloudflare Workers and KV Storage.
- 💥 **Burn-on-Read & Expiration (TTL):** Support for self-destructing pastes after a single read or fixed time window.
- 🛡️ **Built-in Rate Limiting:** Automated IP/Fingerprint rate-limiting leveraging Cloudflare KV.
- 🎨 **Modern Minimalist UI:** Built with React 18, Vite, and Tailwind CSS.
- 🚀 **Automated One-Step Setup:** Interactive CLI wizard (`setup.sh`) for seamless local setup & edge deployment.

---

## 🛠️ Prerequisites & Requirements

Ensure the following toolchain is installed on your local environment before proceeding:

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **[Rust](https://rustup.rs/)** | `stable` | WebAssembly crypto kernel compilation |
| **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** | `latest` | Rust to WASM bridge & optimization |
| **[Bun](https://bun.sh/)** | `v1.0+` | Ultra-fast JS runtime & package manager |
| **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** | `v3.0+` | Cloudflare Workers deployment tool |
| **Cloudflare Account** | Free Tier | Cloudflare Workers & KV Storage host |

---

## 🚀 Quick Start & Deployment

### 1️⃣ Clone Repository & Grant Permissions
```bash
git clone [https://github.com/YOUR_USER/DayLock.git](https://github.com/YOUR_USER/DayLock.git)
cd DayLock
chmod +x setup.sh build.sh