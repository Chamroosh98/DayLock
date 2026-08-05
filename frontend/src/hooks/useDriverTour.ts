import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Language } from "../types";

export const useDriverTour = (isDarkMode: boolean, language: Language) => {
  const startTour = () => {
    const d = driver({
      showProgress: true,
      animate: true,
      overlayColor: isDarkMode ? '#030409' : '#f4f4f5',
      overlayOpacity: 0.85,
      stagePadding: 6,
      popoverClass: isDarkMode ? 'driver-popover-dark' : 'driver-popover-light',
      nextBtnText: language === 'en' ? 'Next →' : 'بعدی ←',
      prevBtnText: language === 'en' ? '← Prev' : '→ قبلی',
      doneBtnText: language === 'en' ? 'Done ✓' : 'پایان ✓',
      steps: [
        { 
          element: '#content-type-selector', 
          popover: { 
            title: language === 'en' ? 'Payload Formats' : 'قالب‌های ارسال محتوا', 
            description: language === 'en' 
              ? 'Select from six specialized templates: secure text, files, steganography, audio logs, secret splitting, or E2E chat rooms.' 
              : 'از بین ۶ قالب تخصصی انتخاب کنید: پیام متنی، فایل امن، پنهان‌نگاری در تصویر، ضبط صدا، تقسیم راز یا چت امن دوطرفه.',
            side: "bottom", 
            align: 'start' 
          } 
        },
        { 
          element: '#options-grid', 
          popover: { 
            title: language === 'en' ? 'Operational Controls' : 'گزینه‌های امنیتی و حفاظتی', 
            description: language === 'en' 
              ? 'Configure zero-knowledge protection guards, including Password locks, self-destruct countdowns, geo-fences, and automatic Burn-on-Read.' 
              : 'تنظیمات حفاظتی دانش-صفر مانند قفل عبور، حذف پس از خواندن، محدوده جغرافیایی مجاز، و تخریب خودکار را پیکربندی کنید.',
            side: "top", 
            align: 'start' 
          } 
        },
        { 
          element: '#opt-honeypot', 
          popover: { 
            title: language === 'en' ? 'Honeypot Decoy' : 'تله عسل (حالت فریب)', 
            description: language === 'en' 
              ? 'Set a benign secondary passphrase linked to innocent cover-content. If compromised or forced to decrypt, providing the decoy reveals safe data while keeping your real secret invisible.' 
              : 'یک رمز عبور فرعی برای شرایط اضطراری تعریف کنید. در صورت اجبار، ارائه این رمز عبور اطلاعاتی بی‌خطر را نشان داده و محتوای اصلی را پنهان نگه می‌دارد.',
            side: "top", 
            align: 'start' 
          } 
        }
      ]
    });
    d.drive();
  };

  return { startTour };
};
