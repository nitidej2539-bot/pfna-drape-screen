import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { useFrameSequence } from '../hooks/useFrameSequence.js';
import { asset } from '../lib/asset.js';
import { clamp01, lerp, smoothstep01 } from '../lib/math.js';
import { drawWalkFrame } from '../lib/drawWalkFrame.js';
import { PRODUCT } from '../data/product.js';
import { useLang } from '../i18n.js';

// วิดีโอเดินเข้าห้องผ่าตัด (แตกเป็นภาพทีละเฟรมใน public/walkin/) — เลื่อนหน้าแล้วภาพเดินหน้า/ถอยหลังตาม
// สองในสามแรก = เดินเข้าห้อง, ที่เหลือ = กล้องโคจรรอบเสาฉาก (ต่อจากเฟรมสุดท้ายพอดี)
const FRAMES_END = 0.92; // ช่วง progress ที่ใช้เล่นเฟรม ที่เหลือค่อย ๆ จางเข้าห้อง 3D
// จอใหญ่ใช้ชุดคมชัด 1920px ครบทุกเฟรมต้นฉบับ (walkin-hd), มือถือใช้ชุดเล็ก (walkin) — ตรงกับ preload ใน index.html
const { dir: DIR, count: FRAME_COUNT } =
  window.innerWidth >= 600 ? { dir: 'walkin-hd', count: 365 } : { dir: 'walkin', count: 228 };

// 3 ป้ายเปิด ขนาดเท่ากัน: ซ้าย (หน่วยงานขอนำเสนอ) → ขวา (ผลิตภัณฑ์) → ซ้าย (ยุทธศาสตร์ 3S)
// from–to = สัดส่วนการเลื่อนของฉากนี้ 0–1, เปิดเว็บเห็นประตูก่อน เริ่มเลื่อนแล้วป้ายแรกค่อยเข้า
const CAPTIONS = [
  { key: 'open', side: 'left', from: 0.012, to: 0.18, Card: OpenCard },
  { key: 'product', side: 'right', from: 0.185, to: 0.365, Card: ProductCard },
  { key: 's3', side: 'left', from: 0.37, to: 0.55, Card: StrategyCard },
];

// ยืดเฉพาะทางเดิน: ช่วงก่อนเข้าห้อง (DOOR = สัดส่วนเฟรมที่พ้นประตู) ใช้ระยะเลื่อนมากกว่า แล้วค่อยเร่งกลับเป็นจังหวะเดิมในห้องแบบไม่สะดุด
const DOOR = 0.29;
const CORRIDOR = 0.53; // สัดส่วนการเลื่อนที่ใช้กับทางเดิน
const TABLE = (() => {
  const N = 400;
  const v1 = DOOR / CORRIDOR;
  const v2 = (1 - DOOR) / (FRAMES_END - CORRIDOR);
  const out = [0];
  for (let k = 1; k <= N; k++) {
    const p = ((k - 0.5) / N) * FRAMES_END;
    const u = clamp01((p - CORRIDOR + 0.05) / 0.1);
    out.push(out[k - 1] + lerp(v1, v2, smoothstep01(u)));
  }
  return out.map((x) => x / out[N]);
})();
const frameOf = (p) => {
  const x = clamp01(p / FRAMES_END) * (TABLE.length - 1);
  const k = Math.min(TABLE.length - 2, Math.floor(x));
  return Math.round(lerp(TABLE[k], TABLE[k + 1], x - k) * (FRAME_COUNT - 1));
};

function phaseOf(p) {
  if (p < 0.05) return 'hero';
  if (p >= FRAMES_END) return 'leave';
  return 'walk';
}

// ป้าย: เลื่อนเข้าจากขอบจอ → ค้างให้อ่าน → เลื่อนออกทางเดิม
function moveCard(el, { side, from, to }, p) {
  const u = (p - from) / (to - from);
  const enter = 1 - (1 - clamp01(u / 0.28)) ** 3; // เข้าเร็วแล้วนุ่มลง
  const leave = clamp01((u - 0.8) / 0.2);
  const shift = 1 - enter + leave * leave;
  el.style.transform = `translate3d(${(side === 'left' ? -1 : 1) * shift * 115}%, 0, 0)`;
  el.style.opacity = u <= 0 || u >= 1 ? 0 : Math.min(enter, 1 - leave);
}

