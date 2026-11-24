import { VERSIONS } from '../data/product.js';
import { asset } from '../lib/asset.js';
import { useLang } from '../i18n.js';

export default function VersionsSection({ onZoom }) {
  const { t } = useLang();

  return (
    <section id="versions" className="page-section">
      <p className="ov-eyebrow">{t('ผลการใช้งานจริง')}</p>
      <h2 className="section-title">{t('จากต้นแบบ สู่แบบสมบูรณ์')}</h2>
      <div className="ver-grid">
        {t(VERSIONS).map((ver) => (
          <article key={ver.key} className={`ver-card tone-${ver.tone}`}>
            <button
              type="button"
              className="ver-photo"
              onClick={() => onZoom(ver.slide, `${t('อุปกรณ์เสาฉากกั้น PFNA')} (${ver.label})`)}
              aria-label={`${t('ดูสไลด์')} ${ver.label}`}
            >
              <img src={asset(ver.photo)} alt={`${t('อุปกรณ์เสาฉากกั้น')} ${ver.label}`} loading="lazy" />
              <span className="ver-zoom">{t('ดูสไลด์ฉบับเต็ม')}</span>
            </button>
            <div className="ver-body">
              <span className="ver-tag">{ver.label}</span>
              <h3>{ver.concept}</h3>
              <div className="ver-metrics">
                <div>
                  <span className="ver-num">{ver.slip}%</span>
                  <span className="ver-cap">{t('เลื่อนไหลไป Sterile Field')}</span>
                </div>
                <div>
                  <span className="ver-num">{ver.area}%</span>
                  <span className="ver-cap">{t('พื้นที่ทำหัตถการเพียงพอ')}</span>
                </div>
              </div>
              <h4>{t('วัสดุ / โครงสร้าง')}</h4>
              <ul>
                {ver.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <h4>{t('ผลที่พบ')}</h4>
              <ul>
                {ver.findings.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
