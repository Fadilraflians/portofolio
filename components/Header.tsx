import React, { useState, useEffect } from 'react';
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
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`relative px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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