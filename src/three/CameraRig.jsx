import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CENTER_Z, DASH_SCREEN, SHOWCASE } from './layout.js';

const v = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- บทต่าง ๆ ในห้อง 3D (ตามช่วง progress ของการ scroll) ---------- */
// t = ตำแหน่ง scroll (0–1), pos = ตำแหน่งกล้อง, look = จุดที่กล้องมอง
const [SX, SY, SZ] = SHOWCASE.origin;
const KEYS = [
  // ประตูและทางเดินแสดงด้วยวิดีโอ (WalkIn) แล้ว — ห้อง 3D เริ่มจากยืนอยู่ในห้องเลย
  { t: 0.0, pos: v(0.1, 1.4, CENTER_Z + 4.4), look: v(0.1, 1.25, CENTER_Z) }, // มองเตียงจากด้านข้างตรง ๆ เห็นโครงเสาทั้งชุด เหมือนฉากจบของวิดีโอ
  { t: 0.13, pos: v(0.1, 1.65, -1.2), look: v(-1.2, 1.45, -4.2) }, // เริ่มหันซ้าย
  { t: 0.19, pos: v(SX + 3.25, 1.55, SZ - 0.05), look: v(SX, SY - 0.05, SZ - 0.62), shiftZ: 0.55, up: 0.16 }, // มุมซ้าย: ตู้โชว์วัสดุ
  { t: 0.3, pos: v(SX + 3.25, 1.55, SZ - 0.05), look: v(SX, SY - 0.05, SZ - 0.62), shiftZ: 0.55, up: 0.16 },
  { t: 0.37, pos: v(-0.35, 1.8, -1.35), look: v(-0.62, 1.28, CENTER_Z), shift: -0.35 }, // ผลิตภัณฑ์
  { t: 0.45, pos: v(-0.35, 1.8, -1.35), look: v(-0.62, 1.28, CENTER_Z), shift: -0.35 },
  // วิธีติดตั้ง: มองตรงเห็นโครงทั้งชุด (เว้นขวาให้กล่องขั้นตอน)
  { t: 0.5, pos: v(0.6, 1.75, -0.9), look: v(0.95, 1.4, CENTER_Z), shift: 0.9, up: 0.2 },
  { t: 0.71, pos: v(0.6, 1.75, -0.9), look: v(0.95, 1.4, CENTER_Z), shift: 0.9, up: 0.2 },
  { t: 0.76, pos: v(1.0, 1.8, -4.0), look: v(DASH_SCREEN.x, DASH_SCREEN.y - 0.03, DASH_SCREEN.z) }, // หันขวา: ผลการใช้งาน
  { t: 1.0, pos: v(1.0, 1.8, -4.0), look: v(DASH_SCREEN.x, DASH_SCREEN.y - 0.03, DASH_SCREEN.z) },
];

export default function CameraRig({ progress }) {
  const smooth = useRef(0);
  const last = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mouse = useRef({ x: 0, y: 0 });

  useFrame((state, dt) => {
    // Lenis ทำให้ scroll นุ่มแล้ว — กล้องตามแบบหน่วงเล็กน้อยให้รู้สึกเหมือนเดินจริง
    // หยุดเรนเดอร์ไปช่วงหนึ่ง (บทวัสดุ/ติดตั้งบังเต็มจอ) แล้วกลับมา: เริ่มที่ตำแหน่งปัจจุบันเลย กล้องไม่วูบไล่ตาม
    const now = performance.now();
    if (now - last.current > 400) smooth.current = progress.current;
    last.current = now;
    smooth.current = THREE.MathUtils.damp(smooth.current, progress.current, 3.2, Math.min(dt, 0.05));
    const t = smooth.current;
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const u = THREE.MathUtils.smoothstep(t, a.t, b.t);
    pos.lerpVectors(a.pos, b.pos, u);
    look.lerpVectors(a.look, b.look, u);

    // จอแนวตั้ง: ถอยกล้องออกและเปิดมุมกว้างขึ้น ให้เห็นอุปกรณ์ครบ
    const tall = state.size.width / state.size.height < 0.9;
    const narrow = state.size.width / state.size.height < 0.6; // มือถือ
    const fov = narrow ? 80 : tall ? 66 : 50;
    if (state.camera.fov !== fov) {
      state.camera.fov = fov;
      state.camera.updateProjectionMatrix();
    }
    const mix = (k) => THREE.MathUtils.lerp(a[k] ?? 0, b[k] ?? 0, u);
    if (tall) {
      // กล่องข้อความอยู่ด้านล่าง (ไม่ใช่ด้านขวา) จึงจัดอุปกรณ์กลับมากลางจอ และเลื่อนภาพขึ้นพ้นกล่อง
      const sx = mix('shift');
      const sz = mix('shiftZ');
      pos.x -= sx;
      look.x -= sx;
      look.z += sz;
      pos.copy(tmp.subVectors(pos, look).multiplyScalar(narrow ? 1.17 : 1.25).add(look));
    }
    const { width, height } = state.size;
    const up = tall ? Math.round(mix('up') * height) : 0;
    if (up) state.camera.setViewOffset(width, height, 0, up, width, height);
    else if (state.camera.view?.enabled) state.camera.clearViewOffset();

    // Mouse parallax
    const strength = 0.1 + 0.3 * THREE.MathUtils.smoothstep(t, 0.12, 0.2);
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, state.pointer.x, 3, dt);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, state.pointer.y, 3, dt);
    pos.x += mouse.current.x * strength;
    pos.y += mouse.current.y * strength * 0.5;

    state.camera.position.copy(pos);
    state.camera.lookAt(look);
  });
  return null;
}
