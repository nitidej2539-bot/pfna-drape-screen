import { useCallback, useEffect, useRef } from 'react';
import { frameUrl } from '../lib/asset.js';

const isReady = (img) => Boolean(img?.complete && img.naturalWidth);

// โหลดชุดภาพทีละเฟรม (dir/f0000.webp …) ใช้แทน <video> เพราะเลื่อนถอยหลังได้ไม่กระตุก
// onFrame(i, settled) ถูกเรียกเมื่อเฟรม i เสร็จ (โหลดไม่ได้ก็นับ ตัวเลข % จะได้ไม่ค้าง)
// คืน frameAt(target) = เฟรมที่พร้อมและใกล้ target ที่สุด (ถอยหลัง) หรือ null
export function useFrameSequence(dir, count, { enabled = true, onFrame } = {}) {
  const frames = useRef([]);
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let settled = 0;
    const images = Array.from({ length: count }, (_, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        settled += 1;
        callback.current?.(i, settled);
      };
      img.src = frameUrl(dir, i);
      return img;
    });
    frames.current = images;
    return () => {
      images.forEach((img) => {
        img.onload = img.onerror = null;
        if (!img.complete) img.src = '';
      });
      frames.current = [];
    };
  }, [dir, count, enabled]);

  return useCallback((target) => {
    for (let i = target; i >= 0; i--) {
      const img = frames.current[i];
      if (isReady(img)) return { index: i, img };
    }
    return null;
  }, []);
}
