import { gsap, useGSAP } from '../lib/gsap.js';
import { useModal } from '../hooks/useModal.js';
import { useLang } from '../i18n.js';

// popup (desktop) / bottom sheet (mobile) แสดงรายละเอียดของอุปกรณ์
export default function DetailPanel({ item, onClose }) {
  const { t } = useLang();
  const rootRef = useModal(Boolean(item), onClose);

  useGSAP(
    () => {
      if (!item) return;
      gsap.fromTo('.detail-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        '.detail-panel',
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
      );
    },
    { dependencies: [item], scope: rootRef, revertOnUpdate: true }
  );

  if (!item) return null;
  const { detail } = item;

  return (
    <div className="detail-root" ref={rootRef}>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-panel" role="dialog" aria-modal="true" aria-label={detail.heading}>
        <button type="button" data-autofocus className="detail-close" onClick={onClose} aria-label={t('ปิด')}>
          ×
        </button>
        <p className="detail-eyebrow">{item.title}</p>
        <h2>{detail.heading}</h2>
        <dl className="detail-specs">
          {detail.specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="detail-body">{detail.body}</p>
      </div>
    </div>
  );
}
