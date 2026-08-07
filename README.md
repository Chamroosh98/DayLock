
<br>

<div align="center">
  <img src="frontend/public/dl.svg" alt="DayLock Logo" width="77" height="77" style="vertical-align: middle; margin-right: 8px;">
  <h1>
    <span style="vertical-align: middle;">DayLock</span>
  </h1>
</div>

<p align="center">
  <strong>🕊️ Remembering the IRAN Massacre on Jan 8-9, 2026 (18-19 Day 1404)</strong>
</p>

---

<br>
<p align="center">
  <a href="https://github.com/Chamroosh98/DayLock/releases"><img src="https://img.shields.io/badge/version-v1.0.0-blue?style=for-the-badge" alt="Version"></a>
  <a href="https://dash.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"></a>
  <a href="https://webassembly.org/"><img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white" alt="WebAssembly"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-E57300?style=for-the-badge&logo=rust&logoColor=white" alt="Rust"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-FBF0DF?style=for-the-badge&logo=bun&logoColor=black" alt="Bun"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
  <!-- <a href="https://github.com/Chamroosh98/DayLock/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"></a> -->
</p>

**DayLock** is an open-source, client-side encrypted paste service. Plaintext data and decryption keys **never** reach the server or Cloudflare network. Encryption and key derivation happen entirely within your browser via high-performance Rust WebAssembly (WASM).

---

## ✨ Features

- 🔐 **Zero-Knowledge Architecture :** AES-256-GCM encryption + Argon2 key derivation executed strictly client-side via Rust/WASM.
- ⚡ **Edge-Powered Speed :** Serverless API endpoints & static asset delivery powered by Cloudflare Workers and KV Storage.
- 💥 **Burn-on-Read & Expiration (TTL) :** Support for self-destructing pastes after a single read or fixed time window.
- 🛡️ **Built-in Rate Limiting :** Automated IP/Fingerprint rate-limiting leveraging Cloudflare KV.
- 🎨 **Modern Minimalist UI :** Built with React 19, Vite, and Tailwind CSS.
- 🚀 **Automated One-Step Setup :** Interactive CLI wizard (`setup.sh`) for seamless local setup & edge deployment.

---

## 🛠️ Prerequisites & Requirements

Ensure the following toolchain is installed on your local environment if you choose CLI deployment :

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **[Rust](https://rustup.rs/)** | `stable` | WebAssembly crypto kernel compilation |
| **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** | `latest` | Rust to WASM bridge & optimization |
| **[Bun](https://bun.sh/)** | `v1.0+` | Ultra-fast JS runtime & package manager |
| **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** | `v3.0+` | Cloudflare Workers deployment tool |
| **Cloudflare Account** | Free Tier | Cloudflare Workers & KV Storage host |

---

## 🚀 Deployment Options

You can deploy **DayLock** to Cloudflare using either the automated CLI wizard or manually via the Cloudflare Dashboard.

---

### Option 1 : Automated CLI Wizard (Recommended)

This method automatically handles compilation, binding KV namespaces, generating configurations, and deploying to Cloudflare.

```bash
git clone [https://github.com/Chamroosh98/DayLock.git](https://github.com/Chamroosh98/DayLock.git)
cd DayLock
chmod +x setup.sh
./setup.sh
```

#### What `setup.sh` does automatically:

1. **🔑 Authenticate** — Prompts for `wrangler login` or API Token verification.
2. **📦 Create KV Namespaces** — Provisions `RATE_LIMIT_KV` and `PASTE_KV` directly on your Cloudflare account.
3. **⚙️ Configuration** — Generates `backend/worker/wrangler.toml` with the created KV IDs.
4. **🏗️ Build Chain** — Compiles frontend -> packages WASM into `frontend/dist/pkg`.
5. **🌐 Deploy** — Publishes Worker API and static assets to Cloudflare Edge.

> 🎉 **All set!** At the end of execution, you'll receive your live URL :
> `https://daylock.<subdomain>.workers.dev`

---

### Option 2 : Cloudflare Dashboard / Git Integration (Manual Deployment)

If you don't have local CLI access or prefer deploying directly via Cloudflare's Web GUI:

1. **Log in** to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** -> **Workers & Pages**.
3. Click **Create Application** -> Select **Pages** (or click *Looking to deploy Pages? Get started* / *Connect Git*).
4. Connect your GitHub repository (`DayLock`).
5. **Create KV Namespaces Manually:**
* In Cloudflare Dashboard, go to **Workers & Pages** -> **KV**.
* Create two namespaces :
* `RATE_LIMIT_KV`
* `PASTE_KV`


6. **Bind KV Namespaces to your Project:**
* Go to your Project **Settings** -> **Functions** / **Bindings** -> **KV Namespace Bindings**.
* Add binding `RATE_LIMIT_KV` pointing to your created `RATE_LIMIT_KV` namespace.
* Add binding `PASTE_KV` pointing to your created `PASTE_KV` namespace.


7. Click **Save and Deploy**.

---

## 🔑 API Token Setup *(Optional)*

If you prefer **Token Authentication** over browser login during CLI deployment, create a token via [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).

Select the **Edit Cloudflare Workers** template, or manually grant the following permissions:

* 📜 **Workers Scripts** -> `Edit`
* 🗄️ **Workers KV Storage** -> `Edit`

> 💡 **Note:** `Account ID` is optional — only required if your key manages multiple Cloudflare accounts.

---

## 💾 Add Backblaze B2 Storage *(Optional)*

To bind external object storage for larger file pastes (e.g., Backblaze B2):

```bash
cd backend/worker
wrangler secret put B2_KEY_ID
wrangler secret put B2_APP_KEY

```
---

## 🏗️ Architecture Flow

Data flow is designed to ensure zero-knowledge privacy: plaintexts and keys stay strictly within the browser environment.

```text
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
  └── RATE_LIMIT_KV

```
