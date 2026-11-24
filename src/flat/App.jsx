import { useCallback, useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { asset } from '../lib/asset.js';
import Stage from './Stage.jsx';
import Hotspot from './Hotspot.jsx';
import DetailPanel from '../components/DetailPanel.jsx';
import { hotspots } from './hotspots.js';

// จุดศูนย์กลางของประตูห้องผ่าตัดในภาพที่ 1 (% ของภาพ)
const DOOR_ORIGIN = '53% 48%';
// เครื่องที่ปิด animation ของ Windows จะได้แบบ crossfade ธรรมดา — เติม ?motion=full ใน URL เพื่อบังคับเปิด zoom
const FORCE_MOTION = new URLSearchParams(window.location.search).get('motion') === 'full';

export default function App() {
  const rootRef = useRef(null);
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: FORCE_MOTION ? 'all' : '(prefers-reduced-motion: no-preference)',
          reduced: FORCE_MOTION ? 'not all' : '(prefers-reduced-motion: reduce)',
          fine: '(pointer: fine) and (min-width: 769px)',
        },
        (ctx) => {
          const { motion, fine } = ctx.conditions;

          // ---- สถานะเริ่มต้น ----
          gsap.set('.scene1 .stage-inner', { transformOrigin: DOOR_ORIGIN });
          gsap.set('.scene2', { autoAlpha: 0 });
          gsap.set('.scene2 .stage-inner', { scale: motion ? 1.3 : 1 });
          gsap.set('.hotspot-card', { autoAlpha: 0, y: 20, scale: 0.9 });
          gsap.set('.hotspot-dot', { scale: 0 });
          gsap.set('.hotspot-line line', { strokeDasharray: 1, strokeDashoffset: 1 });

          // ---- Timeline ผูกกับการ scroll (รวมยาว 1 หน่วย) ----
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: '.scroll-section',
              start: 'top top',
              end: '+=250%',
              pin: true,
              scrub: 1,
              onUpdate: (self) => gsap.set('.progress-bar', { scaleY: self.progress }),
            },
          });

          // 1) Zoom เข้าประตู
          if (motion) {
            tl.to('.scene1 .stage-inner', { scale: 4, ease: 'power2.in', duration: 0.6 }, 0);
          }

          // 2) เปลี่ยนเป็นฉากที่ 2
          tl.to('.scene1', { autoAlpha: 0, duration: 0.2 }, 0.5);
          tl.to('.scene2', { autoAlpha: 1, duration: 0.2 }, 0.5);
          if (motion) {
            tl.to('.scene2 .stage-inner', { scale: 1, ease: 'power2.out', duration: 0.25 }, 0.5);
          }

          // 3) กล่อง 3 กล่องโผล่ทีละกล่อง
          tl.to('.hotspot-dot', { scale: 1, duration: 0.05, stagger: 0.06, ease: 'back.out(3)' }, 0.75);
          tl.to('.hotspot-line line', { strokeDashoffset: 0, duration: 0.06, stagger: 0.06 }, 0.77);
          tl.to(
            '.hotspot-card',
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.08, stagger: 0.06, ease: 'power2.out' },
            0.8
          );
          tl.to({}, { duration: 0.04 }); // ค้างไว้ช่วงท้ายเล็กน้อย

          // ---- Mouse parallax (เฉพาะ desktop ที่มีเมาส์) ----
          if (fine && motion) {
            const layer = '.scene2 .parallax';
            const front = '.scene2 .hotspot-layer';
            gsap.set(layer, { scale: 1.06 }); // เผื่อขอบภาพไม่ให้โผล่ตอนขยับ
            const xTo = gsap.quickTo(layer, 'x', { duration: 0.8, ease: 'power3' });
            const yTo = gsap.quickTo(layer, 'y', { duration: 0.8, ease: 'power3' });
            const rxTo = gsap.quickTo(layer, 'rotationX', { duration: 0.8, ease: 'power3' });
            const ryTo = gsap.quickTo(layer, 'rotationY', { duration: 0.8, ease: 'power3' });
            const fxTo = gsap.quickTo(front, 'x', { duration: 0.8, ease: 'power3' });
            const fyTo = gsap.quickTo(front, 'y', { duration: 0.8, ease: 'power3' });

            const onMove = (e) => {
              const nx = e.clientX / window.innerWidth - 0.5; // -0.5 .. 0.5
              const ny = e.clientY / window.innerHeight - 0.5;
              xTo(-nx * 30);
              yTo(-ny * 30);
              ryTo(nx * 6);
              rxTo(-ny * 6);
              fxTo(-nx * 18);
              fyTo(-ny * 18);
            };
            window.addEventListener('mousemove', onMove);
            return () => window.removeEventListener('mousemove', onMove);
          }
        }
      );
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef}>
      <section className="scroll-section">
        <div className="scene scene1" style={{ '--bg-img': `url(${asset('images/scene1.jpg')})` }}>
          <Stage src={asset('images/scene1.jpg')} alt="ห้องผ่าตัดออร์โธปิดิกส์ — ประตู Operating Room" />
        </div>

        <div className="scene scene2" style={{ '--bg-img': `url(${asset('images/scene2.webp')})` }}>
          <div className="parallax">
            <Stage src={asset('images/scene2.webp')} alt="ภายในห้องผ่าตัด พร้อม Fracture Table Bed Support System">
              <div className="hotspot-layer">
                {hotspots.map((h) => (
                  <Hotspot key={h.id} data={h} onOpen={setActive} />
                ))}
              </div>
            </Stage>
          </div>
        </div>

        <div className="progress" aria-hidden="true">
          <div className="progress-bar" />
        </div>
      </section>

      <DetailPanel item={active} onClose={close} />
    </main>
  );
}
