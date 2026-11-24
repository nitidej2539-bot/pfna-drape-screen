import { MATERIAL_FACTS } from '../data/product.js';
import { asset } from '../lib/asset.js';
import { useLang } from '../i18n.js';

export default function MaterialsPanel({ visible, onZoom }) {
  const { t } = useLang();
  const { title, checks, dims, images } = t(MATERIAL_FACTS);

  return (
    <aside data-lenis-prevent className={`ov ov-materials ${visible ? 'is-on' : ''}`}>
      <p className="ov-eyebrow">{t('เจาะลึกวัสดุ')}</p>
      <h2>{title}</h2>
      <ul className="mat-checks">
        {checks.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <dl className="detail-specs">
        {dims.map(([k, val]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>
      <div className="mat-thumbs">
        {images.map((im) => (
          <button key={im.src} type="button" onClick={() => onZoom(im.src, im.caption)}>
            <img src={asset(im.src)} alt={im.caption} loading="lazy" />
          </button>
        ))}
      </div>
    </aside>
  );
}
