import { INSTALL_STEPS } from '../data/product.js';
import { STEP_AT } from '../config/timeline.js';
import { useFramePlayer } from '../hooks/useFramePlayer.js';
import { asset } from '../lib/asset.js';
import { useLang } from '../i18n.js';

// คลิปติดตั้งจริง (WEB PI2/คลิปการประกอบ.mp4 ช่วง 10.3–31.0 วินาที) แตกเป็นภาพทีละเฟรม 10 ภาพต่อวินาที
// เลื่อนหน้าแล้วคลิปเดินหน้า/ถอยหลังตาม — การ์ดขั้นตอนวางทับตัวอักษรเดิมที่ติดมาในคลิป
const COUNT = 207;
const at = (sec) => Math.round((sec - 10.3) * 10);
// [progress เริ่ม, progress จบ, เฟรมเริ่ม, เฟรมจบ] ของขั้น 2–5
const SEGMENTS = [
  [STEP_AT[1], STEP_AT[2], 0, at(14.8)],
  [STEP_AT[2], STEP_AT[3], at(14.8), at(21.1)],
  [STEP_AT[3], STEP_AT[4], at(21.1), at(24)],
  [STEP_AT[4], STEP_AT[5], at(24), COUNT - 1],
];
const FIRST = 0;
const LAST = STEP_AT.length - 1;

function frameOf(p) {
  if (p <= SEGMENTS[0][0]) return 0;
  for (const [p0, p1, f0, f1] of SEGMENTS) if (p <= p1) return Math.round(f0 + ((p - p0) / (p1 - p0)) * (f1 - f0));
  return COUNT - 1;
}

export default function InstallVideo({ progress, visible, step, preload }) {
  const { t } = useLang();
  const canvasRef = useFramePlayer({ dir: 'install', count: COUNT, preload, visible, progress, goalOf: frameOf, smoothing: 0.22 });
  const still = step === FIRST || step === LAST; // ขั้นแรกและขั้นสุดท้ายใช้ภาพนิ่งแทนคลิป

  return (
    <div className={`insvid ${visible ? 'is-on' : ''}`} aria-hidden={!visible}>
      <div className="insvid-area">
        <div className="insvid-box">
          <canvas ref={canvasRef} width={1280} height={720} />
          <img className={step === FIRST ? 'is-on' : ''} src={asset('install/prep.webp')} alt={t('อุปกรณ์และรถเข็นเก็บเสาฉาก')} loading="lazy" />
          <img className={step === LAST ? 'is-on' : ''} src={asset('images/pi2/v2-photo.jpg')} alt={t('เสาฉากติดตั้งเสร็จ พร้อมใช้งาน')} loading="lazy" />
          <div className={`insvid-card ${still ? 'is-small' : ''}`}>
            <span>{step + 1}</span>
            <strong>{t(INSTALL_STEPS)[step].title}</strong>
          </div>
        </div>
      </div>
      <p className="assembly-note">{t('คลิปการติดตั้งจริงของหน่วยงาน')}</p>
    </div>
  );
}
