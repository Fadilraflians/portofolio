import React, { useEffect, useRef } from 'react';

/** Cursor spotlight and scroll progress bar. */
const EffectsLayer: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 3;
    let tx = gx;
    let ty = gy;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${gx - 300}px, ${gy - 300}px, 0)`;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      {/* Cursor spotlight */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[1] w-[600px] h-[600px] rounded-full pointer-events-none hidden md:block"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, rgba(99,102,241,0.04) 35%, transparent 65%)' }}
      />

      {/* Scroll progress */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none">
        <div
          ref={barRef}
          className="h-full origin-left bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </>
  );
};

export default EffectsLayer;
