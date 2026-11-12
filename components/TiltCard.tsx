import React, { useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees */
  max?: number;
  /** Show the moving light glare */
  glare?: boolean;
  /** Corner radius class shared by the card and its glare */
  rounded?: string;
  /** Animated cyan/purple gradient border */
  flow?: boolean;
}

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Wraps content in a 3D perspective card that tilts toward the pointer,
 * with a light glare following the cursor. Children can use
 * `.tilt-pop` / `.tilt-pop-lg` to float above the card surface.
 * Uses CSS variables on the element, so no React re-renders while moving.
 */
const TiltCard: React.FC<TiltCardProps> = ({ children, className = '', max = 10, glare = true, rounded = 'rounded-2xl', flow = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse' || !canHover()) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      el.dataset.active = '1';
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.dataset.active = '0';
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt-card ${className}`}>
      <div className={`tilt-card-inner relative h-full ${rounded} ${flow ? 'border-flow' : ''}`}>
        {children}
        {glare && <div className="tilt-glare" aria-hidden="true" />}
      </div>
    </div>
  );
};

export default TiltCard;
