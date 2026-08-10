

<div align="center">
  <img src="../../frontend/public/dl.svg" alt="DayLock Logo" width="97" height="97" style="vertical-align: middle; margin-right: 8px;">
  <h1>
    <span style="vertical-align: middle;">DayLock</span>
  </h1>
</div>

<p align="center">
  <strong>🕊️ به یاد کشتار فجیعانه ایران در ۱۸-۱۹ دی ماه خونین ۱۴۰۴</strong>
</p>

---

<p align="center">
  <a href="https://github.com/Chamroosh98/DayLock/releases"><img src="https://img.shields.io/badge/-v1.0.0-1D63ED?style=for-the-badge&logo=github&logoColor=white" alt="Release"></a>
  <a href="https://dash.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"></a>
  <a href="https://webassembly.org/"><img src="https://img.shields.io/badge/WebAssembly-654FF0?style=for-the-badge&logo=webassembly&logoColor=white" alt="WebAssembly"></a>
  <a href="https://www.rust-lang.org/"><img src="https://img.shields.io/badge/Rust-D34516?style=for-the-badge&logo=rust&logoColor=FFF7ED" alt="Rust"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=FBF0DF" alt="Bun"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
</p>

<p align="center">
  <a href="../../README.md"><strong>English Guide</strong></a>
</p>

---

