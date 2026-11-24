import CountUp from '../components/CountUp.jsx';
import { RESULTS, VERSIONS } from '../data/product.js';
import { useLang } from '../i18n.js';

export default function ResultsPanel({ visible, onShowVersions }) {
  const { lang, t } = useLang();
  const results = t(RESULTS);
  const versions = t(VERSIONS);

  return (
    <section data-lenis-prevent className={`ov ov-results ${visible ? 'is-on' : ''}`} aria-label={t('ผลการใช้งาน')}>
      <p className="ov-eyebrow">{t('ผลการใช้งานจริง')}</p>
      <h2>{t('เปรียบเทียบผลลัพธ์ 3 รุ่น · ผู้ป่วยผ่าตัด PFNA')}{' '}{results.cases} {lang === 'th' && 'ราย'}</h2>
      <div className="dash-grid">
        {results.metrics.map((m) => (
          <div key={m.key} className="dash-card dash-kpi">
            <span className="dash-label">{m.label}</span>
            <div className="ver-bars">
              {versions.map((ver) => {
                const val = ver[m.key];
                const pass = m.better === 'higher' ? val >= m.target : val <= m.target;
                return (
                  <div key={ver.key} className={`ver-row tone-${ver.tone}`}>
                    <span className="ver-name">{ver.label}</span>
                    <div className="dash-bar" aria-hidden="true">
                      <span className="dash-fill" style={{ width: visible ? `${Math.max(val, 0.6)}%` : 0 }} />
                      <span className="dash-target" style={{ left: `${m.target}%` }} />
                    </div>
                    <span className={`ver-val ${pass ? 'is-pass' : ''}`}>
                      <CountUp value={val} decimals={val % 1 ? 2 : 0} active={visible} suffix="%" />
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="dash-badge is-pass">{t('✓ แบบที่ 2 บรรลุ ·')}{' '}{m.targetLabel}</span>
          </div>
        ))}
        <div className="dash-card dash-mini">
          <span className="dash-label">{t('ผู้ป่วยที่ใช้งาน')}</span>
          <span className="dash-value">
            <CountUp value={results.cases} active={visible} />
            <small> {t('ราย')}</small>
          </span>
        </div>
        <div className="dash-card dash-mini">
          <span className="dash-label">{t('ต้นทุนการผลิต')}</span>
          <span className="dash-value">
            <CountUp value={results.budget} active={visible} />
            <small> {t('บาท')}</small>
          </span>
        </div>
        <div className="dash-card dash-wide">
          <span className="dash-label">{t('ผลลัพธ์อื่น ๆ')}</span>
          <ul>
            {results.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <button type="button" className="glass-btn small" onClick={onShowVersions}>
            {t('ดูรายละเอียดแต่ละรุ่น ↓')}
          </button>
        </div>
      </div>
    </section>
  );
}
