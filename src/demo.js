// โหมดสาธิตสำหรับอัดวิดีโอ: เปิด http://localhost:5173/?demo แล้วกด Enter (หรือปุ่มเริ่ม)
// เว็บเลื่อนและกดเล่นเองทุกลูกเล่น พร้อมสั่ง VS Code ไปยังโค้ดของฉากนั้น — กด Esc เพื่อหยุด
import { setLang } from './i18n.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let stop = false;
const wait = (s) =>
  new Promise((ok, no) => {
    const end = performance.now() + s * 1000;
    const f = () => (stop ? no(new Error('stop')) : performance.now() >= end ? ok() : setTimeout(f, 50));
    f();
  });

// ตำแหน่งเลื่อน
const walk = (p) => p * ($('.walkin').offsetHeight - innerHeight);
const exp = (p) => $('.experience').offsetTop + p * ($('.experience').offsetHeight - innerHeight);
const sec = (id) => $(id).getBoundingClientRect().top + scrollY - 70;
async function go(top, s) {
  window.__lenis.scrollTo(top, { duration: s, easing: (x) => x * x * (3 - 2 * x), force: true });
  await wait(s + 0.2);
}

let cursor;
async function point(el, click = true) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  cursor.style.opacity = 1;
  cursor.style.transform = `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px)`;
  await wait(0.9);
  if (click) {
    cursor.classList.add('is-click');
    el.click();
    await wait(0.3);
    cursor.classList.remove('is-click');
  }
}

let bar;
async function code(k, text) {
  let info = null;
  try {
    info = await (await fetch(`/__code?k=${k}`)).json();
  } catch {
    /* ไม่มี dev server: เล่นเว็บอย่างเดียว */
  }
  bar.innerHTML = '';
  const b = document.createElement('b');
  b.textContent = info ? `${info.file} : ${info.line}` : k;
  const s = document.createElement('span');
  s.textContent = text;
  bar.append(b, s);
  await wait(1.2);
}

async function run() {
  setLang('th');
  window.__lenis.scrollTo(0, { immediate: true, force: true });
  await wait(1.5);
  await code('frames', 'วาดวิดีโอทีละเฟรมตามการเลื่อนเมาส์');
  await go(walk(0.09), 4);
  await code('cards', '3 ป้ายเปิด กำหนดจังหวะเข้า–ออก ซ้าย ขวา ซ้าย');
  await wait(2);
  await go(walk(0.28), 5);
  await code('glass', 'ป้ายกระจกฝ้าโปร่งแสง');
  await wait(2);
  await go(walk(0.46), 5);
  await wait(2);
  await code('i18n', 'สลับสองภาษา ไทย / อังกฤษ ทันที');
  await point($$('.ov-lang button')[1]);
  await wait(2.5);
  await go(walk(0.28), 3);
  await wait(1.5);
  await point($$('.ov-lang button')[0]);
  await wait(1);
  await code('frames', 'เลื่อนต่อเข้าห้องผ่าตัด');
  await go(walk(0.9), 8);
  await code('scene', 'ห้องผ่าตัด 3 มิติ สร้างด้วย Three.js');
  await go(exp(0.02), 4);
  await wait(2);
  await code('carm', 'เครื่อง C-Arm และเตียง สร้างจากโค้ด');
  await wait(3);
  await code('pole3', 'เสา 3 ประกอบตัวตามการเลื่อน');
  await go(exp(0.17), 4);
  await go(exp(0.25), 8);
  await code('hotspot', 'จุดข้อมูลบนตัวผลิตภัณฑ์');
  await go(exp(0.345), 5);
  await wait(1.5);
  await code('panel', 'กดเปิดรายละเอียดแต่ละส่วน');
  for (const el of $$('.h3d-card')) {
    await point(el);
    await wait(2.6);
    await point($('.detail-close'));
    await wait(0.6);
  }
  cursor.style.opacity = 0;
  await code('camera', 'กล้องเดินตามเส้นทางที่กำหนด');
  await go(exp(0.43), 4);
  await code('install', 'คลิปติดตั้งจริง แบ่ง 6 ขั้นตอน');
  await go(exp(0.72), 22);
  await code('count', 'ตัวเลขและกราฟผลลัพธ์วิ่งขึ้น');
  await go(exp(0.9), 5);
  await wait(3);
  await code('versions', 'พัฒนาการ 3 รุ่น');
  await go(sec('#versions'), 4);
  await wait(2.5);
  await code('lightbox', 'กดดูสไลด์ฉบับเต็ม');
  await point($('.ver-photo'));
  await wait(2.5);
  await point($('.lightbox-close'));
  cursor.style.opacity = 0;
  await go(sec('#highlights'), 4);
  await wait(2);
  await code('people', 'เลือกชื่อแล้วภาพทีมเลื่อนขึ้น');
  await go(sec('#team'), 4);
  const rows = $$('.people-row');
  for (const el of rows[0].children) {
    await point(el);
    await wait(1.3);
  }
  await code('team', 'ข้อมูลทีมแยกไว้ในไฟล์เดียว');
  await go(rows[1].getBoundingClientRect().bottom + scrollY - innerHeight + 40, 3);
  for (const el of rows[1].children) {
    await point(el);
    await wait(1.3);
  }
  cursor.style.opacity = 0;
  await code('contact', 'หน่วยงานและช่องทางติดต่อ');
  await go(sec('#unit'), 4);
  await wait(2);
  await go(sec('#contact'), 5);
  await wait(3);
}

