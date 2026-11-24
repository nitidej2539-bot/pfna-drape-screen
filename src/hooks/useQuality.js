import { useCallback, useEffect, useMemo, useState } from 'react';

// คุณภาพภาพ: ลดอัตโนมัติถ้าเครื่องช้า (ให้ลื่นไหลก่อนสวย)
// ?quality=high = บังคับคุณภาพสูงเสมอ (เครื่องนำเสนอแรง ๆ) · ?quality=low = บังคับประหยัด
export function useQuality() {
  const forced = useMemo(() => new URLSearchParams(window.location.search).get('quality'), []);
  const [dpr, setDpr] = useState(forced === 'low' ? 1 : 1.5);
  const [hq, setHq] = useState(() => (forced ? forced === 'high' : window.innerWidth >= 900));

  useEffect(() => {
    window.__quality = hq ? 'high' : 'low'; // ไว้ตรวจสอบจาก console
  }, [hq]);

  const decline = useCallback(() => {
    if (forced === 'high') return;
    setDpr(1);
    setHq(false);
  }, [forced]);

  const incline = useCallback(() => {
    if (forced !== 'low') setDpr(1.5);
  }, [forced]);

  return { dpr, hq, incline, decline };
}
