import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { jalaliToGregorian, gregorianToJalali, isJalaliLeapYear } from '../utils/jalaliConverter';
import { localizeDigitsValue } from '../utils/numberConverter';

interface DateTimePickerProps {
  value: number | null; // epoch timestamp in seconds
  onChange: (value: number) => void;
  language: 'en' | 'fa';
  isDarkMode: boolean;
}

const GREGORIAN_MONTHS = [
  { value: 1, en: 'Jan', fa: 'ژانویه' },
  { value: 2, en: 'Feb', fa: 'فوریه' },
  { value: 3, en: 'Mar', fa: 'مارس' },
  { value: 4, en: 'Apr', fa: 'آوریل' },
  { value: 5, en: 'May', fa: 'مه' },
  { value: 6, en: 'Jun', fa: 'ژوئن' },
  { value: 7, en: 'Jul', fa: 'ژوئیه' },
  { value: 8, en: 'Aug', fa: 'اوت' },
  { value: 9, en: 'Sep', fa: 'سپتامبر' },
  { value: 10, en: 'Oct', fa: 'اکتبر' },
  { value: 11, en: 'Nov', fa: 'نوامبر' },
  { value: 12, en: 'Dec', fa: 'دسامبر' },
];

const JALALI_MONTHS = [
  { value: 1, name: 'فروردین' },
  { value: 2, name: 'اردیبهشت' },
  { value: 3, name: 'خرداد' },
  { value: 4, name: 'تیر' },
  { value: 5, name: 'مرداد' },
  { value: 6, name: 'شهریور' },
  { value: 7, name: 'مهر' },
  { value: 8, name: 'آبان' },
  { value: 9, name: 'آذر' },
  { value: 10, name: 'دی' },
  { value: 11, name: 'بهمن' },
  { value: 12, name: 'اسفند' },
];

