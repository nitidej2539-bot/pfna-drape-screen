import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

// โหมดสาธิต (?demo) สั่งให้ VS Code เปิดไฟล์/บรรทัดที่ตรงกับฉาก — ทำงานเฉพาะ dev server และเฉพาะรายการนี้
// [ไฟล์, ข้อความในบรรทัดที่จะเปิด] — tests/demoCode.test.js ตรวจว่าข้อความยังอยู่จริง
export const CODE = {
  frames: ['src/components/WalkIn.jsx', 'onUpdate: (self)'],
  cards: ['src/components/WalkIn.jsx', 'const CAPTIONS'],
  glass: ['src/styles/opencards.css', '.opencard {'],
  i18n: ['src/i18n.js', 'export function setLang'],
  scene: ['src/three/Architecture.jsx', 'function Architecture'],
  carm: ['src/three/Equipment.jsx', 'export function CArm'],
  pole3: ['src/hooks/useFramePlayer.js', 'const tick'],
  hotspot: ['src/three/FeatureHotspots.jsx', 'function FeatureHotspots'],
  panel: ['src/components/DetailPanel.jsx', 'gsap.fromTo'],
  camera: ['src/three/CameraRig.jsx', 'function CameraRig'],
  install: ['src/components/InstallVideo.jsx', 'const SEGMENTS'],
  count: ['src/components/CountUp.jsx', 'function CountUp'],
  versions: ['src/data/product.js', 'export const VERSIONS'],
  lightbox: ['src/components/Lightbox.jsx', 'export default function'],
  people: ['src/components/PeopleReveal.jsx', 'export default function'],
  team: ['src/data/team.js', 'export const MEMBERS'],
  contact: ['src/data/team.js', 'export const CONTACT'],
};

// เลขบรรทัด (เริ่มที่ 1) หรือ 0 ถ้าไม่พบ
export function lineOf(file, text) {
  return readFileSync(file, 'utf8').split('\n').findIndex((l) => l.includes(text)) + 1;
}

export function demoCode(root) {
  return {
    name: 'demo-code',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__code', (req, res) => {
        const item = CODE[new URL(req.url, 'http://x').searchParams.get('k')];
        const from = req.headers['sec-fetch-site'];
        if (!item || (from && from !== 'same-origin')) {
          res.statusCode = 404;
          res.end();
          return;
        }
        const file = resolve(root, item[0]);
        const line = lineOf(file, item[1]);
        const exe = resolve(process.env.LOCALAPPDATA ?? '', 'Programs/Microsoft VS Code/Code.exe');
        const child = spawn(exe, [root, '-g', `${file}:${line}`], { detached: true, stdio: 'ignore' });
        child.on('error', () => {}); // ไม่มี VS Code: เล่นเว็บอย่างเดียว
        child.unref();
        res.end(JSON.stringify({ file: item[0], line }));
      });
    },
  };
}
