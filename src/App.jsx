import { Suspense, lazy, useCallback, useState } from 'react';
import DetailPanel from './components/DetailPanel.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import InstallVideo from './components/InstallVideo.jsx';
import Lightbox from './components/Lightbox.jsx';
import Pole3Stage from './components/Pole3Stage.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import WalkIn from './components/WalkIn.jsx';
import ContactSection from './sections/ContactSection.jsx';
import HighlightsSection from './sections/HighlightsSection.jsx';
import InstallPanel from './sections/InstallPanel.jsx';
import MaterialsPanel from './sections/MaterialsPanel.jsx';
import ResultsPanel from './sections/ResultsPanel.jsx';
import TeamSection from './sections/TeamSection.jsx';
import UnitSection from './sections/UnitSection.jsx';
import VersionsSection from './sections/VersionsSection.jsx';
import { PRODUCT } from './data/product.js';
import { CONTACT } from './data/team.js';
import { useScrollStory } from './hooks/useScrollStory.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import { asset } from './lib/asset.js';
import { useLang } from './i18n.js';

const Room3D = lazy(() => import('./three/Room3D.jsx'));

export default function App() {
  const { lang, t } = useLang();
  const [feature, setFeature] = useState(null); // ชิ้นส่วนที่เปิดรายละเอียดอยู่
  const [zoomed, setZoomed] = useState(null); // ภาพที่ขยายอยู่
  const lenisRef = useSmoothScroll(Boolean(feature || zoomed));
  const { experienceRef, progressBarRef, progress, chapter, step, section, setSection, in3D, preload, goTo } = useScrollStory(lenisRef, lang);

  const closeFeature = useCallback(() => setFeature(null), []);
  const closeZoom = useCallback(() => setZoomed(null), []);
  const zoom = useCallback((src, caption) => setZoomed({ src: asset(src), caption }), []);
  const openManual = useCallback(() => zoom(PRODUCT.manual, t('คู่มือการใช้นวัตกรรมเสาฉากกั้นสำหรับเตียง Fracture Table')), [zoom, t]);
  const showVersions = useCallback(() => goTo('versions'), [goTo]);

  // บทวัสดุ/ติดตั้งมีภาพจริงบังเต็มจอ ไม่ต้องเรนเดอร์ 3D
  const run3D = in3D && chapter !== 'materials' && chapter !== 'install';
  const on = (name) => (chapter === name ? 'is-on' : '');

  return (
    <main className="app3d">
      <SiteHeader section={section} onNavigate={goTo} />

      {/* วิดีโอเดินเข้าห้องผ่าตัด (เลื่อนตาม scroll) */}
      <WalkIn onSection={setSection} />

      {/* ประสบการณ์ห้องผ่าตัด 3D (sticky ขณะ scroll) */}
      <section ref={experienceRef} className="experience">
        <div className="sticky">
          <ErrorBoundary fallback={<p className="room-fallback">{t('อุปกรณ์นี้แสดงภาพ 3D ไม่ได้ เลื่อนต่อเพื่อดูเนื้อหา')}</p>}>
            <Suspense fallback={null}>
              <Room3D
                progress={progress}
                running={run3D}
                showHotspots={chapter === 'product'}
                onOpenFeature={setFeature}
                onOpenManual={openManual}
              />
            </Suspense>
          </ErrorBoundary>

          <div className={`ov ov-enter3d ${on('intro')}`}>
            <p className="ov-eyebrow">{t('ห้องผ่าตัดจำลอง 3D')}</p>
            <p>{t('เลื่อนต่อเพื่อสำรวจวัสดุ ผลิตภัณฑ์ วิธีติดตั้ง และผลการใช้งาน')}</p>
          </div>

          {/* บทที่ 1: วัสดุ — ช็อตเสา 3 (Blender) เลื่อนตามเมาส์ */}
          <Pole3Stage progress={progress} visible={chapter === 'materials'} preload={preload.pole3} />
          <MaterialsPanel visible={chapter === 'materials'} onZoom={zoom} />

          {/* บทที่ 2: ผลิตภัณฑ์ */}
          <div className={`ov ov-product ${on('product')}`}>
            <p className="ov-eyebrow">{t('ผลิตภัณฑ์')}</p>
            <h2>
              <small>{t(PRODUCT.namePrefix)}</small>
              {t(PRODUCT.nameMain)}
            </h2>
            <p>{t('แตะกล่องบนตัวเสาเพื่อดูรายละเอียดแต่ละส่วน')}</p>
          </div>
          <div className={`ov ov-turns ${on('product')}`}>
            <button type="button" onClick={() => goTo('install')}>
              {t('← วิธีติดตั้ง')}
            </button>
            <button type="button" onClick={() => goTo('results')}>
              {t('ผลการใช้งาน →')}
            </button>
          </div>

          {/* บทที่ 3: วิธีติดตั้ง */}
          <InstallVideo progress={progress} visible={chapter === 'install'} step={step} preload={preload.install} />
          <InstallPanel visible={chapter === 'install'} step={step} onOpenManual={openManual} />

          {/* บทที่ 4: ผลการใช้งาน (dashboard) */}
          <ResultsPanel visible={chapter === 'results'} onShowVersions={showVersions} />

          <div className="progress" aria-hidden="true">
            <div ref={progressBarRef} className="progress-bar" />
          </div>
        </div>
      </section>

      <VersionsSection onZoom={zoom} />
      <HighlightsSection />
      <TeamSection />
      <UnitSection onZoom={zoom} />
      <ContactSection onOpenManual={openManual} />

      <footer className="site-footer">
        <span>{t(PRODUCT.name)}</span>
        <span>{t('โครงการพัฒนาคุณภาพ PI-2')}</span>
        <span>{t(CONTACT.hospital)}</span>
      </footer>

      <DetailPanel item={feature} onClose={closeFeature} />
      <Lightbox image={zoomed} onClose={closeZoom} />
    </main>
  );
}
