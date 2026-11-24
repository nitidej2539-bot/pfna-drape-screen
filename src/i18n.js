// ระบบสองภาษา (ไทย/อังกฤษ): ข้อความไทยเป็นหลัก คำแปลอยู่ใน data/en.js
// ไม่มีคำแปล = แสดงภาษาไทยเดิม
import { useSyncExternalStore } from 'react';
import EN from './data/en.js';

const KEY = 'pfna-lang';
const start = () => {
  const q = new URLSearchParams(window.location.search).get('lang');
  if (q === 'en' || q === 'th') return q;
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'th';
  } catch {
    return 'th';
  }
};

let lang = start();
const subs = new Set();
const applyDoc = () => {
  document.documentElement.lang = lang;
  document.title = translate('นวัตกรรมเสาฉากกั้น PFNA');
};

function translate(s) {
  if (lang === 'th') return s;
  if (import.meta.env.DEV && /[ก-๙]/.test(s) && !(s in EN)) console.warn('[i18n] ยังไม่มีคำแปล:', s);
  return EN[s] ?? s;
}

export function setLang(next) {
  lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* โหมดส่วนตัว: ไม่จำภาษา */
  }
  applyDoc();
  subs.forEach((f) => f());
}

// แปลทั้งก้อนข้อมูล (เก็บผลไว้ใช้ซ้ำ)
const cache = new WeakMap();
function deep(x) {
  if (typeof x === 'string') return translate(x);
  if (!x || typeof x !== 'object') return x;
  if (lang === 'th') return x;
  if (!cache.has(x)) {
    cache.set(x, Array.isArray(x) ? x.map(deep) : Object.fromEntries(Object.entries(x).map(([k, v]) => [k, deep(v)])));
  }
  return cache.get(x);
}

// t('ข้อความ') หรือ t(ออบเจ็กต์ข้อมูล)
export function useLang() {
  const current = useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => lang
  );
  return { lang: current, t: deep };
}

applyDoc();
