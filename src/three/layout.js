import * as THREE from 'three';

// ตำแหน่งหลักในห้องและจังหวะประกอบเสาฉาก (ใช้ร่วมกันทั้งฉาก) — หน่วย = เมตร
// ประตูอยู่ที่ z = 0, ทางเดินอยู่ z > 0, ห้องผ่าตัดอยู่ z < 0, อุปกรณ์อยู่รอบจุด (0, 0, -5.5)
export const CENTER_Z = -5.5;
// อุปกรณ์รอบเตียงถูกกลับด้านแกน x (-1) ให้ตรงกับภาพจริง
export const MIRROR = -1;

export const PFNA = {
  z: CENTER_Z - 0.45, // แนวฉาก (ฝั่ง C-Arm)
  headX: -1.2,
  tracX: 1.75,
  top: 2.2,
  headBase: 0.86,
  tracBase: 0.92,
};

// จอ dashboard บนผนังขวา
export const DASH_SCREEN = { x: 4.86, y: 1.75, z: CENTER_Z + 0.3 };

// มุมซ้ายในห้อง (กล้องหันมาตอนบทวัสดุ และเป็นจุดวางรถเข็น)
export const SHOWCASE = { origin: [-3.3, 1.38, -3.6] };

// ช่วงเวลา (progress) ที่ชิ้นส่วนแต่ละชิ้นเริ่มประกอบ — ตรงกับ INSTALL_STEPS
export const INSTALL_RANGE = { out: [0.455, 0.495], start: 0.5, end: 0.7 };
export const PART_START = { clamps: 0.52, pole1: 0.555, pole2: 0.58, bar: 0.61, lock: 0.645 };

export function assembly(p, start) {
  if (p < INSTALL_RANGE.out[0]) return 1;
  if (p < INSTALL_RANGE.start) return 1 - THREE.MathUtils.smoothstep(p, ...INSTALL_RANGE.out);
  return THREE.MathUtils.smoothstep(p, start, start + 0.03);
}
