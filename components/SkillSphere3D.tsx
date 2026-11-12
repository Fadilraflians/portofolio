import React, { useEffect, useRef } from 'react';
import type { Skill } from '../types';
import { prefersReducedMotion } from './three/inputState';

interface SkillSphere3DProps {
  skills: Skill[];
}

/**
 * Interactive 3D tag sphere. Skills are spread over a sphere with a
 * Fibonacci lattice, auto-rotate, and can be spun by dragging.
 * Pure DOM + transforms: crisp text, no WebGL context needed.
 */
const SkillSphere3D: React.FC<SkillSphere3DProps> = ({ skills }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const n = skills.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const points = skills.map((_, i) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });

    const reduced = prefersReducedMotion();
    const idle = { x: reduced ? 0.0005 : 0.0018, y: reduced ? 0.001 : 0.0042 };
    let angX = 0.3;
    let angY = 0;
    let velX = idle.x;
    let velY = idle.y;
    let dragging = false;
    let hovering = false;
    let lastX = 0;
    let lastY = 0;
    let raf = 0;
    let visible = true;

    const render = () => {
      if (!dragging) {
        const factor = hovering ? 0.35 : 1;
        velX += (idle.x * factor - velX) * 0.02;
        velY += (idle.y * factor - velY) * 0.02;
      }
      angX += velX;
      angY += velY;

      const radius = Math.min(container.clientWidth, container.clientHeight) * 0.4;
      const cosX = Math.cos(angX);
      const sinX = Math.sin(angX);
      const cosY = Math.cos(angY);
      const sinY = Math.sin(angY);

      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const p = points[i];
        // Rotate around Y, then X
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        const scale = 0.55 + depth * 0.65;
        el.style.transform = `translate(-50%, -50%) translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${scale})`;
        el.style.opacity = String(0.18 + depth * 0.82);
        el.style.zIndex = String(Math.round(depth * 100));
        el.style.filter = depth < 0.3 ? `blur(${(0.3 - depth) * 4}px)` : 'none';
        el.dataset.front = depth > 0.82 ? '1' : '0';
      }

      if (visible) raf = requestAnimationFrame(render);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = dx * 0.006;
      velX = -dy * 0.006;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
    };
    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);

    container.addEventListener('pointerdown', onDown);
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerup', onUp);
    container.addEventListener('pointercancel', onUp);
    container.addEventListener('pointerenter', onEnter);
    container.addEventListener('pointerleave', onLeave);

    // Only animate while on screen
    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) raf = requestAnimationFrame(render);
    });
    io.observe(container);

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      container.removeEventListener('pointerdown', onDown);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerup', onUp);
      container.removeEventListener('pointercancel', onUp);
      container.removeEventListener('pointerenter', onEnter);
      container.removeEventListener('pointerleave', onLeave);
    };
  }, [skills]);

  return (
    <div className="relative mx-auto w-full max-w-[560px] aspect-square select-none">
      {/* Glow + orbit decoration */}
      <div className="absolute inset-[18%] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow" />
      <div className="absolute inset-[8%] rounded-full border border-cyan-500/15 orbit-spin" />
      <div className="absolute inset-[14%] rounded-full border border-dashed border-purple-500/20 orbit-spin-reverse" />
      <div className="absolute inset-[36%] rounded-full bg-gradient-to-br from-cyan-400/25 via-blue-600/20 to-purple-600/25 blur-xl" />

      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
        role="list"
        aria-label="Daftar keahlian (bola 3D interaktif, geser untuk memutar)"
      >
        {skills.map((skill, i) => {
          const Icon = skill.icon;
          return (
            <div
              key={skill.name}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="listitem"
              className="skill-orb-item absolute left-1/2 top-1/2 will-change-transform"
            >
              <div className="flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-full bg-slate-950/85 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.18)] backdrop-blur-md text-xs sm:text-sm font-semibold text-slate-100">
                <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{skill.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="absolute -bottom-2 left-0 right-0 text-center text-[11px] font-mono text-slate-500 tracking-wider">
        ⟲ drag untuk memutar
      </p>
    </div>
  );
};

export default SkillSphere3D;
