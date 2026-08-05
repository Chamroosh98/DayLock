
<br>

<div align="center">
  <h1>
    <img src="frontend/public/dl.svg" alt="DayLock Logo" width="40" height="40" style="vertical-align: middle; margin-right: 8px;">
    <span style="vertical-align: middle;">DayLock</span>
  </h1>
</div>

<p align="center">
  <strong>🕊️ Remembering the IRAN Massacre on Jan 8-9, 2026 (18-19 Day 1404)</strong>
</p>

---

<br>
<p align="center">
  <a href="https://dash.cloudflare.com/"><img src="https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Deploy to Cloudflare Workers"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Built%20with-Rust-000000?style=for-the-badge&logo=rust&logoColor=white" alt="Built with Rust"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Runtime-Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Runtime Bun"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/UI-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="UI React"></a>
</p>

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
git clone [https://github.com/Chamroosh98/DayLock.git](https://github.com/Chamroosh98/DayLock.git)
cd DayLock
chmod +x setup.sh build.sh
./setup.sh
```

## 🚀 What `setup.sh` Does

1. **🔑 Authenticate** — Prompts for `wrangler login` or API Token verification.
2. **📦 Create KV Namespaces** — Provisions `RATE_LIMIT` and `PASTE_KV` directly on your Cloudflare account.
3. **⚙️ Configuration** — Generates `backend/worker/wrangler.toml` automatically.
4. **🏗️ Build Chain** — Compiles frontend $\rightarrow$ packages WASM into `frontend/dist/pkg`.
5. **🌐 Deploy** — Publishes the Worker API and static assets live to Cloudflare Edge.

> 🎉 **All set!** At the end of execution, you'll get your live URL :  `https://daylock.<subdomain>.workers.dev`

---

## 🔑 API Token Setup *(Optional)*

If you prefer **Token Authentication** over browser login, create a token via [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).

Select the **Edit Cloudflare Workers** template, or manually grant the following permissions:

- 📜 **Workers Scripts** $\rightarrow$ `Edit`
- 🗄️ **Workers KV Storage** $\rightarrow$ `Edit`

> 💡 **Note:** `Account ID` is optional — only required if your key manages multiple Cloudflare accounts.

---

## 💾 Add BackBlaze B2 *(Optional)*

To bind external services (e.g., Backblaze B2):

```bash
cd backend/worker
wrangler secret put B2_KEY_ID
wrangler secret put B2_APP_KEY

```
---

## 🛠️ Day-to-Day Commands

Use `./build.sh` to handle local execution and deployment. The build pipeline automatically guarantees the execution sequence: **Frontend $\rightarrow$ WASM $\rightarrow$ Worker**.

```bash
./build.sh          # Default: alias for ./build.sh dev
./build.sh dev      # Spin up local development environment (wrangler dev)
./build.sh deploy   # Build assets and deploy to production (wrangler deploy)
```

## Architecture

**Data flow** is designed to ensure zero-knowledge privacy: plaintexts and keys stay strictly within the browser environment!

``` bash
Browser Client
  ├── UI (Static React Assets)
  └── WASM Core (Client-side Encrypt / Decrypt)
        │
        ▼  [Ciphertext Only]
Cloudflare Worker (Edge API)
  ├── /api/*   ──> Handle Pastes, Files & Rate Limiting
  └── /*       ──> Serve UI Assets & WASM Package (/pkg)
        │
        ▼  [Encrypted Blobs]
Cloudflare KV Storage
  ├── PASTE_KV
  └── RATE_LIMIT
```



