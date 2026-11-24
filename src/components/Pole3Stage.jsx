import { useCallback, useState } from 'react';
import { POLE3_RANGE } from '../config/timeline.js';
import { useFramePlayer } from '../hooks/useFramePlayer.js';
import { clamp01 } from '../lib/math.js';
import { useLang } from '../i18n.js';

// ช็อตเสา 3 ประกอบตัวแล้วสอดห่วงหัวเสา 1 และ 2 (เรนเดอร์ด้วย Blender: blender/pole3.py)
// แตกเป็นภาพทีละเฟรมใน public/pole3 — เลื่อนหน้าแล้วภาพเดินหน้า/ถอยหลังตาม
const COUNT = 192;

// หัวข้อย่อยตามจังหวะในช็อต (เฟรม)
const CAPTIONS = [
  [0, 'เสา 1 และ 2 พร้อมในรถเข็น'],
  [84, 'เสา 3 · ท่อนอก · เฟืองล็อกกันหมุน · ท่อเลื่อน'],
  [126, 'สวมท่อเลื่อน ยืดหดได้'],
  [150, 'สอดห่วงหัวเสา 1 และ 2'],
];
const captionOf = (frame) => CAPTIONS.reduce((acc, [from], k) => (frame >= from ? k : acc), 0);

const [START, END] = POLE3_RANGE;
const frameOf = (p) => clamp01((p - START) / (END - START)) * (COUNT - 1);

export default function Pole3Stage({ progress, visible, preload }) {
  const { t } = useLang();
  const [caption, setCaption] = useState(0);
  const onTick = useCallback((frame) => setCaption(captionOf(frame)), []);
  const canvasRef = useFramePlayer({ dir: 'pole3', count: COUNT, preload, visible, progress, goalOf: frameOf, smoothing: 0.18, onTick });

  return (
    <div className={`insvid ${visible ? 'is-on' : ''}`} aria-hidden={!visible}>
      <div className="insvid-area">
        <div className="insvid-box">
          <canvas ref={canvasRef} width={1280} height={720} role="img" aria-label={t('เสา 3 ประกอบตัวแล้วสอดห่วงหัวเสา 1 และ 2')} />
          <div className="pole3-cap">{t(CAPTIONS[caption][1])}</div>
        </div>
      </div>
      <p className="assembly-note">{t('ภาพจำลองจากคอมพิวเตอร์ อ้างอิงชิ้นส่วนจริง')}</p>
    </div>
  );
}