- [🚀 ابزار DayLock چیه؟](#-ابزار-daylock-چیه)
- [✨ قابلیت‌ها و ویژگی‌ها](#-قابلیت‌ها-و-ویژگی‌ها)
- [🛠️ پیش‌نیازها و ابزارهای مورد نیاز](#️-پیش‌نیازها-و-ابزارهای-مورد-نیاز)
- [🚀 روش‌های دپلوی و راه اندازی](#-روش‌های-دپلوی-و-راه-اندازی)
  - [روش اول : اسکریپت خودکار CLI (پیشنهادی)](#روش-اول--اسکریپت-خودکار-cli-پیشنهادی-)
  - [روش دوم : دپلوی دستی به وسیله Cloudflare Panel / Github](#روش-دوم--دپلوی-دستی-به-وسیله-cloudflare-panel--github)
- [🔑 تنظیمات API Token کلودفلر (اختیاری)](#-تنظیمات-api-token-کلودفلر-اختیاری)
- [💾 اتصال به ذخیره‌سازی Backblaze B2 (اختیاری)](#-اتصال-به-ذخیره‌سازی-backblaze-b2-اختیاری)
- [🏗️ معماری و جریان داده‌ها (Architecture Flow)](#️-معماری-و-جریان-داده‌ها-architecture-flow)

---

## 🚀 ابزار DayLock چیه؟

ابزار **DayLock** یه سرویس اشتراک‌گذاری متن و فایل با رمزنگاری سمت کلاینت (Client-Side Encrypted Paste) به صورت کاملاً متن‌بازه! توی دی‌لاک، متن‌های ساده (Plaintext) و کلیدهای رمزگشایی **به هیچ وجه** پاشون به سرور یا شبکه کلودفلر نمی‌رسه! کل فرآیند رمزنگاری و مشتق‌سازی کلید، مستقیماً داخل مرورگرت و به لطف موتور پرسرعت Rust WebAssembly (WASM) انجام میشه.

---

## ✨ قابلیت‌ها و ویژگی‌ها

- 🔐 **دسترسی سرور (Zero-Knowledge) :** الگوریتم رمزنگاری AES-256-GCM + مشتق‌سازی کلید با Argon2 کاملاً سمت مرورگر با کد کامپایل‌شده Rust/WASM اجرا میشه.
- ⚡ **سرعت فوق‌العاده روی Edge :** اندپک‌ها و وب‌سایت استاتیک رو لبه‌های شبکه Serverless کلودفلر (Cloudflare Workers + KV Storage) سوارن.
- 💥 **تخریب پس از خواندن (Burn-on-Read) و زمان انقضا :** قابلیت حذف خودکار متن/فایل بلافاصله بعد از اولین بازدید یا تموم شدن زمان تعیین‌شده (TTL).
- 🛡️ **محدودکننده درخواست (Rate Limiting) :** حفاظت در برابر اسپم با لیمیتر هوشمند IP/فینگرپرینت بر پایه Cloudflare KV.
- 🎨 **رابط کاربری مدرن و مینیمال :** پیاده‌سازی‌شده با React 19، Vite و Tailwind CSS.
- 🚀 **نصب خودکار تک‌مرحله‌ای :** دارای اسکریپت CLI تعاملی (`setup.sh`) برای بیلد، کانفیگ KVها و دیپلوی بی‌دردسر.

---

## 🛠️ پیش‌نیازها و ابزارهای مورد نیاز

اگه قصد داری با اسکریپت CLI پروژه رو روی سیستمت بیلد و دپلوی کنی، مطمئن شو ابزارهای زیر نصبت :

| ابزار | نسخه پیشنهادی | کاربرد |
| :--- | :--- | :--- |
| **[Rust](https://rustup.rs/)** | `stable` | کامپایل هسته رمزنگاری به WebAssembly |
| **[wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)** | `latest` | پل ارتباطی و بهینه‌ساز Rust به WASM |
| **[Bun](https://bun.sh/)** | `v1.0+` | ران‌تایم و پکیج‌منجر فوق سریع جاوااسکریپت |
| **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)** | `v3.0+` | ابزار مدیریت و دپلوی Cloudflare Workers |
| **اکانت کلودفلر** | Free Tier (رایگان) | میزبانی Worker و دیتابیس KV Storage |

---

## 🚀 روش‌های دپلوی و راه اندازی

پروژه رو می‌تونی هم به شکل **CLI** و هم به شکل **دستی داخل پنل وب کلودفلر** بالا بیاری.

---

### روش نخست : اسکریپت خودکار CLI (پیشنهادی)

توی این روش همه‌چیز (کامپایل WASM، ساخت KVها روی کلودفلر، ست کردن کانفیگ‌ها و دپلوی) به صورت خودکار انجام میشه.

```bash
git clone https://github.com/Chamroosh98/DayLock.git
cd DayLock
chmod +x setup.sh
./setup.sh
```

⁉️ اسکریپت `setup.sh` دقیقاً چه‌کار می‌کنه؟

**🔑 احراز هویت** — لاگین مرورگر (`wrangler login`) یا توکن API کلودفلر رو چک می‌کنه.

**📦 ساخت فضای KV** — دو تا دیتابیس `DAYLOCK_RATE_LIMIT_KV` و `DAYLOCK_PASTE_KV` رو اتوماتیک روی اکانت کلودفلرت می‌سازه.

**⚙️ کانفیگ خودکار** — فایل `backend/worker/wrangler.toml` رو با ID های اختصاصی دیتابیس‌هایت رندر می‌کنه.

**🏗️ زنجیره بیلد** — فرانت‌اند رو بیلد می‌کنه و پکیج WASM رو تزریق می‌کنه به `frontend/dist/pkg`.

**🌐 انتشار روی Edge** — در نهایت وب‌سایت و API ورکرت رو روی کلودفلر دیپلوی می‌کنه.

🎉 **تادااا!** آخر کار، لینک اختصاصیت رو تحویل می‌گیری :

> `https://daylock.<subdomain>.workers.dev`

---

### روش دوم : دپلوی دستی به وسیله CloudFlare Panel / Github

اگه به هر دلیلی ترمینال یا CLI دم دستت نیست و می‌خوای مستقیم از وب‌سایت کلودفلر دپلوی کنی :

۱. وارد [داشبورد کلودفلر](https://dash.cloudflare.com/) بشو.

۲. برو به بخش **Compute (Workers & Pages)** -> **Workers & Pages**.

۳. روی **Create Application** کلیک کن -> گزینه‌ی **Pages** (یا لینک *Connect Git*) رو انتخاب کن.

۴. ریپازیتوری `DayLock` رو از گیت‌هابت وصل کن.

۵. **ساخت دستی دیتابیس‌های KV :**

* توی پنل کلودفلر برو به -> **KV** <- **Workers & Pages**.
* حالا دو تا  **KV** جدید دقیقا با این نام‌ها بساز :
* `DAYLOCK_RATE_LIMIT_KV`
* `DAYLOCK_PASTE_KV`




۶. **ست کردن بایدینگ ها (Bindings):**
* توی تنظیمات پروژه 

(**Settings** -> **Functions** / **Bindings** -> **KV Namespace Bindings**)
* متغیر `DAYLOCK_RATE_LIMIT_KV` رو وصل کن به KV هم‌نام خودش.
* متغیر `DAYLOCK_PASTE_KV` رو هم وصل کن به KV هم‌نام خودش.


۷. روی **Save and Deploy** کلیک کن و تمام!

---

## 🔑 تنظیمات API Token کلودفلر (اختیاری)

اگه موقع اجرای اسکریپتCLI دوست نداری با لاگین مرورگر احراز هویت کنی، می‌تونی یه توکن از بخش [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) بسازی.

قالب **Edit Cloudflare Workers** رو انتخاب کن یا دسترسی‌های زیر رو بهش بده:

* 📜 **Workers Scripts**    -> `Edit`
* 🗄️ **Workers KV Storage** -> `Edit`

<br>

> 💡 **نکته :** شناسه `Account ID` اختیاریه و تنها زمانی لازمه که کدت چند تا اکانت مختلف کلودفلر رو مدیریت کنه.

---

## 💾 اتصال به ذخیره‌سازی Backblaze B2 (اختیاری)

اگه می‌خوای امکان آپلود فایل‌های حجیم‌تر رو هم فعال کنی و متصلش کنی به یک Object Storage خارجی مانند Backblaze B2 :

```bash
cd backend/worker
wrangler secret put B2_KEY_ID
wrangler secret put B2_APP_KEY
```

---

## 🏗️ معماری داده‌ها (Architecture Flow)

جریان داده‌ها طوری طراحی شده که امنیت و حریم‌خصوصی بدون دسترسی سرور، تضمین بشه! یعنی کل دیتا **فقط و فقط** داخل مرورگر کاربر می‌مونن!

```text
مرورگر کاربر (Browser Client)
  ├── رابط کاربری (React 19 Static Assets)
  └── هسته رمزنگاری (Rust/WASM - Encrypt & Decrypt)
        │
        ▼  [فقط داده‌های رمزنگاری‌شده / Ciphertext]
ورکر کلودفلر (Cloudflare Worker API)
  ├── /api/*  
  └── /*     
        │
        ▼  [Encrypted Blobs]
دیتابیس‌های کلودفلر (Cloudflare KV Storage)
  ├── DAYLOCK_PASTE_KV
  └── DAYLOCK_RATE_LIMIT_KV
```
