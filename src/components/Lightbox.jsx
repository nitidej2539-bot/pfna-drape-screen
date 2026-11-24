import { useModal } from '../hooks/useModal.js';
import { useLang } from '../i18n.js';

// เปิดดูภาพขนาดเต็ม (คู่มือ, สไลด์ผลการพัฒนา) — ปิดด้วย ×, Esc หรือคลิกพื้นหลัง
export default function Lightbox({ image, onClose }) {
  const { t } = useLang();
  const rootRef = useModal(Boolean(image), onClose);

  if (!image) return null;
  return (
    <div ref={rootRef} className="lightbox" role="dialog" aria-modal="true" aria-label={image.caption} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.caption} />
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>
      <button type="button" data-autofocus className="detail-close lightbox-close" onClick={onClose} aria-label={t('ปิด')}>
        ×
      </button>
    </div>
  );
}
