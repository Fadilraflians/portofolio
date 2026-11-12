import { useEffect } from 'react';
import { prefersReducedMotion } from './three/inputState';

/**
 * Adds a 3D "flip-up" entrance to content blocks as they scroll into view.
 * Targets section headers, grid items and stacked cards automatically, so
 * individual sections don't need to change. Skipped for reduced motion,
 * automated browsers (PDF export via puppeteer) and printing.
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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add('is-revealed');
            io.unobserve(el);
            // Hand transforms back to the element's own hover effects afterwards
            const delay = parseInt(el.style.getPropertyValue('--reveal-delay') || '0', 10);
            window.setTimeout(() => {
              el.classList.remove('reveal-3d', 'is-revealed');
              el.style.removeProperty('--reveal-delay');
            }, 1100 + delay);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    const seen = new WeakSet<Element>();
    const register = () => {
      const els = document.querySelectorAll<HTMLElement>(SELECTORS.join(','));
      els.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // Skip elements already on screen at load so nothing flashes
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) return;
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const index = Math.max(0, siblings.indexOf(el));
        el.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 90}ms`);
        el.classList.add('reveal-3d');
        io.observe(el);
      });
    };

    register();
    // Catch content that renders later (e.g. project filter changes)
    const mo = new MutationObserver(() => register());
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true, subtree: true });

    const revealAll = () => document.querySelectorAll('.reveal-3d').forEach((el) => el.classList.add('is-revealed'));
    window.addEventListener('beforeprint', revealAll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('beforeprint', revealAll);
    };
  }, []);

  return null;
};

export default ScrollReveal3D;