export default function WalkIn({ onSection }) {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const fadeRef = useRef(null);
  const cardRefs = useRef([]);
  const target = useRef(0); // เฟรมที่ควรแสดงตามตำแหน่งเลื่อน
  const drawn = useRef(-1); // เฟรมที่วาดอยู่จริง (อาจช้ากว่าถ้ายังโหลดไม่เสร็จ)
  const headerHeight = useRef(0);
  const [phase, setPhase] = useState('hero');
  const [loaded, setLoaded] = useState(0);

  const frameAt = useFrameSequence(DIR, FRAME_COUNT, {
    onFrame: (i, settled) => {
      if (settled % 8 === 0 || settled === FRAME_COUNT) setLoaded(settled);
      // เฟรมที่ใกล้เป้าหมายกว่าเดิมเพิ่งโหลดเสร็จ → วาดทันที ไม่ต้องรอเลื่อนอีกครั้ง
      if (i <= target.current && i > drawn.current) draw();
    },
  });

  // วาดเฟรมเป้าหมาย ถ้ายังโหลดไม่เสร็จใช้เฟรมใกล้สุดที่โหลดแล้ว
  const draw = useCallback(() => {
    const frame = frameAt(target.current);
    if (!frame || !canvasRef.current) return;
    drawWalkFrame(canvasRef.current, frame.img, headerHeight.current);
    drawn.current = frame.index;
  }, [frameAt]);

  // ปรับขนาด canvas ตามจอ (คำนึงถึงจอความละเอียดสูง แต่ไม่เกิน 2 เท่า)
  useEffect(() => {
    const canvas = canvasRef.current;
    const header = document.querySelector('.ov-nav');
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      headerHeight.current = header?.offsetHeight ?? 0;
      draw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (header) observer.observe(header);
    return () => observer.disconnect();
  }, [draw]);

  // ผูกเฟรมกับการ scroll
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        target.current = frameOf(p);
        if (target.current !== drawn.current) draw();
        gsap.set(fadeRef.current, { opacity: clamp01((p - FRAMES_END) / (1 - FRAMES_END)) });
        CAPTIONS.forEach((c, k) => cardRefs.current[k] && moveCard(cardRefs.current[k], c, p));
        setPhase(phaseOf(p));
      },
      onToggle: (self) => self.isActive && onSection?.('home'),
    });
    return () => st.kill();
  }, [draw, onSection]);

  return (
    <section ref={sectionRef} className="walkin" aria-label={t('เดินเข้าห้องผ่าตัด')}>
      <div className="walkin-sticky">
        <canvas ref={canvasRef} className="walkin-canvas" aria-hidden="true" />
        <div ref={fadeRef} className="walkin-fade" aria-hidden="true" />

        <div className={`ov ov-scroll ${phase === 'hero' ? 'is-on' : ''}`}>
          <span className="ov-wheel" />
          {t('เลื่อนเพื่อเข้าห้องผ่าตัด')}
        </div>

        {CAPTIONS.map(({ key, side, Card }, k) => (
          <div
            key={key}
            ref={(el) => {
              cardRefs.current[k] = el;
            }}
            className={`opencard is-${key} ${side === 'right' ? 'is-right' : ''}`}
          >
            <Card />
          </div>
        ))}

        {/* ช่วงเปลี่ยนเข้าห้อง 3D */}
        <div className={`ov walkin-next ${phase === 'leave' ? 'is-on' : ''}`}>
          <p className="ov-eyebrow">{t('ถัดไป')}</p>
          <strong>{t('เข้าสู่ห้องผ่าตัดจำลอง 3D')}</strong>
          <span>{t('สำรวจวัสดุ · ผลิตภัณฑ์ · วิธีติดตั้ง · ผลการใช้งาน')}</span>
          <span className="walkin-next-arrow" aria-hidden="true">↓</span>
        </div>

        {/* ป้ายระบุภาพจำลอง (โปร่งใสต่อผู้ชม) */}
        <div className="walkin-badge">
          {t('วิดีโอจำลองจากภาพถ่ายจริงของหน่วยงาน')}
          {loaded < FRAME_COUNT && <span> · {t('กำลังโหลด')} {Math.round((loaded / FRAME_COUNT) * 100)}%</span>}
        </div>
      </div>
    </section>
  );
}

/* ---------- เนื้อหาป้ายเปิด ---------- */
function OpenCard() {
  const { t } = useLang();
  return (
    <>
      <div className="opencard-logos">
        <img src={asset('images/pi2/logo-hospital.webp')} alt={t('โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย')} />
        <img src={asset('images/pi2/logo-nursing.webp')} alt={t('ฝ่ายการพยาบาล')} />
        <img src={asset('images/pi2/logo-ortho.webp')} alt="Department of Orthopaedics, Chulalongkorn University" />
      </div>
      <h2>{t('ภูมิสิริฯ 6A\nหอผ่าตัดศัลยกรรมกระดูก')}</h2>
      <p className="opencard-present">{t('ขอนำเสนอ')}</p>
    </>
  );
}

function ProductCard() {
  const { lang, t } = useLang();
  const product = t(PRODUCT);
  return (
    <>
      <p className="ov-eyebrow">Orthopedic OR · CQI Innovation</p>
      <h1>
        <small>{product.namePrefix}</small>
        {product.nameMain}
      </h1>
      {lang === 'th' && <p className="opencard-en">{product.nameEn}</p>}
      <p className="opencard-text">{product.tagline}</p>
    </>
  );
}

const STRATEGY = [
  ['Safety', 'ปลอดภัย'],
  ['Standard', 'ได้มาตรฐาน'],
  ['Satisfaction', 'ประทับใจ'],
];

function StrategyCard() {
  const { lang, t } = useLang();
  return (
    <>
      <h2>
        <small>{t('สอดคล้องกับ')}</small>
        {t('ยุทธศาสตร์องค์กร')}
      </h2>
      <div className="opencard-3s">
        <img
          src={asset('images/pi2/3s-clear.webp')}
          alt={t('ยุทธศาสตร์ 3S: Safety ปลอดภัย Standard ได้มาตรฐาน Satisfaction ประทับใจ')}
        />
        <ul>
          {STRATEGY.map(([en, th]) => (
            <li key={en}>
              {lang === 'th' && <b>{th}</b>}
              <span>{en}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
