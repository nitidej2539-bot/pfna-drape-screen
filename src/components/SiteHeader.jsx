import { useState } from 'react';
import { NAV } from '../config/timeline.js';
import { setLang, useLang } from '../i18n.js';

const LANGS = [
  { key: 'th', label: 'ไทย' },
  { key: 'en', label: 'EN' },
];

export default function SiteHeader({ section, onNavigate }) {
  const { lang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const go = (key) => {
    setMenuOpen(false);
    onNavigate(key);
  };

  return (
    <header className="ov-nav">
      <button type="button" className="ov-brand" onClick={() => go('home')}>
        <span className="ov-logo" aria-hidden="true">✚</span>
        <span>
          Orthopedic OR
          <br />
          CQI Innovation
        </span>
      </button>
      <nav id="site-nav" className={menuOpen ? 'is-open' : ''}>
        {NAV.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={section === key ? 'is-active' : ''}
            aria-current={section === key ? 'true' : undefined}
            onClick={() => go(key)}
          >
            {t(label)}
          </button>
        ))}
      </nav>
      <div className="ov-lang" role="group" aria-label="Language / ภาษา">
        {LANGS.map(({ key, label }) => (
          <button key={key} type="button" className={lang === key ? 'is-active' : ''} aria-pressed={lang === key} onClick={() => setLang(key)}>
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="ov-menu"
        aria-label={t('เมนู')}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        ☰
      </button>
    </header>
  );
}
