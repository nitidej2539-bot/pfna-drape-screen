import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

// พฤติกรรมร่วมของป๊อปอัป: Esc ปิด, Tab วนอยู่ในป๊อปอัป, ปิดแล้วโฟกัสกลับจุดเดิม
export function useModal(open, onClose) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const root = rootRef.current;
    const opener = document.activeElement;
    root.querySelector('[data-autofocus]')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const items = [...root.querySelectorAll(FOCUSABLE)];
      const edge = e.shiftKey ? items[0] : items.at(-1);
      const active = document.activeElement;
      if (active === edge || !root.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? items.at(-1) : items[0])?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return rootRef;
}
