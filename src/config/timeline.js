// จังหวะของห้อง 3D ทั้งหมดอยู่ที่นี่ที่เดียว (progress 0–1 ตามการเลื่อน)
import { lerp } from '../lib/math.js';

export function chapterOf(p) {
  if (p < 0.08) return 'intro';
  if (p >= 0.19 && p < 0.31) return 'materials';
  if (p >= 0.36 && p < 0.46) return 'product';
  if (p >= 0.5 && p < 0.71) return 'install';
  if (p >= 0.76) return 'results';
  return 'transit';
}

// จุดเริ่มของขั้นตอนติดตั้งแต่ละขั้น (คลิปติดตั้งใช้ค่าชุดเดียวกัน)
export const STEP_AT = [0.5, 0.515, 0.545, 0.595, 0.625, 0.69];
export const stepOf = (p) => STEP_AT.reduce((acc, th, i) => (p >= th ? i : acc), 0);

// ช่วงที่เล่นช็อตเสา 3 ในบทวัสดุ
export const POLE3_RANGE = [0.195, 0.3];

// เริ่มโหลดภาพทีละเฟรมเมื่อเลื่อนเลยจุดนี้ (ไม่ถ่วงหน้าแรก)
export const PRELOAD_AT = { pole3: 0.02, install: 0.3 };

// ยืดระยะเลื่อนของบทติดตั้งให้ยาวขึ้น (คลิปจริงมีรายละเอียดมาก): [สัดส่วนการเลื่อน, progress]
const WARP = [[0, 0], [0.42, 0.5], [0.74, 0.71], [1, 1]];
const piecewise = (x, from, to) => {
  let i = 0;
  while (i < WARP.length - 2 && x > WARP[i + 1][from]) i++;
  const a = WARP[i];
  const b = WARP[i + 1];
  return lerp(a[to], b[to], (x - a[from]) / (b[from] - a[from]));
};
export const toProgress = (scroll) => piecewise(scroll, 0, 1);
export const toScroll = (progress) => piecewise(progress, 1, 0);

// ตำแหน่งที่เมนูพาไป (progress ในห้อง 3D) — เมนูที่ไม่อยู่ในนี้คือ id ของส่วนในหน้า
export const NAV_PROGRESS = { materials: 0.2, product: 0.41, install: 0.505, results: 0.9 };

export const NAV = [
  { key: 'home', label: 'หน้าแรก' },
  { key: 'materials', label: 'วัสดุ' },
  { key: 'product', label: 'ผลิตภัณฑ์' },
  { key: 'install', label: 'วิธีติดตั้ง' },
  { key: 'results', label: 'ผลการใช้งาน' },
  { key: 'highlights', label: 'จุดเด่น' },
  { key: 'team', label: 'ทีมผู้พัฒนา' },
  { key: 'unit', label: 'หน่วยงาน' },
  { key: 'contact', label: 'ติดต่อ' },
];

// ส่วนของหน้าด้านล่าง → เมนูที่ต้องไฮไลต์
export const PAGE_SECTIONS = { versions: 'results', highlights: 'highlights', team: 'team', unit: 'unit', contact: 'contact' };
