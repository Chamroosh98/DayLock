/**
 * Simple, self-contained, exact conversion for Gregorian <-> Jalali calendar systems.
 * Algorithm adapted from jalaali-js.
 */

export function isJalaliLeapYear(jy: number): boolean {
  const remainder = jy % 33;
  return remainder === 1 || remainder === 5 || remainder === 9 || remainder === 13 || remainder === 17 || remainder === 22 || remainder === 26 || remainder === 30;
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const sal_a = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 335];
  let gy: number, gm: number, gd: number;
  let g_day_no: number;
  let j_day_no: number;
  let leap: boolean;

  let jy2 = jy - 979;
  let jm2 = jm - 1;
  let jd2 = jd - 1;

  j_day_no = 365 * jy2 + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4);
  for (let i = 0; i < jm2; ++i) {
    j_day_no += i < 6 ? 31 : 30;
  }
  j_day_no += jd2;

  g_day_no = j_day_no + 79;

  gy = 1600 + 400 * Math.floor(g_day_no / 146097);
  g_day_no = g_day_no % 146097;

  leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;

    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no = g_day_no % 1461;

  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  let i = 0;
  while (g_day_no >= (sal_a[i + 1] || 365) + (i === 1 && leap ? 1 : 0)) {
    g_day_no -= sal_a[i + 1] - sal_a[i] + (i === 1 && leap ? 1 : 0);
    i++;
  }
  gm = i + 1;
  gd = g_day_no + 1;

  return [gy, gm, gd];
}

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  let g_y = gy - 1600;
  let g_m = gm - 1;
  let g_d = gd - 1;

  let g_day_no = 365 * g_y + Math.floor((g_y + 3) / 4) - Math.floor((g_y + 99) / 100) + Math.floor((g_y + 399) / 400);
  for (let i = 0; i < g_m; ++i) {
    const sal_a = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let leap = (g_y % 4 === 0 && g_y % 100 !== 0) || (g_y % 400 === 0);
    g_day_no += i === 1 && leap ? 29 : sal_a[i];
  }
  g_day_no += g_d;

  let j_day_no = g_day_no - 79;

  let j_np = Math.floor(j_day_no / 12053);
  j_day_no = j_day_no % 12053;

  let jy = 979 + 33 * j_np + 4 * Math.floor(j_day_no / 1461);
  j_day_no = j_day_no % 1461;

  if (j_day_no >= 366) {
    jy += Math.floor((j_day_no - 1) / 365);
    j_day_no = (j_day_no - 1) % 365;
  }

  let jm = 0;
  for (let i = 0; i < 11; ++i) {
    let days = i < 6 ? 31 : 30;
    if (j_day_no < days) break;
    j_day_no -= days;
    jm++;
  }
  jm += 1;
  let jd = j_day_no + 1;

  return [jy, jm, jd];
}
