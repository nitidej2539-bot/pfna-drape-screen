import { PRODUCT } from '../data/product.js';
import { UNIT } from '../data/team.js';
import { asset } from '../lib/asset.js';
import { useLang } from '../i18n.js';

export default function UnitSection({ onZoom }) {
  const { t } = useLang();
  const unit = t(UNIT);

  return (
    <section id="unit" className="unit-section">
      {/* ส่วนบน: ภาพตึก + โลโก้ + ป้ายไม้ + ชื่อหน่วยงาน + ภาพทีม */}
      <div className="unit-hero">
        <img className="unit-bg" src={asset(unit.building)} alt="" aria-hidden="true" />
        <div className="unit-copy">
          <img className="unit-logos" src={asset(unit.logos)} alt={t('โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย และฝ่ายการพยาบาล')} />
          <p className="ov-eyebrow">{t('หน่วยงาน')}</p>
          <div className="unit-sign">
            <img src={asset(unit.sign)} alt={t('ป้ายห้องผ่าตัดออร์โธปิดิกส์')} />
          </div>
          <h2>{t(PRODUCT.unit)}</h2>
          <p className="unit-meta">
            <span className="nowrap">{t('โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย')}</span>
            <span className="nowrap">{t('โทรภายใน')}{' '}{PRODUCT.unitPhone}</span>
          </p>
        </div>
        <img className="unit-team" src={asset(unit.team)} alt={t('ทีมห้องผ่าตัดออร์โธปิดิกส์')} />
      </div>

      {/* ส่วนล่าง: ภาพบรรยากาศการทำงาน */}
      <div className="unit-gallery">
        {unit.gallery.map((g) => (
          <figure key={g.src} className="unit-card">
            <button
              type="button"
              className={`unit-card-img fit-${g.fit}`}
              onClick={() => onZoom(g.src, g.title)}
              aria-label={`${t('ขยายภาพ')} ${g.title}`}
            >
              <img src={asset(g.src)} alt={g.title} loading="lazy" />
            </button>
            <figcaption>
              <strong>{g.title}</strong>
              <span>{g.text}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* แบนเนอร์ปิดท้าย (โปสเตอร์ประจำหน่วยงาน) — กดเพื่อดูภาพเต็ม */}
      <button
        type="button"
        className="unit-banner"
        onClick={() => onZoom(unit.banner, unit.bannerAlt)}
        aria-label={t('ดูโปสเตอร์หน่วยงานขนาดเต็ม')}
      >
        <img src={asset(unit.banner)} alt={unit.bannerAlt} loading="lazy" />
        <span className="unit-banner-hint">{t('ดูภาพเต็ม')}</span>
      </button>
    </section>
  );
}
