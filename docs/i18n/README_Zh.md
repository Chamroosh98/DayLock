
<div align="center">
  <img src="../../frontend/public/dl.svg" alt="DayLock Logo" width="85" height="85" style="vertical-align: middle; margin-right: 8px;">
  <h1>DayLock</h1>
</div>

<p align="center">
  <strong>🕊️ 谨此纪念 2026 年 1 月 8 日至 9 日 伊朗流血事件的牺牲者</strong>
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
  <a href="../README.md"><strong>English</strong></a>
</p>

---

## 🔖 目录

- [🚀 什么是 DayLock？](#-什么是-daylock)
- [✨ 核心特性](#-核心特性)
- [📖 完整用户指南](#-完整用户指南)
  - [0. 零知识架构概念](#0-零知识架构概念)
  - [1. 基础加密](#1-基础加密)
  - [2. 隐写术、秘密共享与端到端安全通信](#2-隐写术秘密共享与端到端安全通信)
  - [3. 防胁迫与伪装密码（Decoy）](#3-防胁迫与伪装密码decoy)
  - [4. 紧急防御与实时数据擦除](#4-紧急防御与实时数据擦除)
  - [5. 边界防御](#5-边界防御)
- [🛠️ 前置需求与工具链](#️-前置需求与工具链)
- [🚀 部署选项](#-部署选项)
  - [选项 1：CLI 自动化向导（推荐）](#选项-1cli-自动化向导推荐)
  - [选项 2：使用 GitHub Actions 自动部署](#选项-2使用-github-actions-自动部署)
- [🔑 Cloudflare API Token 设置](#-cloudflare-api-token-设置)
- [🏗️ 数据架构流程](#️-数据架构流程)

---

## 🚀 什么是 DayLock？

**DayLock** 是一款开源的数字保险库、客户端加密剪贴板服务以及安全工具包，完全基于严格的 **零知识架构（Zero-Knowledge Architecture）** 构建。

明文数据和解密密钥 **绝不会** 传输到服务器或 Cloudflare 网络。所有的加密与密钥衍生过程均在用户浏览器内部通过高性能 Rust WebAssembly (WASM) 内核直接完成。

**服务器仅存储一份不透明的加密数据包，完全无法查看内容或恢复密钥。**

---

## ✨ 核心特性

- 🔐 **零知识架构：**  
  100% 客户端执行，结合标准 AES-256-GCM 加密与 Argon2id 密钥衍生，经 Rust 编译为 WASM 运行。

- 🖼️ **高级隐写术（Steganography）：**  
  将加密数据无缝隐写置于图片（PNG）或音频（WAV/语音）文件中，不会产生任何肉眼或肉耳可察觉的失真。

- 🍯 **伪装密码/诱饵保护（Honey / Decoy Password）：**  
  创建双层保险库（可否认加密），在面临胁迫或强制搜查时，输入伪装密码仅展示无害的表面数据。

- 🧩 **萨米尔秘密共享（Shamir's Secret Sharing）：**  
  将主密钥分割为 $N$ 个碎片，必须集齐设定的 $K$ 个碎片（例如 5 个中的 3 个）才能重建密钥。

- 🚨 **紧急防御机制：**  
  切换标签页、尝试截屏/打印或敲击特定的暗号区域时，会立即触发浏览器内存中的数据擦除。

- 🌐 **边界安全控制：**  
  可根据访问者所在国家（Geo-Lock）、网络运营商（ASN Lock）或特定的未来时间戳（Time-Lock）限制解密权限。

- 💥 **阅后即焚与自动过期：**  
  数据在首次读取后或达到预设的生存时间（TTL）后，将自动从边缘存储中永久销毁。

- 💬 **一次性端到端加密聊天：**  
  创建临时的加密通信房间，服务器不保存任何历史记录或日志。

---

## 📖 完整用户指南

### 0. 零知识架构概念
* **仅限客户端操作：** 密钥永远不会离开您的设备。文本和文件在传输前已在本地完成加密。即使服务器被扣押或数据库泄露，攻击者也只能获得无法破解的乱码。
* **消除痕迹：** 阅后即焚内容在读取后即刻彻底删除，紧急控制功能可即时清空浏览器内存状态。
* **重要警告：** 如果遗忘了主密码，数学上绝无可能恢复加密内容。系统不设任何密码重置机制。

### 1. 基础加密
* **文本保险库：** 安全存储笔记、秘密、凭据和敏感日志，同时保留原始排版格式。
* **文件与图片加密：** 文件在上传前会在浏览器内存中通过 AES-256-GCM 进行分块加密。
* **阅后即焚：** 强制开启一次性访问链接，解密后立即从边缘 KV 存储中彻底抹除数据。
* **有效期限：** 灵活的存留控制，时间跨度可从几分钟到几天不等。

### 2. 隐写术、秘密共享与端到端安全通信
* **图片隐写术：** 将加密数据注入 PNG 图片的 LSB 阶层中。  
  > ⚠️ **注意：** 在即时通讯软件中发送含隐写数据的图片时，务必以 **“文件/文档（Uncompressed Document）”** 格式发送，防止软件压缩损坏隐写数据。
* **音频隐写术：** 将敏感消息隐藏在 WAV 音频文件中，不会产生声学杂音。
* **萨米尔秘密共享：** 将密钥拆分为 $N$ 份，需要达到 $K$ 份门槛才能恢复访问。
* **一次性 E2E 聊天：** 建立一次性加密频道进行实时交流，服务器无任何日志留存。

### 3. 防胁迫与伪装密码（Decoy）
* **双层保险库：** 在单个加密链接中构建两个完全隔离的存储空间。
* **伪装密码：** 设置第二个密码，解密后仅展示无关紧要的干扰数据（如购物清单、公开笔记等）。
* **密码学不可证明性：** 单从密文数据本身，数学上无法证明是否存在隐藏的真实主数据。

### 4. 紧急防御与实时数据擦除
* **标签页切换保护（Tab-Switch Guard）：** 当离开当前标签页或窗口失去焦点时，立即清空内存中已解密的数据。
* **防打印与防截屏：** 在调用截屏或打印时，自动模糊敏感视口并清空内存状态。
* **剪贴板保护（Clipboard Shield）：** 禁止直接复制文本，并在极短时间后自动清空系统剪贴板。
* **暗号敲击清空：** 自定义特定区域的敲击/点击顺序，快速擦除活跃内存并跳转至安全界面。

### 5. 边界防御
* **地理与 ASN 锁定：** 限制仅允许特定国家或特定网络运营商（ASN）的访客解密链接。
* **时间锁定（Time-Locking）：** 将解密功能锁定，直到未来的指定日期和时间到达。
* **金丝雀警报代币（Canary Alert）：** 当链接发生首次授权或未授权的访问尝试时，触发秘密 Webhook 警报。
* **死人开关（Dead Man's Switch）：** 若在设定的维护周期内未对链接进行访问，将自动触发数据销毁或预设响应。

---

## 🛠️ 前置需求与工具链

本地开发与部署所需的工具链：

| 工具 | 推荐版本 | 用途 |
| :--- | :--- | :--- |
| **[Rust](https://rustup.rs/)** | `stable` | 编译 WebAssembly 密码学内核 |
| **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** | `latest` | Rust 转 WASM 的构建工具 |
| **[Bun](https://bun.sh/)** | `v1.0+` | 超快的 JavaScript 运行时与包管理器 |
| **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** | `v3.0+` | Cloudflare Workers 部署管理工具 |
| **Cloudflare 账号** | Free Tier (免费版) | 托管 Worker 及 KV 存储空间 |

---

## 🚀 部署选项

### 选项 1：CLI 自动化向导（推荐）

自动处理 WebAssembly 编译、创建 KV 存储、生成配置文件并直接部署至 Cloudflare 边缘网络。

```bash
  git clone https://github.com/Chamroosh98/DayLock.git
  cd DayLock
  chmod +x setup.sh
  ./setup.sh
```

**`setup.sh` 脚本自动执行的操作：**

1. **身份验证：** 验证本地登录状态（`wrangler login`）或 API Token。
2. **创建 KV 空间：** 自动创建 `DAYLOCK_RATE_LIMIT_KV` 与 `DAYLOCK_PASTE_KV` 命名空间。
3. **配置文件渲染：** 将生成的 KV ID 填充进 `wrangler.toml` 文件。
4. **构建链执行：** 编译前端资源并注入 Rust WASM 包。
5. **发布：** 将应用程序与 Worker API 端点部署至 Cloudflare 边缘网络。

---

### 选项 2：使用 GitHub Actions 自动部署

只需设置一次，之后 Fork 即可直接使用。  
用户只需添加 Secrets，工作流会自动创建或查找 KV 命名空间、完成构建并部署。无需本地 CLI、无需手动操作 Dashboard，也无需复杂配置。

#### 用户只需完成以下 3 步：

1. **Fork** DayLock 仓库到自己的 GitHub 账户。
2. **创建 Secret**（请先按照 [🔑 Cloudflare API Token 设置](#-cloudflare-api-token-设置) 生成 Token）：
   - 名称：`CLOUDFLARE_API_TOKEN`
   - （推荐）同时添加 `CLOUDFLARE_ACCOUNT_ID`
   - 在仓库中添加 Secret 的路径：
     > **Settings → Secrets and variables → Actions → Secrets**
3. 进入 **Actions** 标签页 → 点击 **Run workflow**，或直接推送到 `main` 分支。

**完成！**  
构建、KV 创建/查找以及完整部署将全部自动完成，无需任何手动操作。

---

## 🔑 Cloudflare API Token 设置

用于 GitHub Actions（选项 2）以及 CLI 非交互式身份验证。请前往 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) 创建一个包含以下权限的 Token：

* 📜 **Workers Scripts** → `Edit`
* 🗄️ **Workers KV Storage** → `Edit`

将此 Token 以名称 `CLOUDFLARE_API_TOKEN` 添加到 GitHub 仓库的 Secrets 中（详见上方选项 2）。

---

## 🏗️ 数据架构流程

```text
浏览器客户端 (Browser Client)
  ├── 前端界面 (React 19 静态资源)
  └── 密码学内核 (Rust/WASM - 加解密与隐写算法)
        │
        ▼  [仅传输密文数据 / Ciphertext]
Cloudflare Worker 边缘 API
  ├── /api/*   ──> 处理加密请求与速率限制逻辑
  └── /*       ──> 提供静态网页资源与 WASM 包 (/pkg)
        │
        ▼  [加密 Blob 数据]
Cloudflare KV 存储
  ├── DAYLOCK_PASTE_KV
  └── DAYLOCK_RATE_LIMIT_KV
