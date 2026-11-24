import PeopleReveal from '../components/PeopleReveal.jsx';
import { ADVISORS, MEMBERS } from '../data/team.js';
import { useLang } from '../i18n.js';

export default function TeamSection() {
  const { t } = useLang();

  return (
    <section id="team" className="page-section">
      <p className="ov-eyebrow">{t('ทีมผู้พัฒนา')}</p>
      <h2 className="section-title">{t('ที่ปรึกษาโครงการ')}</h2>
      <PeopleReveal people={t(ADVISORS)} group={t('ที่ปรึกษาโครงการ')} />
      <h2 className="section-title section-title--gap">{t('สมาชิกทีม')}</h2>
      <PeopleReveal people={t(MEMBERS)} group={t('สมาชิกทีม')} />
    </section>
  );
}
