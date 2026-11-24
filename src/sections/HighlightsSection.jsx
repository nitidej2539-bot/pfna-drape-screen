import { HIGHLIGHTS } from '../data/product.js';
import { useLang } from '../i18n.js';

export default function HighlightsSection() {
  const { t } = useLang();

  return (
    <section id="highlights" className="page-section">
      <p className="ov-eyebrow">{t('จุดเด่น')}</p>
      <h2 className="section-title">{t('ประโยชน์ของนวัตกรรมเสาฉากกั้น')}</h2>
      <div className="hl-grid">
        {t(HIGHLIGHTS).map((h) => (
          <article key={h.key} className="hl-card">
            <span className="hl-key">{h.key}</span>
            <h3>{h.title}</h3>
            <p>{h.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
