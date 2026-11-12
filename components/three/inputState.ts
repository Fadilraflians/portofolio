/**
 * Shared, mutable input state read inside render loops (no React re-renders).
 * pointer: normalized -1..1, scroll.progress: 0..1 over the whole page.
 */
export const pointer = { x: 0, y: 0 };
export const scroll = { progress: 0, y: 0 };

let initialized = false;

export function initInputState() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scroll.y = window.scrollY;
    scroll.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

export const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
};
