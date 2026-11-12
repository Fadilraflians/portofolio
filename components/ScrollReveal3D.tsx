import { useEffect } from 'react';
import { prefersReducedMotion } from './three/inputState';

/**
 * Adds a 3D "flip-up" entrance to content blocks as they scroll into view.
 * Targets section headers, grid items and stacked cards automatically, so
 * individual sections don't need to change. Skipped for reduced motion,
 * automated browsers (PDF export via puppeteer) and printing.
 *
 * Reveal rule: an element is shown as soon as its top edge is above the bottom
 * of the viewport. That covers elements peeking in AND ones scrolled straight
 * past (fast scroll, nav jumps), so nothing is ever skipped while still hidden.
 * Tall wrappers (a whole timeline or grid) are never animated as one block:
 * their children are animated individually instead.
 */
const SELECTORS = [
  'main section:not(#hero) .container > *',
  'main section:not(#hero) .grid > *',
  'main section:not(#hero) .space-y-8 > *',
  'main section:not(#hero) .space-y-6 > *',
  'footer > *',
];

const ScrollReveal3D: React.FC = () => {
  useEffect(() => {
    if (prefersReducedMotion() || navigator.webdriver) return;

    const pending = new Set<HTMLElement>();
    const seen = new WeakSet<Element>();
    let raf = 0;

    const reveal = (el: HTMLElement) => {
      pending.delete(el);
      el.classList.add('is-revealed');
      // Hand transforms back to the element's own hover effects afterwards
      const delay = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10);
      window.setTimeout(() => {
        el.classList.remove('reveal-3d', 'is-revealed');
        el.style.removeProperty('--reveal-delay');
      }, 800 + delay);
    };

    const check = () => {
      raf = 0;
      const limit = window.innerHeight - 24;
      pending.forEach((el) => {
        if (el.getBoundingClientRect().top < limit) reveal(el);
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };

    const register = (el: HTMLElement) => {
      if (seen.has(el)) return;
      seen.add(el);
      const rect = el.getBoundingClientRect();

      // A block taller than the screen would stay hidden until far into view: animate its children instead
      if (rect.height > window.innerHeight * 1.1 && el.children.length > 0) {
        Array.from(el.children).forEach((child) => child instanceof HTMLElement && register(child));
        return;
      }

      // Already on screen (or passed) at load: leave visible so nothing flashes
      if (rect.top < window.innerHeight * 0.9) return;

      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const index = Math.max(0, siblings.indexOf(el));
      el.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 60}ms`);
      el.classList.add('reveal-3d');
      pending.add(el);
    };

    const registerAll = () => {
      document.querySelectorAll<HTMLElement>(SELECTORS.join(',')).forEach(register);
      schedule();
    };

    registerAll();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    // Catch content that renders later (e.g. project filter changes)
    const mo = new MutationObserver(registerAll);
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });

    const revealAll = () => Array.from(pending).forEach(reveal);
    window.addEventListener('beforeprint', revealAll);

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('beforeprint', revealAll);
    };
  }, []);

  return null;
};

export default ScrollReveal3D;