export default function mountDemo() {
  const style = document.createElement('style');
  style.textContent = `
    .demo-start,.demo-bar{position:fixed;left:50%;translate:-50% 0;z-index:90;font-family:inherit}
    .demo-start{top:50%;translate:-50% -50%;padding:22px 34px;border:0;border-radius:18px;background:#0f5f4d;color:#fff;font-size:20px;cursor:pointer;box-shadow:0 12px 40px #0006}
    .demo-start small{display:block;margin-top:6px;font-size:14px;opacity:.85}
    .demo-bar{bottom:14px;display:none;flex-wrap:wrap;justify-content:center;gap:2px 14px;max-width:94vw;padding:9px 18px;border-radius:12px;background:#17232bee;color:#fff;font-size:15px;pointer-events:none}
    .demo-bar b{font-family:Consolas,monospace;font-weight:500;color:#7fe3c4}
    .demo-cursor{position:fixed;left:-13px;top:-13px;z-index:95;width:26px;height:26px;border-radius:50%;border:3px solid #fff;background:#1d9a7caa;box-shadow:0 2px 10px #0007;opacity:0;pointer-events:none;transition:transform .8s cubic-bezier(.4,0,.2,1),opacity .3s}
    .demo-cursor.is-click{background:#ffd34d;scale:.7}`;
  bar = Object.assign(document.createElement('div'), { className: 'demo-bar' });
  cursor = Object.assign(document.createElement('div'), { className: 'demo-cursor' });
  const btn = Object.assign(document.createElement('button'), { className: 'demo-start' });
  btn.innerHTML = '▶ เริ่มสาธิต<small>กด Enter เพื่อเริ่ม · Esc เพื่อหยุด</small>';
  document.body.append(style, bar, cursor, btn);
  let running = false;
  const start = async () => {
    if (running) return;
    running = true;
    stop = false;
    btn.style.display = 'none';
    bar.style.display = 'flex';
    const t0 = performance.now();
    try {
      await run();
      window.__demoSeconds = Math.round((performance.now() - t0) / 1000);
    } catch (e) {
      if (e.message !== 'stop') console.error(e);
      window.__lenis.scrollTo(scrollY, { immediate: true, force: true });
    }
    running = false;
    cursor.style.opacity = 0;
    bar.style.display = 'none';
    btn.style.display = '';
  };
  btn.addEventListener('click', start);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !running) start();
    if (e.key === 'Escape') stop = true;
  });
}
