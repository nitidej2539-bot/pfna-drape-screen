import { useState } from 'react';
import { asset } from '../lib/asset.js';
import { useLang } from '../i18n.js';

// ปุ่มรายชื่อด้านล่าง — ชี้เมาส์ (หรือแตะบนมือถือ) แล้วภาพยืนของคนนั้นเลื่อนขึ้นมา พร้อมชื่อด้านขวา
function Silhouette() {
  const { t } = useLang();
  return (
    <svg viewBox="0 0 100 220" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <circle cx="50" cy="34" r="22" />
      <rect x="18" y="62" width="64" height="158" rx="26" />
      <text x="50" y="150" textAnchor="middle">{t('ภาพยืน')}</text>
    </svg>
  );
}

export default function PeopleReveal({ people, group }) {
  const [idx, setIdx] = useState(0);

  return (
    <div className="people">
      <div className="people-stage">
        {people.map((p, i) => (
          <div key={p.name} className={`people-slide ${i === idx ? 'is-on' : ''}`} aria-hidden={i !== idx}>
            <div className="people-fig">
              {p.photo ? <img src={asset(p.photo)} alt={p.name} /> : <Silhouette />}
            </div>
            <div className="people-info">
              <span className="people-group">{group}</span>
              <h3>{p.name}</h3>
              <p className="people-role">{p.role}</p>
              {p.note && <p className="people-note">{p.note}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="people-row" style={{ '--n': people.length }}>
        {people.map((p, i) => (
          <button
            key={p.name}
            type="button"
            className={i === idx ? 'is-active' : ''}
            onMouseEnter={() => setIdx(i)}
            onFocus={() => setIdx(i)}
            onClick={() => setIdx(i)}
          >
            <strong>{p.name}</strong>
            <span>{p.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
