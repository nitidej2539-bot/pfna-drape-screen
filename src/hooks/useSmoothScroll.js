import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap.js';

// Smooth scroll (Lenis) ซิงก์กับ GSAP ScrollTrigger — paused = หยุดเลื่อนพื้นหลังขณะเปิดป๊อปอัป
export function useSmoothScroll(paused) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ยังได้ scroll นุ่ม แต่ไหลน้อยลง
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ lerp: reduce ? 0.2 : 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    if (import.meta.env.DEV) window.__lenis = lenis; // โหมดสาธิต (demo.js) และการทดสอบจาก console
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (paused) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [paused]);

  return lenisRef;
}
