import { useState, useEffect } from 'react';
import { Language } from '../types';
import { gregorianToJalali, jalaliToGregorian } from '../utils/jalaliConverter';

export interface UseJalaliTimeLockProps {
  language: Language;
  hasTimeLock: boolean;
  setUnlockAt: (val: number | null) => void;
}

export const useJalaliTimeLock = ({
  language,
  hasTimeLock,
  setUnlockAt,
}: UseJalaliTimeLockProps) => {
  const [jYear, setJYear] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [jy] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jy;
  });

  const [jMonth, setJMonth] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, jm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jm;
  });

  const [jDay, setJDay] = useState<number>(() => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const [, , jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return jd;
  });

  const [jHour, setJHour] = useState<number>(() => new Date().getHours());
  const [jMinute, setJMinute] = useState<number>(() => new Date().getMinutes());

  useEffect(() => {
    if (language === 'fa' && hasTimeLock) {
      try {
        const [gy, gm, gd] = jalaliToGregorian(jYear, jMonth, jDay);
        const gDate = new Date(gy, gm - 1, gd, jHour, jMinute, 0);
        setUnlockAt(Math.floor(gDate.getTime() / 1000));
      } catch (err) {
        console.error('Error converting Jalali to Gregorian:', err);
      }
    }
  }, [jYear, jMonth, jDay, jHour, jMinute, language, hasTimeLock, setUnlockAt]);

  return {
    jYear, setJYear,
    jMonth, setJMonth,
    jDay, setJDay,
    jHour, setJHour,
    jMinute, setJMinute,
  };
};
