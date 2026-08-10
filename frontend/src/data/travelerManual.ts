export interface ManualStep {
  title: string;
  badge: string;
  description: string;
  points: string[];
  tip: string;
}

export interface OverviewCard {
  title: string;
  description: string;
}

export interface LanguageManual {
  title: string;
  subtitle: string;
  startTourBtn: string;
  closeBtn: string;
  tabs: {
    overview: string;
    coreModes: string;
    advancedModes: string;
    evasion: string;
    emergency: string;
    perimeter: string;
    shortcuts: string;
  };
  overviewHeading: string;
  overviewText: string;
  overviewCards: OverviewCard[];
  quickNote: string;
  warningText: string;
  steps: {
    coreModes: ManualStep;
    advancedModes: ManualStep;
    evasion: ManualStep;
    emergency: ManualStep;
    perimeter: ManualStep;
  };
}

export const travelerManual: Record<'en' | 'fa', LanguageManual> = {
  en: {
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
      shortcuts: "⌨️ Keyboard Hotkeys",
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
  },
  
  fa: {
    title: "راهنمای کار با دِی‌لاک",
  
    subtitle:
      "راهنمای ساده برای رمزگذاری، پنهان‌سازی و پاک‌سازی امن داده‌های حساس",
  
    startTourBtn: "آغاز راهنما",
    closeBtn: "بستن راهنما",
  
    tabs: {
      overview: "۰. آشنایی با دِی‌لاک",
      coreModes: "۱. رمزگذاری پایه",
      advancedModes: "۲. پنهان‌سازی و ارتباط امن",
      evasion: "۳. رمز پوششی و شرایط سخت",
      emergency: "۴. پاک‌سازی فوری",
      perimeter: "۵. نگهبان‌های بیرونی",
      shortcuts: "⌨️ کلیدهای میانبر",
    },
  
    overviewHeading:
      "ساختار رمزگذاری بدون دسترسی سرور",
  
    overviewText:
      "دِی‌لاک یک گاوصندوق دیجیتالی امنه که برای نگهداری نوشته‌ها، پرونده‌ها و داده‌های حساس ساخته شده. تمام کارهای رمزگذاری و باز کردن رمز، روی خود دستگاه تو و داخل مرورگر انجام میشه. سرور فقط یک نسخه‌ی قفل‌شده از داده‌ها رو نگه می‌داره و هیچ راهی برای دیدن نوشته‌ها یا پیدا کردن کلید رمز تو نداره.",
  
  
    overviewCards: [
      {
        title: "🔐 همه‌چیز روی دستگاه خودت",
  
        description:
          "کلیدهای رمز هیچ‌وقت از دستگاهت بیرون نمی‌رن. نوشته‌ها و پرونده‌ها قبل از فرستادن، همان‌جا رمزگذاری میشن. حتی اگر سرور گرفته بشه یا پایگاه داده‌اش لو بره، چیزی که باقی می‌مونه فقط داده‌های درهم و غیرقابل خواندنه."
      },
  
      {
        title: "🛡️ پاک کردن ردپا",
  
        description:
          "دِی‌لاک طوری ساخته شده که داده‌های حساس تا جای ممکن روی دستگاه باقی نمونه. نوشته‌های یک‌بارمصرف بعد از باز شدن پاک میشن و ابزارهای اضطراری می‌تونن داده‌های باز شده در مرورگر و حافظه دستگاه رو سریع پاک کنن."
      },
  
      {
        title: "🎭 رمز پوششی برای شرایط سخت",
  
        description:
          "اگر کسی تو رو مجبور کرد دِی‌لاک رو باز کنی، می‌تونی از رمز پوششی بهره ببری! این رمز تنها نوشته‌های عادی و بی‌خطر رو نشون میده و راز اصلی همچنان پنهان می‌مونه."
      },
  
      {
        title: "🌐 نگهبان‌های جغرافیایی و هشدار مخفی",
  
        description:
          "می‌تونی مشخص کنی چه کشورها یا نشانی‌های اینترنتی اجازه باز کردن لینک، رو داشته باشن. اگر ربات یا فرد ناشناسی تلاش کنه وارد بشه، دِی‌لاک می‌تونه بهت هشدار بده و واکنش از پیش تعیین‌شده انجام بده."
      }
    ],
  
    quickNote:
      "یادآوری مهم: هیچ ابزار نرم‌افزاری جای مراقبت از خود دستگاه رو نمی‌گیره. اگر وارد محیط‌های حساس میشی، همیشه حواست به امنیت فیزیکی، دستگاهت و روش‌های اضطراری باشه.",
  
    warningText:
      "هشدار امنیتی: اگر رمز اصلی دِی‌لاک رو فراموش کنی، هیچ راهی برای بازگرداندن داده‌های رمزگذاری‌شده وجود نداره. این سیستم هیچ درِ پشتی (Backdoor) یا راه میانبری برای بازیابی رمز نداره.",
  
  
    steps: {
  
      coreModes: {
  
        title: "ساخت نوشته و پرونده رمزگذاری‌شده",
  
        badge: "رمزگذاری پایه",
  
        description:
          "دِی‌لاک بهت اجازه میده نوشته‌ها، یادداشت‌ها و پرونده‌های حساس رو مستقیم روی دستگاه خودت رمزگذاری کنی. همه‌چیز قبل از فرستادن قفل میشه و سرور فقط نسخه‌ی رمز شده رو نگه می‌داره.",
  
  
        points: [
  
          "گاوصندوق نوشته‌ها: از بخش «نوشته» برای نگهداری یادداشت‌ها، گذرواژه‌ها، گزارش‌ها یا هر نوشته‌ی حساسی بهره ببر. شکل و فرمت نوشته هنگام رمزگذاری حفظ میشه.",
  
          "رمزگذاری پرونده و عکس: از بخش «پرونده» یا «عکس» برای امن کردن فایل‌ها بهره ببر. فایل‌ها قبل از فرستادن، تکه‌تکه داخل حافظه دستگاه رمزگذاری میشن.",
  
          "باز کن و تمام! (Burn-on-Read): برای نوشته‌های خعلی حساس این گزینه رو روشن کن. پس از یک‌بار باز شدن پیوند، داده به‌صورت خودکار پاک میشه.",
  
          "قفل با رمز اصلی: یک رمز قوی انتخاب کن. دِی‌لاک از روی این رمز، کلید رمزگذاری قدرتمند می‌سازه. این رمز رو از دست نده چون راه برگشتی وجود نداره.",
  
          "زمان پاک شدن خودکار: می‌تونی مشخص کنی پیوند چه زمانی از بین بره؛ از چند دقیقه تا چند روز."
        ],
  
  
        tip:
          "نکته: هنگام رمزگذاری پرونده‌های بزرگ، مطمئن شو دستگاهت حافظه آزاد کافی داره تا مرورگر هنگام کار سنگین دچار مشکل نشه."
      },
      advancedModes: {

        title: "پنهان‌سازی، تقسیم راز و ارتباط امن",
  
        badge: "پنهان‌کاری پیشرفته",
  
        description:
          "گاهی حتی یک پیوند رمزگذاری‌شده هم ممکنه جلب توجه کنه. دِی‌لاک ابزارهایی داره که کمک می‌کنن داده‌های حساس رو بهتر پنهان کنی و ارتباط امن‌تری داشته باشی.",
  
  
        points: [
  
          "پنهان‌سازی در تصویر (Steganography): نوشته‌ی رمزگذاری‌شده رو داخل یک تصویر معمولی پنهان کن. برای دیگران تصویر مثل یک عکس عادی دیده میشه، اما داده‌ی مخفی داخل آن قرار داره.",
  
          "پنهان‌سازی در صدا: می‌تونی نوشته‌های حساس رو داخل فایل‌های صوتی WAV یا ضبط صدا پنهان کنی؛ بدون اینکه تغییر آشکاری در صدای اصلی ایجاد بشه.",
  
          "تقسیم راز شامیر (Shamir Secret Sharing): رمز اصلی رو به چند بخش، تقسیم کن. برای نمونه می‌تونی یک راز رو به ۵ بخش تقسیم کنی و تعیین کنی که برای بازسازی آن، داشتن ۳ بخش کافی باشه.",
  
          "گفتگوی امن و موقت (E2E): اتاق گفتگوی رمزگذاری‌شده بساز تا بتوانی بدون نگهداری تاریخچه روی سرور، ارتباط امن و کوتاه‌مدت داشته باشی."
        ],
  
  
        tip:
          "نکته پنهان‌سازی: هنگام فرستادن تصویرِ دارای داده مخفی، آن را به شکل <فایل> بفرست، نه تصویر عادی! چون فشرده‌سازی پیام‌رسان‌ها ممکنه داده پنهان رو خراب کنه."
      },
  
  
      evasion: {
  
        title: "فرار از اجبار با رمز پوششی",
  
        badge: "پنهان ماندن راز اصلی",
  
  
        description:
          "اگر در شرایطی کسی تو رو مجبور کرد دِی‌لاک رو باز کنی، رمز پوششی کمک می‌کنه فقط یک فضای بی‌خطر نمایش داده بشه و نوشته‌های اصلی همچنان پنهان بمونن.",
  
  
        points: [
  
          "رمزگذاری دو لایه: هنگام ساخت پیوند، رمز پوششی رو روشن کن تا دو فضای جداگانه داخل یک داده رمزگذاری‌شده ساخته بشه.",
  
          "رمز نمایشی بی‌خطر: یک رمز دوم بساز که به نوشته‌های معمولی مثل برنامه سفر، یادداشت روزانه یا فهرست خرید وصل باشه.",
  
          "باز کردن با رمز پوششی: اگر مجبور شدی لینک رو باز کنی، رمز پوششی رو وارد کن تا تنها بخش عادی نمایش داده بشه.",
  
          "راز اصلی همچنان پنهانه: داده حقیقی پشت لایه‌های رمزگذاری پنهان می‌مونه و از روی داده رمز شده، نمی‌شه وجودش رو اثبات کرد."
        ],
  
  
        tip:
          "نکته: رمز پوششی باس طبیعی به نظر برسه؛ چیزی که در زندگی روزمره خودت هم ممکنه ازش بهره ببری!"
      },
  
  
      emergency: {
  
        title: "پاک‌سازی فوری و نابودی خودکار",
  
        badge: "واکنش سریع",
  
  
        description:
          "در شرایطی که امکان دسترسی به دستگاه وجود داره، دِی‌لاک ابزارهایی داره که می‌تونن رد داده‌های حساس رو سریع پاک کنن.",
  
  
        points: [
  
          "روشن کردن نگهبان‌های اضطراری: قبل از باز کردن داده‌های حساس، حالت‌های پاک‌سازی خودکار رو آماده کن.",
  
          "نگهبان تغییر پنجره (Tab Switch): اگر از صفحه بیرون بری یا برگه مرورگرت عوض بشه، داده‌های باز شده از حافظه پاک میشن.",
  
          "جلوگیری از چاپ و تصویرگیری: هنگام تلاش برای چاپ یا گرفتن تصویر از صفحه، دِی‌لاک می‌تونه داده حساس رو پاک کنه.",
  
          "پاک‌سازی با ضربه مخفی: می‌تونی چند ضربه روی بخش مشخصی از صفحه تعیین کنی تا داده‌ها پاک بشن و صفحه امنی باز بشه.",
  
          "قفل پس از چند تلاش اشتباه: بعد از چند بار وارد کردن رمز نادرست، داده‌ها پاک میشن.",
  
          "نگهبان کلیپ‌بورد (Clipboard Shield): جلوی کپی شدن مستقیم نوشته‌های حساس رو می‌گیره و داده‌های کپی‌شده رو بعد از مدت کوتاه پاک می‌کنه."
        ],
  
  
        tip:
          "تمرین کن: واکنش سریع در شرایط حقیقی مهمه! از قبل بدون اگر اتفاقی افتاد، با چه کاری می‌خوای صفحه رو امن کنی."
      },
      perimeter: {

        title: "لایه‌های نگهبانی بیرونی",
  
        badge: "دفاع پیرامونی",
  
  
        description:
          "دِی‌لاک می‌تونه از پیوندهای تو در برابر تلاش‌های ناشناس، بررسی‌های خودکار و ورودهای ناخواسته نگهبانی کنه و اگر حادثه غیرعادی افتاد، بهت خبر بده.",
  
  
        points: [
  
          "قفل جغرافیایی (Geo Lock): تعیین کن پیوند فقط از کشورها یا نشانی‌های اینترنتی مشخص باز بشه. درخواست‌های خارج از محدوده تعیین‌شده رد میشن.",
  
          "هشدار مخفی (Canary): یک نشانگر پنهان قرار بده تا اگر کسی بدون اجازه سراغ لینک رفت، سریع باخبر بشی.",
  
          "ضامن خودکار در صورت پاسخ ندادن (Dead Man's Switch): یک بازه زمانی رو برای خوندن پیام میتونی تعیین کنی! که اگه در زمان مشخص پیام باز نشد، دِی‌لاک می‌تونه کاری که از پیش، تعریف کردی، مانند پاک کردن داده‌ها، رو انجام بده.",
  
          "انتقال بدون شبکه با QR (Air-Gapped): داده‌ها رو با QR به دستگاه دیگری که به شبکه وصل نیست منتقل کن."
        ],
  
  
        tip:
          "!بهترین نتیجه زمانی به دست میاد که از چند لایه امنیتی رو کنار هم بهره ببری! هیچ ویژگی به تنهایی جای یک روش کامل امنیتی رو نمی‌گیره"
      }
    }
  }
  

};
