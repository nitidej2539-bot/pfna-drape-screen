import { Html } from '@react-three/drei';
import { FEATURES } from '../data/product.js';
import { useLang } from '../i18n.js';
import { MIRROR, PFNA } from './layout.js';

/* ---------- กล่อง 3 กล่องบนตัวผลิตภัณฑ์ ---------- */
const ANCHORS = {
  head: [PFNA.headX * MIRROR, 1.6, PFNA.z],
  bar: [0.35 * MIRROR, PFNA.top, PFNA.z],
  traction: [PFNA.tracX * MIRROR, 1.5, PFNA.z],
};

export default function FeatureHotspots({ visible, onOpen }) {
  const { t } = useLang();
  return t(FEATURES).map((f, i) => (
    <Html key={f.id} position={ANCHORS[f.id]} center zIndexRange={[20, 0]}>
      <div className={`h3d is-${f.id} ${visible ? 'is-visible' : ''}`} style={{ transitionDelay: visible ? `${i * 0.15}s` : '0s' }}>
        <span className="h3d-dot" />
        <button type="button" className="h3d-card" onClick={() => onOpen(f)} tabIndex={visible ? 0 : -1}>
          <span className="hotspot-plus" aria-hidden="true">+</span>
          <span className="hotspot-text">
            <strong>{f.title}</strong>
            <small>{f.subtitle}</small>
          </span>
        </button>
      </div>
    </Html>
  ));
}
