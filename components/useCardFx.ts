import { useEffect, useRef, useState } from 'react';
import type React from 'react';

/**
 * Shared card effects: staggered inner entrance (once, when scrolled into view)
 * and a cursor-following spotlight. Pair with the `.cert-card` CSS family.
 */
export function useCardFx<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<'pre' | 'in' | 'done'>('pre');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || navigator.webdriver) {
      setPhase('done');
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPhase('in');
        timer = window.setTimeout(() => setPhase('done'), 1800);
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const phaseClass = phase === 'pre' ? 'cert-pre' : phase === 'in' ? 'cert-in' : '';
  return { ref, onPointerMove, phaseClass };
}

export const stagger = (n: number) => ({ '--i': n } as React.CSSProperties);
