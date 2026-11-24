import { INSTALL_NOTES, INSTALL_STEPS } from '../data/product.js';
import { useLang } from '../i18n.js';

export default function InstallPanel({ visible, step, onOpenManual }) {
  const { t } = useLang();
  const steps = t(INSTALL_STEPS);

  return (
    <aside data-lenis-prevent className={`ov ov-install ${visible ? 'is-on' : ''}`}>
      <div className="install-head">
        <p className="ov-eyebrow">{t('วิธีติดตั้ง')} · {steps.length} {t('ขั้นตอน')}</p>
        <button type="button" className="glass-btn small" onClick={onOpenManual}>
          {t('ดูคู่มือฉบับเต็ม')}
        </button>
      </div>
      <ol>
        {steps.map((s, i) => (
          <li key={s.title} className={i === step ? 'is-current' : i < step ? 'is-done' : ''}>
            <span className="step-n">{i + 1}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="install-notes">
        <strong>{t('หมายเหตุ')}</strong>
        <ul>
          {t(INSTALL_NOTES).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
