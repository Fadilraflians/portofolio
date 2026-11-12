/** Small environment checks shared by the visual effects. */

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

export const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
