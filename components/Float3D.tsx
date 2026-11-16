import React, { useEffect, useRef } from 'react';

interface Float3DProps {
  children: React.ReactNode;
  /** Rendered behind the content, pushed back in depth (moves less, opposite to the tilt). */
  back?: React.ReactNode;
  /** Rendered in front of the content, pulled forward in depth (moves more with the tilt). */
  front?: React.ReactNode;
  /** Max tilt toward the pointer, in degrees. */
  max?: number;
  className?: string;
}

/**
 * A 3D "hovering in space" stage: idle float + sway, and a spring-smoothed tilt toward
 * the pointer. Writes the transform directly in a rAF loop (no React re-renders) and
 * only animates while on screen. Honours prefers-reduced-motion.
 */
const Float3D: React.FC<Float3DProps> = ({ children, back, front, max = 12, className = '' }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const body = bodyRef.current;
    if (!stage || !body) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const target = { rx: 0, ry: 0 };
    const pose = { rx: 0, ry: 0, vx: 0, vy: 0 };
    let hover = 0; // 0 → idle sway, 1 → following the pointer
    let inside = false;
    let visible = true;
    let raf = 0;
    let last = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      target.ry = Math.max(-1, Math.min(1, px * 2)) * max;
      target.rx = Math.max(-1, Math.min(1, -py * 2)) * max * 0.6;
      inside = true;
    };
    const onLeave = () => {
      inside = false;
      target.rx = 0;
      target.ry = 0;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const t = now / 1000;

      hover += ((inside ? 1 : 0) - hover) * (1 - Math.exp(-dt / 0.25));
      const idle = 1 - hover * 0.75;

      // critically-damped-ish spring toward the pointer target
      const k = 70;
      const c = 2 * Math.sqrt(k) * 0.9;
      pose.vx += ((target.rx - pose.rx) * k - pose.vx * c) * dt;
      pose.vy += ((target.ry - pose.ry) * k - pose.vy * c) * dt;
      pose.rx += pose.vx * dt;
      pose.ry += pose.vy * dt;

      const swayY = Math.sin(t * 0.55) * 6 * idle;
      const swayX = Math.sin(t * 0.8 + 1.2) * 2.5 * idle;
      const lift = Math.sin(t * 1.1) * 9;
      const roll = Math.sin(t * 0.55 + 0.6) * 1.2 * idle;

      body.style.transform =
        `translate3d(0, ${lift.toFixed(2)}px, 0) ` +
        `rotateX(${(pose.rx + swayX).toFixed(2)}deg) ` +
        `rotateY(${(pose.ry + swayY).toFixed(2)}deg) ` +
        `rotateZ(${roll.toFixed(2)}deg)`;
      // exhaust shadow / ground glow breathes with the lift
      body.style.setProperty('--lift', (lift / 9).toFixed(3));

      raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (!raf && visible && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(stage);
    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerleave', onLeave, { passive: true });
    document.addEventListener('visibilitychange', wake);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [max]);

  return (
    <div ref={stageRef} className={`relative ${className}`} style={{ perspective: '1100px' }}>
      <div ref={bodyRef} className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}>
        {back && (
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-90px) scale(1.08)' }}>
            {back}
          </div>
        )}
        <div className="relative w-full h-full" style={{ transform: 'translateZ(0)' }}>
          {children}
        </div>
        {front && (
          <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(70px) scale(0.94)' }}>
            {front}
          </div>
        )}
      </div>
    </div>
  );
};

export default Float3D;
