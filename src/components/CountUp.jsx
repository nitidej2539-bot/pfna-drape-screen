import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap.js';

// ตัวเลขนับขึ้นใน dashboard
export default function CountUp({ value, decimals = 0, active, suffix = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return undefined;
    const counter = { v: 0 };
    const options = { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    const tween = gsap.to(counter, {
      v: value,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = counter.v.toLocaleString('th-TH', options) + suffix;
      },
    });
    return () => tween.kill();
  }, [active, value, decimals, suffix]);
  return <span ref={ref}>{(0).toFixed(decimals) + suffix}</span>;
}
