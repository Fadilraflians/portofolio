import React, { useState, useEffect, useRef } from 'react';
import { Send, Download, Github, Linkedin, MapPin, GraduationCap, Award, Sparkles, Terminal } from 'lucide-react';
import { supportsWebGL } from './three/inputState';
import Scanner from './Scanner';

const titles = [
  'Web Developer',
  'Machine Learning Specialist',
  'Data Science Enthusiast',
  'Informatics Graduate',
];

const HeroSection: React.FC = () => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  // 3D tilt for the photo card
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(() => supportsWebGL());

  useEffect(() => {
    const currentTitle = titles[titleIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayText(currentTitle.substring(0, displayText.length + 1));
        if (displayText === currentTitle) {
          setTimeout(() => setIsDeleting(true), 2000);
          setTypingSpeed(50);
        }
      } else {
        setDisplayText(currentTitle.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % titles.length);
          setTypingSpeed(100);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, titleIndex, typingSpeed]);

  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tiltTo = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    setRotate({ x: (-y / (rect.height / 2)) * 8, y: (x / (rect.width / 2)) * 8 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => tiltTo(e.clientX, e.clientY);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) tiltTo(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Calm ambient glows */}
      <div className="absolute top-1/4 left-[10%] w-[520px] h-[520px] bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-[8%] w-[480px] h-[480px] bg-indigo-500/[0.08] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Very faint Scanner texture (React Bits) */}
      {webgl && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, #000 70%, transparent 100%)',
          }}
        >
          <Scanner
            color1="#0e90b0"
            color2="#a78bfa"
            color3="#ffffff"
            speed={0.5}
            sweepSpeed={0.24}
            sweepWidth={1.6}
            trail={0.6}
            ripple={0.22}
            bandDensity={18}
            lineWidth={1.4}
            glow={0.8}
            brightness={1.25}
            scanDirection="diagonal"
            colorSpread={0.7}
            vignette={0.3}
            opacity={0.8}
            scanline
            scanlineIntensity={0.35}
            mouseInteraction
            clickEffect="ping"
          />
        </div>
      )}

      {/* Soft veil so the paragraph stays readable over the scanner lines */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-r from-[#07090e]/80 via-[#07090e]/40 to-transparent lg:via-[#07090e]/25" aria-hidden="true"></div>

      <div className="container mx-auto px-4 sm:px-6 xl:px-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-8 items-center">

          {/* Left: text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-7">

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Available for Opportunities</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem] font-black text-white tracking-tight leading-[1.02]">
              FADIL <br className="hidden sm:block" />
              <span className="gradient-text-cyan">RAFLIANSYAH</span>
            </h1>

            <div className="flex items-center gap-3 text-lg sm:text-2xl font-semibold text-slate-200 h-9">
              <span className="w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent"></span>
              <span>{displayText}</span>
              <span className="w-0.5 h-6 bg-cyan-400 animate-pulse"></span>
            </div>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl font-normal text-justify">
              Lulusan S1 Informatika <strong className="text-white font-semibold">Telkom University (IPK 3.66/4.00)</strong> yang kini berkarya di <strong className="text-white font-semibold">IT & Digital Operations BNI</strong>. Berfokus pada <strong className="text-cyan-300 font-semibold">Web Development</strong>, <strong className="text-cyan-300 font-semibold">Machine Learning</strong>, dan <strong className="text-cyan-300 font-semibold">Data Science</strong>, dengan pengalaman membangun dashboard <strong className="text-white font-semibold">React & Oracle</strong> lengkap dengan chatbot AI dan visualisasi 3D. Sebelumnya di <strong className="text-white font-semibold">InJourney Airports</strong> & <strong className="text-white font-semibold">GDSC</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400/80" /> Jakarta, Indonesia
              </span>
              <span className="inline-flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400/80" /> Telkom University
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#contact"
                onClick={scrollToContact}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.03] transition-all duration-300"
              >
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <span>Hubungi Saya</span>
              </a>

              <a
                href="/resume.pdf"
                download="CV Fadil Rafliansyah.pdf"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 text-white font-semibold text-sm sm:text-base transition-all duration-300"
              >
                <Download className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                <span>Download CV</span>
              </a>

              <a
                href="https://github.com/fadilrafliansyah"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all"
                aria-label="GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/in/fadilrafliansyah"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right: photo with soft 3D tilt */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchStart={handleMouseEnter}
              onTouchEnd={handleMouseLeave}
              className="relative w-full max-w-md sm:max-w-lg lg:max-w-none"
              style={{
                transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
                transformStyle: 'preserve-3d',
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              {/* Soft glow behind the frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl pointer-events-none"></div>

              {/* Top floating badge */}
              <div
                className="absolute -top-5 right-4 z-30 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0e1626]/95 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Dashboard & AI Chatbot</div>
                  <div className="text-[10px] text-slate-400">Insight, Chart & 3D Visualization</div>
                </div>
              </div>

              {/* Frame styled to match the About photo. Backdrop glow is always on; edge ring + shine light up on hover/touch */}
              <div
                className={`relative rounded-3xl shadow-[0_0_70px_rgba(34,211,238,0.3)] ${isHovered ? 'border-flow' : ''}`}
              >
              <div className="p-3 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="h-[396px] sm:h-[456px] rounded-2xl overflow-hidden relative bg-[#cacaca]">
                  {/* Wrapper carries the hover zoom; the photo inside is nudged up and slightly enlarged to trim the headroom */}
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    <img
                      src="/fadil-photo.png"
                      alt="Fadil Rafliansyah"
                      className="block h-full w-auto max-w-full mx-auto object-contain object-top"
                      style={{
                        transform: 'translateY(-8%) scale(1.12)',
                        transformOrigin: 'top center',
                        // Side edges feather into the photo's matching grey backdrop
                        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
                        maskImage: 'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/profile.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                  {/* Code snippet box */}
                  <div
                    className="absolute bottom-3 left-3 right-3 bg-[#0a0f1d]/90 backdrop-blur-md rounded-xl border border-slate-700/70 p-3.5 shadow-2xl font-mono text-[11px] sm:text-xs z-20"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-cyan-400" /> engineer_profile.py
                      </span>
                    </div>
                    <div className="space-y-1 text-slate-300">
                      <div>
                        <span className="text-purple-400">name</span>: <span className="text-emerald-400">"Fadil Rafliansyah"</span>
                      </div>
                      <div>
                        <span className="text-purple-400">degree</span>: <span className="text-emerald-400">"S1 Informatika Telkom University"</span>
                      </div>
                      <div>
                        <span className="text-purple-400">skills</span>: [<span className="text-cyan-300">"React"</span>, <span className="text-cyan-300">"FastAPI"</span>, <span className="text-cyan-300">"Python"</span>, <span className="text-cyan-300">"ML"</span>]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shine sweep across the frame */}
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-1/2 w-1/2 pointer-events-none z-30 -skew-x-12 bg-gradient-to-r from-transparent via-cyan-200/45 to-transparent -translate-x-full group-hover:translate-x-[320%] transition-transform duration-[1100ms] ease-out"
                />
              </div>
              </div>

              {/* Single quiet badge */}
              <div
                className="absolute -bottom-8 -left-4 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0b1220]/90 border border-white/10 shadow-xl backdrop-blur-md"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white tracking-tight leading-none">
                    3.66 <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
                  </div>
                  <div className="text-[11px] text-cyan-300/90 font-medium">GPA (Cum Laude)</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
