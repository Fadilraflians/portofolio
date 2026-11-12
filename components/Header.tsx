import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

const navItems = [
  { href: '#about', label: 'Tentang' },
  { href: '#education', label: 'Pendidikan' },
  { href: '#experience', label: 'Pengalaman' },
  { href: '#projects', label: 'Proyek' },
  { href: '#skills', label: 'Keahlian' },
  { href: '#publications', label: 'Publikasi' },
  { href: '#certifications', label: 'Sertifikasi' },
  { href: '#contact', label: 'Kontak' },
];

const Header: React.FC = () => {
  const [activeSection, setActiveSection] = useState('#hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Rubber sliding pill behind the desktop nav buttons
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const lastLeft = useRef<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pill, setPill] = useState({ left: 0, right: 0, visible: false, goingRight: true, animate: false });
  const pillTarget = hovered ?? activeSection;

  const measurePill = useCallback(() => {
    const nav = navRef.current;
    const link = linkRefs.current[pillTarget];
    if (!nav || !link || nav.clientWidth === 0) {
      setPill((p) => (p.visible ? { ...p, visible: false } : p));
      return;
    }
    const left = link.offsetLeft;
    const right = nav.clientWidth - (left + link.offsetWidth);
    const first = lastLeft.current === null;
    const goingRight = first ? true : left >= (lastLeft.current as number);
    lastLeft.current = left;
    setPill((p) => ({ left, right, visible: true, goingRight: first ? p.goingRight : goingRight, animate: !first }));
  }, [pillTarget]);

  useLayoutEffect(() => {
    measurePill();
  }, [measurePill]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => measurePill());
    ro.observe(nav);
    document.fonts?.ready.then(() => measurePill());
    return () => ro.disconnect();
  }, [measurePill]);

  // The edge that leads the move is fast, the trailing edge lags and overshoots: the pill stretches like rubber
  const LEAD = '0.36s cubic-bezier(0.34, 1.7, 0.5, 1)';
  const TRAIL = '0.62s cubic-bezier(0.34, 1.45, 0.5, 1) 0.07s';
  const pillTransition = pill.animate
    ? `left ${pill.goingRight ? TRAIL : LEAD}, right ${pill.goingRight ? LEAD : TRAIL}, opacity 0.25s ease`
    : 'opacity 0.25s ease';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionElements = navItems.map((item) => document.querySelector<HTMLElement>(item.href));
      const scrollPos = window.scrollY + 200;

      for (const el of sectionElements) {
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveSection(`#${el.id}`);
          break;
        }
      }
      if (window.scrollY < 100) {
        setActiveSection('#hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setActiveSection(href);
    if (href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-4 sm:px-6 flex justify-center pointer-events-none">
      {/* Floating Pill Nav */}
      <div
        className={`pointer-events-auto transition-all duration-300 rounded-full flex items-center justify-between gap-2 sm:gap-6 px-4 py-2 sm:px-5 sm:py-2.5 max-w-6xl w-full border ${
          isScrolled
            ? 'bg-[#0b101d]/90 backdrop-blur-md border-cyan-500/30 shadow-2xl shadow-cyan-950/50'
            : 'bg-[#0f172a]/75 backdrop-blur-sm border-slate-700/60 shadow-xl'
        }`}
      >
        {/* Brand / Profile Avatar */}
        <a
          href="#hero"
          onClick={(e) => scrollToSection(e, '#hero')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-cyan-400/70 group-hover:ring-cyan-300 transition-all shadow-md shadow-cyan-500/20">
            <img
              src="/fadil-photo.png"
              alt="Fadil Rafliansyah"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-400 transition-colors tracking-wide hidden min-[380px]:inline-block">
            Fadil Rafliansyah
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHovered(null)}
          className="relative hidden lg:flex items-center gap-1 xl:gap-2"
        >
          {/* Rubber sliding pill */}
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-500/25 border border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.3)] pointer-events-none"
            style={{
              left: pill.left,
              right: pill.right,
              opacity: pill.visible ? 1 : 0,
              transition: pillTransition,
            }}
          />
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            const isTarget = pillTarget === item.href;
            return (
              <a
                key={item.href}
                ref={(el) => {
                  linkRefs.current[item.href] = el;
                }}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                onMouseEnter={() => setHovered(item.href)}
                onFocus={() => setHovered(item.href)}
                onBlur={() => setHovered(null)}
                className={`relative z-10 px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-colors duration-200 ${
                  isTarget ? 'text-white' : isActive ? 'text-cyan-300' : 'text-slate-300'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:brightness-110 transition-all"
          >
            Kontak
          </a>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-[#07090e]/95 backdrop-blur-xl lg:hidden flex flex-col p-6 animate-fade-in-up border-b border-cyan-500/20 pointer-events-auto">
          <nav className="flex flex-col space-y-3 mt-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className={`px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <Sparkles className="w-4 h-4 text-cyan-400" />}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;