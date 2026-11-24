import { CONTACT } from '../data/team.js';
import { useLang } from '../i18n.js';

const ICONS = {
  phone: (
    <>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h6M8 11h6" />
    </>
  ),
};

function Icon({ children }) {
  return (
    <span className="contact-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

export default function ContactSection({ onOpenManual }) {
  const { t } = useLang();
  const contact = t(CONTACT);

  return (
    <section id="contact" className="contact-section">
      <div className="contact-card">
        <div className="contact-intro">
          <p className="ov-eyebrow">{t('ติดต่อหน่วยงาน')}</p>
          <h2>{t('สนใจนวัตกรรม หรือต้องการข้อมูลเพิ่มเติม')}</h2>
          <p>
            {t('ติดต่อทีมผู้พัฒนาได้ที่')} <span className="nowrap">{t('หอผ่าตัดศัลยกรรมกระดูก')}</span>{' '}
            <span className="nowrap">{t('(ภูมิสิริฯ 6A)')}</span>
          </p>
        </div>
        <div className="contact-grid">
          <a className="contact-item" href={`tel:${contact.tel}`}>
            <Icon>{ICONS.phone}</Icon>
            <span className="contact-label">{t('โทรศัพท์')}</span>
            <strong className="nowrap">{contact.phone}</strong>
            <span className="contact-sub">{t('โทรภายใน')}{' '}{contact.internal}</span>
          </a>
          <a className="contact-item" href={contact.mapUrl} target="_blank" rel="noreferrer">
            <Icon>{ICONS.pin}</Icon>
            <span className="contact-label">{t('ที่ตั้ง · เปิดแผนที่')}</span>
            <strong>
              <span className="nowrap">{contact.buildingName}</span> <span className="nowrap">{contact.floor}</span>
            </strong>
            <span className="contact-sub">
              {contact.hospital}
              <br />
              {contact.address}
            </span>
          </a>
          <button type="button" className="contact-item" onClick={onOpenManual}>
            <Icon>{ICONS.book}</Icon>
            <span className="contact-label">{t('เอกสาร')}</span>
            <strong>{t('คู่มือการใช้นวัตกรรม')}</strong>
            <span className="contact-sub">{t('เปิดดูป้ายคู่มือฉบับเต็ม')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
