import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { NAV_PROGRESS, PAGE_SECTIONS, PRELOAD_AT, chapterOf, stepOf, toProgress, toScroll } from '../config/timeline.js';

const HEADER_GAP = 70;
const easeOutCubic = (x) => 1 - (1 - x) ** 3;

// แปลงตำแหน่งเลื่อนของหน้า → บท/ขั้นตอน/เมนูที่ไฮไลต์ และพาไปยังจุดต่าง ๆ
// progress เป็น ref (ไม่ใช่ state) เพราะอัปเดตทุกเฟรม — ห้อง 3D อ่านค่าตรง ๆ โดยไม่ต้อง re-render
export function useScrollStory(lenisRef, lang) {
  const experienceRef = useRef(null);
  const progressBarRef = useRef(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState('intro');
  const [step, setStep] = useState(0);
  const [section, setSection] = useState('home');
  const [in3D, setIn3D] = useState(false);
  const [preload, setPreload] = useState({ pole3: false, install: false });

  useGSAP(() => {
    const el = experienceRef.current;
    // ระหว่างจัดหน้า/รีเฟรช เหตุการณ์ของส่วนอื่นอาจยิงทั้งที่ยังอยู่หน้าแรก จึงเช็กตำแหน่งจริง
    const beforeExperience = () => window.scrollY < el.offsetTop;

    ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = toProgress(self.progress);
        progress.current = p;
        gsap.set(progressBarRef.current, { scaleY: p });
        const c = chapterOf(p);
        setChapter(c);
        setStep(stepOf(p));
        if (c !== 'transit' && c !== 'intro') setSection(c);
        setPreload((prev) => {
          const pole3 = prev.pole3 || p > PRELOAD_AT.pole3;
          const install = prev.install || p > PRELOAD_AT.install;
          return pole3 === prev.pole3 && install === prev.install ? prev : { pole3, install };
        });
      },
    });

    const syncHome = () => beforeExperience() && setSection('home');
    ScrollTrigger.addEventListener('refresh', syncHome);

    // เรนเดอร์ 3D เฉพาะตอนใกล้ถึง/อยู่ในห้อง 3D — ช่วงวิดีโอเดินเข้าห้องจะได้ลื่น
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => setIn3D(self.isActive),
    });

    Object.entries(PAGE_SECTIONS).forEach(([id, key]) => {
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setSection(key),
      });
    });
    ScrollTrigger.create({
      trigger: el,
      start: 'bottom 55%',
      onLeaveBack: () => setSection(beforeExperience() ? 'home' : 'results'),
    });

    return () => ScrollTrigger.removeEventListener('refresh', syncHome);
  }, []);

  // เปลี่ยนภาษาแล้วความสูงบางส่วนเปลี่ยน → คำนวณตำแหน่ง scroll ใหม่
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => clearTimeout(id);
  }, [lang]);

  const goTo = useCallback(
    (key) => {
      let top = 0;
      if (key in NAV_PROGRESS) {
        const el = experienceRef.current;
        top = el.offsetTop + toScroll(NAV_PROGRESS[key]) * (el.offsetHeight - window.innerHeight);
      } else if (key !== 'home') {
        const el = document.getElementById(key);
        if (!el) return;
        top = el.getBoundingClientRect().top + window.scrollY - HEADER_GAP;
      }
      // เลื่อนนุ่ม ๆ ระยะไกลใช้เวลานานขึ้นเล็กน้อย (สูงสุด 2.4 วินาที)
      const duration = Math.min(2.4, 0.9 + Math.abs(top - window.scrollY) / 6000);
      if (lenisRef.current) lenisRef.current.scrollTo(top, { duration, easing: easeOutCubic });
      else window.scrollTo({ top, behavior: 'smooth' });
    },
    [lenisRef]
  );

  return { experienceRef, progressBarRef, progress, chapter, step, section, setSection, in3D, preload, goTo };
}
