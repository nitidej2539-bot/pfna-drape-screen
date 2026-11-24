import { useEffect, useRef } from 'react';
import { useFrameSequence } from './useFrameSequence.js';

// เล่นชุดภาพลง canvas ตามการเลื่อน แบบหน่วงนุ่ม ๆ (ทำงานเฉพาะตอน visible)
// goalOf(progress) = เฟรมที่ควรอยู่, onTick(frame) = แจ้งเฟรมปัจจุบัน — ต้องเป็นฟังก์ชันนอกคอมโพเนนต์หรือ memo แล้ว
export function useFramePlayer({ dir, count, preload, visible, progress, goalOf, smoothing, onTick }) {
  const canvasRef = useRef(null);
  const frameAt = useFrameSequence(dir, count, { enabled: preload });

  useEffect(() => {
    if (!visible) return undefined;
    const canvas = canvasRef.current;
    const g = canvas.getContext('2d');
    let raf;
    let smooth = null;
    let drawn = -1;
    const tick = () => {
      const goal = goalOf(progress.current);
      smooth = smooth === null ? goal : smooth + (goal - smooth) * smoothing;
      const target = Math.round(smooth);
      onTick?.(target);
      const frame = frameAt(target);
      if (frame && frame.index !== drawn) {
        g.drawImage(frame.img, 0, 0, canvas.width, canvas.height);
        drawn = frame.index;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, progress, goalOf, smoothing, onTick, frameAt]);

  return canvasRef;
}