export function DateTimePicker({ value, onChange, language, isDarkMode }: DateTimePickerProps) {
  const isJalali = language === 'fa';
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');

  const getNowValues = () => {
    const now = new Date();
    const gY = now.getFullYear();
    const gM = now.getMonth() + 1;
    const gD = now.getDate();
    const currentHour = now.getHours();
    const m = now.getMinutes();
    const h12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const amOrPm: 'AM' | 'PM' = currentHour >= 12 ? 'PM' : 'AM';

    if (isJalali) {
      const [jy, jm, jd] = gregorianToJalali(gY, gM, gD);
      return { year: jy, month: jm, day: jd, hour12: h12, minute: m, ampm: amOrPm };
    } else {
      return { year: gY, month: gM, day: gD, hour12: h12, minute: m, ampm: amOrPm };
    }
  };

  const getHour24 = (h: number, p: 'AM' | 'PM') => {
    const h12 = h % 12;
    return p === 'PM' ? h12 + 12 : h12;
  };

  const getMonthOptions = () => {
    const nowVal = getNowValues();
    const allMonths = isJalali ? JALALI_MONTHS.map(m => m.value) : GREGORIAN_MONTHS.map(m => m.value);
    if (year === nowVal.year) {
      return allMonths.filter(m => m >= nowVal.month);
    }
    return allMonths;
  };

  const getDayOptions = () => {
    const nowVal = getNowValues();
    const totalDays = getMaxDays(year, month);
    const allDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    if (year === nowVal.year && month === nowVal.month) {
      return allDays.filter(d => d >= nowVal.day);
    }
    return allDays;
  };

  const getAmpmOptions = () => {
    const nowVal = getNowValues();
    if (year === nowVal.year && month === nowVal.month && day === nowVal.day) {
      if (nowVal.ampm === 'PM') {
        return ['PM'];
      }
    }
    return ['AM', 'PM'];
  };

  const getHourOptions = () => {
    const allHours = Array.from({ length: 12 }, (_, i) => i + 1);
    const nowVal = getNowValues();
    if (year === nowVal.year && month === nowVal.month && day === nowVal.day) {
      if (ampm === nowVal.ampm) {
        const nowH24 = getHour24(nowVal.hour12, nowVal.ampm);
        return allHours.filter(h => getHour24(h, ampm) >= nowH24);
      }
    }
    return allHours;
  };

  const getMinuteOptions = () => {
    const allMinutes = Array.from({ length: 60 }, (_, i) => i);
    const nowVal = getNowValues();
    if (year === nowVal.year && month === nowVal.month && day === nowVal.day) {
      if (ampm === nowVal.ampm && hour12 === nowVal.hour12) {
        return allMinutes.filter(m => m >= nowVal.minute);
      }
    }
    return allMinutes;
  };

  // Compute robust initial values synchronously
  const getInitialValues = () => {
    let baseDate = new Date();
    if (value) {
      baseDate = new Date(value * 1000);
    } else {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    const gY = baseDate.getFullYear();
    const gM = baseDate.getMonth() + 1;
    const gD = baseDate.getDate();
    const currentHour = baseDate.getHours();
    const m = baseDate.getMinutes();
    const h12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const amOrPm: 'AM' | 'PM' = currentHour >= 12 ? 'PM' : 'AM';

    if (language === 'fa') {
      const [jy, jm, jd] = gregorianToJalali(gY, gM, gD);
      return { year: jy, month: jm, day: jd, hour12: h12, minute: m, ampm: amOrPm };
    } else {
      return { year: gY, month: gM, day: gD, hour12: h12, minute: m, ampm: amOrPm };
    }
  };

  const initialValues = getInitialValues();

  // Internal states sync'd to value prop
  const [year, setYear] = useState<number>(initialValues.year);
  const [month, setMonth] = useState<number>(initialValues.month);
  const [day, setDay] = useState<number>(initialValues.day);
  const [hour12, setHour12] = useState<number>(initialValues.hour12);
  const [minute, setMinute] = useState<number>(initialValues.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initialValues.ampm);

  // Sync from value prop if it updates externally
  useEffect(() => {
    let baseDate = new Date();
    if (value) {
      baseDate = new Date(value * 1000);
    } else {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    const gY = baseDate.getFullYear();
    const gM = baseDate.getMonth() + 1;
    const gD = baseDate.getDate();

    const currentHour = baseDate.getHours();
    const m = baseDate.getMinutes();
    
    const h12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
    const amOrPm = currentHour >= 12 ? 'PM' : 'AM';

    setMinute(m);
    setHour12(h12);
    setAmpm(amOrPm);

    if (isJalali) {
      const [jy, jm, jd] = gregorianToJalali(gY, gM, gD);
      setYear(jy);
      setMonth(jm);
      setDay(jd);
    } else {
      setYear(gY);
      setMonth(gM);
      setDay(gD);
    }
  }, [value, isJalali]);

  // Trigger onChange when picker values change
  const triggerChange = (
    newY: number,
    newM: number,
    newD: number,
    newH12: number,
    newMin: number,
    newAmpm: 'AM' | 'PM'
  ) => {
    try {
      // Calculate 24-hour hour
      let h24 = newH12 % 12;
      if (newAmpm === 'PM') {
        h24 += 12;
      }

      let finalDate: Date;
      if (isJalali) {
        const [gy, gm, gd] = jalaliToGregorian(newY, newM, newD);
        finalDate = new Date(gy, gm - 1, gd, h24, newMin, 0);
      } else {
        finalDate = new Date(newY, newM - 1, newD, h24, newMin, 0);
      }

      // Ensure selectable date/time is never in the past
      const now = new Date();
      // Allow 5-second leeway for small rendering delays
      if (finalDate.getTime() < now.getTime() - 5000) {
        finalDate = now;
        
        const gY = now.getFullYear();
        const gM = now.getMonth() + 1;
        const gD = now.getDate();
        const currentHour = now.getHours();
        const m = now.getMinutes();
        const h12 = currentHour % 12 === 0 ? 12 : currentHour % 12;
        const amOrPm = currentHour >= 12 ? 'PM' : 'AM';

        setHour12(h12);
        setMinute(m);
        setAmpm(amOrPm);

        if (isJalali) {
          const [jy, jm, jd] = gregorianToJalali(gY, gM, gD);
          setYear(jy);
          setMonth(jm);
          setDay(jd);
        } else {
          setYear(gY);
          setMonth(gM);
          setDay(gD);
        }
      }

      onChange(Math.floor(finalDate.getTime() / 1000));
    } catch (e) {
      console.error(e);
    }
  };

  // Safe Month Day limit calculation
  const getMaxDays = (currentYear: number, currentMonth: number) => {
    if (isJalali) {
      if (currentMonth <= 6) return 31;
      if (currentMonth <= 11) return 30;
      return isJalaliLeapYear(currentYear) ? 30 : 29;
    } else {
      return new Date(currentYear, currentMonth, 0).getDate();
    }
  };

  const getYearRange = () => {
    const now = new Date();
    let currentLocalYear = now.getFullYear();
    if (isJalali) {
      const [jy] = gregorianToJalali(currentLocalYear, now.getMonth() + 1, now.getDate());
      currentLocalYear = jy;
    }
    // Only current year and the next 10 years! No past years!
    return Array.from({ length: 11 }, (_, i) => currentLocalYear + i);
  };

  // Value change handlers
  const handleYearChange = (val: number) => {
    setYear(val);
    const maxDays = getMaxDays(val, month);
    let safeDay = day;
    if (day > maxDays) {
      safeDay = maxDays;
      setDay(maxDays);
    }
    triggerChange(val, month, safeDay, hour12, minute, ampm);
  };

  const handleMonthChange = (val: number) => {
    setMonth(val);
    const maxDays = getMaxDays(year, val);
    let safeDay = day;
    if (day > maxDays) {
      safeDay = maxDays;
      setDay(maxDays);
    }
    triggerChange(year, val, safeDay, hour12, minute, ampm);
  };

  const handleDayChange = (val: number) => {
    setDay(val);
    triggerChange(year, month, val, hour12, minute, ampm);
  };

  const handleHourChange = (val: number) => {
    setHour12(val);
    triggerChange(year, month, day, val, minute, ampm);
  };

  const handleMinuteChange = (val: number) => {
    setMinute(val);
    triggerChange(year, month, day, hour12, val, ampm);
  };

  const handleAmpmChange = (val: 'AM' | 'PM') => {
    setAmpm(val);
    triggerChange(year, month, day, hour12, minute, val);
  };

  // Helper translations base
  const tTab = {
    date: isJalali ? 'تاریخ بازگشایی' : 'Unlock Date',
    time: isJalali ? 'زمان بازگشایی' : 'Unlock Time',
    timePill: isJalali ? 'ساعت بازگشایی' : 'Time Selection',
    datePill: isJalali ? 'انتخاب تاریخ' : 'Date Selection',
    year: isJalali ? 'سال' : 'Year',
    month: isJalali ? 'ماه' : 'Month',
    day: isJalali ? 'روز' : 'Day',
    hour: isJalali ? 'ساعت' : 'Hour',
    minute: isJalali ? 'دقیقه' : 'Minute',
    period: isJalali ? 'بخش روز' : 'AM/PM',
  };

  // Formatting strings
  const formatTimeStr = () => {
    const formattedMin = minute < 10 ? `0${minute}` : `${minute}`;
    const displayHour = hour12;
    if (isJalali) {
      const ampmStr = ampm === 'AM' ? 'قبل از ظهر (AM)' : 'بعد از ظهر (PM)';
      return localizeDigitsValue(`${displayHour}:${formattedMin} ${ampmStr}`, 'fa');
    }
    return `${displayHour}:${formattedMin} ${ampm}`;
  };

  const formatDateStr = () => {
    if (isJalali) {
      const monthObj = JALALI_MONTH_NAMES[month - 1];
      return localizeDigitsValue(`${day} ${monthObj} ${year}`, 'fa');
    }
    const monthObj = GREGORIAN_MONTHS[month - 1]?.en || '';
    return `${monthObj} ${day}, ${year}`;
  };

  return (
    <div className={`flex flex-col gap-5 p-5 md:p-6 rounded-3xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-zinc-950/40 border-purple-500/10 shadow-2xl shadow-purple-950/5' 
        : 'bg-white border-zinc-100 shadow-xl shadow-zinc-200/50'
    }`} dir={isJalali ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Header mimicking the premium look in sample */}
      <div className="flex items-center justify-between border-b border-zinc-500/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
            {activeTab === 'date' ? <CalendarIcon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {activeTab === 'date' ? tTab.datePill : tTab.timePill}
            </h4>
          </div>
        </div>
      </div>

      {/* Tabs / Segments */}
      <div 
        className={`grid grid-cols-2 p-1 rounded-2xl ${isDarkMode ? 'bg-zinc-900/60' : 'bg-zinc-100/80'} gap-1`}
        dir="ltr"
      >
        <button
          type="button"
          onClick={() => setActiveTab('date')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'date'
              ? isDarkMode 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{tTab.date}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('time')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'time'
              ? isDarkMode 
                ? 'bg-zinc-800 text-white shadow-md' 
                : 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{tTab.time}</span>
        </button>
      </div>

      {/* Selector Container */}
      <div className="flex flex-col gap-3 py-1">
        {/* Unified Top Headers Row */}
        <div 
          className={`grid ${activeTab === 'date' ? 'grid-cols-[1.1fr_1.4fr_0.9fr]' : 'grid-cols-[1fr_1fr_1fr]'} gap-2 px-1 text-center select-none`}
          dir={isJalali ? 'ltr' : undefined}
        >
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pointer-events-none">
            {activeTab === 'date' ? tTab.year : tTab.hour}
          </span>
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pointer-events-none">
            {activeTab === 'date' ? tTab.month : tTab.minute}
          </span>
          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pointer-events-none">
            {activeTab === 'date' ? tTab.day : tTab.period}
          </span>
        </div>

        {/* Wheel wrapper with a single, precisely aligned absolute selection border */}
        <div className="relative">
          <div className={`absolute top-1/2 -translate-y-1/2 left-1 right-1 h-11 pointer-events-none rounded-2xl border ${
            isDarkMode 
              ? 'bg-white/[0.06] border-white/10 shadow-lg' 
              : 'bg-purple-500/[0.05] border-purple-500/25 shadow-sm'
          }`} />

          {/* Top Mask Gradient */}
          <div className={`absolute top-0 left-0 right-0 h-12 pointer-events-none z-10 bg-gradient-to-b ${
            isDarkMode 
              ? 'from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent' 
              : 'from-white via-white/85 to-transparent'
          }`} />

          {/* Bottom Mask Gradient */}
          <div className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10 bg-gradient-to-t ${
            isDarkMode 
              ? 'from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent' 
              : 'from-white via-white/85 to-transparent'
          }`} />

          <div 
            className={`relative grid ${activeTab === 'date' ? 'grid-cols-[1.1fr_1.4fr_0.9fr]' : 'grid-cols-[1fr_1fr_1fr]'} gap-2 overflow-hidden h-[210px]`}
            dir={isJalali ? 'ltr' : undefined}
          >
            <AnimatePresence mode="wait">
              {activeTab === 'date' ? (
                <React.Fragment key="date-picker-cols">
                  {/* YEAR PICKER COLUMN */}
                  <PickerScrollCol
                    value={year}
                    options={getYearRange()}
                    onChange={handleYearChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />

                  {/* MONTH PICKER COLUMN */}
                  <PickerScrollCol
                    value={month}
                    options={getMonthOptions()}
                    displayFormatter={(val) => {
                      if (isJalali) return JALALI_MONTHS[val - 1]?.name || '';
                      return GREGORIAN_MONTHS[val - 1]?.en || '';
                    }}
                    onChange={handleMonthChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />

                  {/* DAY PICKER COLUMN */}
                  <PickerScrollCol
                    value={day}
                    options={getDayOptions()}
                    onChange={handleDayChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />
                </React.Fragment>
              ) : (
                <React.Fragment key="time-picker-cols">
                  {/* HOUR COLUMN */}
                  <PickerScrollCol
                    value={hour12}
                    options={getHourOptions()}
                    onChange={handleHourChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />

                  {/* MINUTE COLUMN */}
                  <PickerScrollCol
                    value={minute}
                    options={getMinuteOptions()}
                    displayFormatter={(val) => val < 10 ? `0${val}` : `${val}`}
                    onChange={handleMinuteChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />

                  {/* AM/PM COLUMN */}
                  <PickerScrollCol
                    value={ampm}
                    options={getAmpmOptions()}
                    displayFormatter={(val) => {
                      if (isJalali) {
                        return val === 'AM' ? 'ق.ظ' : 'ب.ظ';
                      }
                      return val;
                    }}
                    onChange={handleAmpmChange}
                    isDarkMode={isDarkMode}
                    language={language}
                  />
                </React.Fragment>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent: A vertical picker list mimicking iOS wheel selection
interface PickerScrollColProps<T> {
  value: T;
  options: T[];
  displayFormatter?: (val: T) => string;
  onChange: (val: T) => void;
  isDarkMode: boolean;
  language: 'en' | 'fa';
}

function PickerScrollCol<T extends string | number>({
  value,
  options,
  displayFormatter,
  onChange,
  isDarkMode,
  language
}: PickerScrollColProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    startY: 0,
    startIndex: 0,
    isDragging: false,
  });

  // Return nothing if options array is empty to prevent crashes
  if (!options || options.length === 0) {
    return null;
  }

  // Gracefully handle value not found in options by fallback to index 0
  const indexOfVal = options.indexOf(value);
  const currentIndex = indexOfVal === -1 ? 0 : indexOfVal;

  // Sync state if options change and current selected option is no longer valid
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const optionsKey = options.join(',');

  useEffect(() => {
    if (options.indexOf(value) === -1 && options.length > 0) {
      onChangeRef.current(options[0]);
    }
  }, [optionsKey, value]);

  const increment = () => {
    if (currentIndex < options.length - 1) {
      onChange(options[currentIndex + 1]);
    }
  };

  const decrement = () => {
    if (currentIndex > 0) {
      onChange(options[currentIndex - 1]);
    }
  };

  // Keyboard or standard click navigation
  const handleClickItem = (val: T) => {
    onChange(val);
  };

  // Touch and Mouse Gesture Handlers for Wheel Swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current = {
      startY: e.touches[0].clientY,
      startIndex: currentIndex,
      isDragging: true,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const currentY = e.touches[0].clientY;
    const diffY = currentY - dragRef.current.startY;
    
    // Smooth threshold: 30 pixels drag triggers 1 item step change
    const deltaItems = Math.round(diffY / 30);
    if (deltaItems !== 0) {
      let newIndex = dragRef.current.startIndex - deltaItems;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= options.length) newIndex = options.length - 1;
      
      if (newIndex !== currentIndex) {
        onChange(options[newIndex]);
      }
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      startY: e.clientY,
      startIndex: currentIndex,
      isDragging: true,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    const currentY = e.clientY;
    const diffY = currentY - dragRef.current.startY;
    
    const deltaItems = Math.round(diffY / 30);
    if (deltaItems !== 0) {
      let newIndex = dragRef.current.startIndex - deltaItems;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= options.length) newIndex = options.length - 1;
      
      if (newIndex !== currentIndex) {
        onChange(options[newIndex]);
      }
    }
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  // Optional Mouse Wheel/Trackpad support inside individual column
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      increment();
    } else if (e.deltaY < 0) {
      decrement();
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full flex flex-col justify-between items-center overflow-hidden group select-none touch-none cursor-ns-resize"
    >
      
      {/* Up arrow */}
      <button
        type="button"
        onClick={decrement}
        className={`absolute top-0.5 z-10 p-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-115 cursor-pointer ${
          isDarkMode ? 'text-zinc-500 hover:text-purple-400 hover:bg-white/5' : 'text-zinc-400 hover:text-purple-600 hover:bg-black/5'
        }`}
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      {/* Scrollable middle section */}
      <div 
        ref={containerRef}
        style={{ perspective: '500px', transformStyle: 'preserve-3d' }}
        className="w-full h-full flex flex-col justify-center items-center relative scrollbar-none pointer-events-none"
      >
        {[-2, -1, 0, 1, 2].map((offset) => {
          const targetIdx = currentIndex + offset;
          
          if (targetIdx < 0 || targetIdx >= options.length) {
            return (
              <div
                key={`empty-${offset}`}
                style={{ height: '42px' }}
                className="w-full flex items-center justify-center opacity-0 pointer-events-none select-none text-sm"
              />
            );
          }

          const item = options[targetIdx];
          const display = displayFormatter ? displayFormatter(item) : String(item);
          const localizedDisplay = localizeDigitsValue(display, language);

          // Opacities, scale, and 3D curve based on offset from center (0)
          const isActive = offset === 0;
          const absOffset = Math.abs(offset);
          const opacity = isActive ? 1 : absOffset === 1 ? (isDarkMode ? 0.5 : 0.45) : (isDarkMode ? 0.22 : 0.2);
          const scale = isActive ? 1.15 : absOffset === 1 ? 0.94 : 0.8;
          const rotateX = offset * -18;
          const translateZ = absOffset * -15;

          return (
            <button
              key={`${offset}-${item}`}
              type="button"
              onClick={() => handleClickItem(item)}
              style={{ 
                opacity, 
                transform: `rotateX(${rotateX}deg) translateZ(${translateZ}px) scale(${scale})`,
                transformStyle: 'preserve-3d',
                height: '42px'
              }}
              className={`w-full text-center font-bold transition-all duration-200 ease-out pointer-events-auto leading-none cursor-pointer flex items-center justify-center whitespace-nowrap truncate px-1 ${
                isActive 
                  ? isDarkMode 
                    ? `text-purple-400 font-extrabold text-base sm:text-lg md:text-xl ${language === 'fa' ? 'font-sans' : 'font-mono'}` 
                    : `text-purple-600 font-extrabold text-base sm:text-lg md:text-xl ${language === 'fa' ? 'font-sans' : 'font-mono'}`
                  : isDarkMode 
                    ? 'text-zinc-400 text-xs sm:text-sm font-semibold' 
                    : 'text-zinc-500 text-xs sm:text-sm font-semibold'
              }`}
            >
              {localizedDisplay}
            </button>
          );
        })}
      </div>

      {/* Down arrow */}
      <button
        type="button"
        onClick={increment}
        className={`absolute bottom-0.5 z-10 p-0.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-115 cursor-pointer ${
          isDarkMode ? 'text-zinc-500 hover:text-purple-400 hover:bg-white/5' : 'text-zinc-400 hover:text-purple-600 hover:bg-black/5'
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];
