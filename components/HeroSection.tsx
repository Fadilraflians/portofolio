import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { supportsWebGL } from './three/inputState';
import Scanner from './Scanner';

const HeroCore3D = lazy(() => import('./three/HeroCore3D'));
import { Send, Download, Github, Linkedin, MapPin, GraduationCap, Sparkles, Terminal, Award } from 'lucide-react';

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

  // 3D Tilt State
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

  // Interactive 3D Tilt Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    const rotateX = (-mouseY / (height / 2)) * 14; // max 14deg tilt X
    const rotateY = (mouseX / (width / 2)) * 14;  // max 14deg tilt Y

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const touchX = touch.clientX - rect.left - width / 2;
    const touchY = touch.clientY - rect.top - height / 2;

    const rotateX = (-touchY / (height / 2)) * 14;
    const rotateY = (touchX / (width / 2)) * 14;

    setRotate({ x: rotateX, y: rotateY });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Background Radial Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* React Bits Scanner: WebGL scanning-line field behind the hero */}
      {webgl && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, #000 55%, transparent 100%)',
          }}
        >
          <Scanner
            color1="#0891b2"
            color2="#a78bfa"
            color3="#ffffff"
            speed={0.5}
            sweepSpeed={0.22}
            sweepWidth={1.6}
            trail={0.55}
            ripple={0.22}
            bandDensity={11}
            glow={0.6}
            scanDirection="diagonal"
            colorSpread={0.7}
            vignette={0.55}
            opacity={0.65}
            scanline
            scanlineIntensity={0.5}
            mouseInteraction
            clickEffect="ping"
          />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 xl:px-12 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & Information */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm shadow-cyan-500/10 backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
              </span>
              <span>Available for Opportunities</span>
            </div>

            {/* Main Name Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.1]">
                <span className="text-3d">FADIL</span> <br className="hidden sm:block" />
                <span className="gradient-text-cyan text-3d-glow">RAFLIANSYAH</span>
              </h1>
            </div>

            {/* Dynamic Role Subtitle */}
            <div className="flex items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-slate-200 h-10">
              <span>{displayText}</span>
              <span className="w-0.5 h-7 bg-cyan-400 animate-pulse"></span>
            </div>

            {/* Profile Bio Summary Paragraph */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Fresh Graduate S1 Informatika <strong className="text-white font-semibold">Telkom University (IPK 3.66/4.00)</strong> yang memiliki passion mendalam di bidang <strong className="text-cyan-300 font-semibold">Web Development</strong>, <strong className="text-cyan-300 font-semibold">Machine Learning</strong>, dan <strong className="text-cyan-300 font-semibold">Data Science</strong>. Berpengalaman di <strong className="text-white font-semibold">InJourney Airports</strong> & <strong className="text-white font-semibold">GDSC</strong> dalam merancang arsitektur sistem digital dan solusi AI berbasis data.
            </p>

            {/* Meta Location & Education Info */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Telkom University (3.66/4.00)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#contact"
                onClick={scrollToContact}
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] transition-all duration-300"
              >
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <span>Hubungi Saya</span>
              </a>

              <a
                href="/resume.pdf"
                download="CV Fadil Rafliansyah.pdf"
                className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-white font-semibold text-sm sm:text-base shadow-md transition-all duration-300"
              >
                <Download className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                <span>Download CV</span>
              </a>

              <div className="flex items-center gap-2 pl-2">
                <a
                  href="https://github.com/fadilrafliansyah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all shadow-md"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://linkedin.com/in/fadilrafliansyah"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-all shadow-md"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive 3D Perspective Photo Frame */}
          <div className="lg:col-span-5 flex justify-center relative perspective-1000">
            {/* WebGL AI Core orbiting behind the photo card */}
            {webgl && (
              <div className="absolute -inset-16 sm:-inset-24 lg:-inset-32 z-0 pointer-events-none" aria-hidden="true">
                <Suspense fallback={null}>
                  <HeroCore3D />
                </Suspense>
              </div>
            )}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchStart={handleMouseEnter}
              onTouchEnd={handleMouseLeave}
              className="relative z-10 w-full max-w-md sm:max-w-lg lg:max-w-none cursor-pointer transition-transform ease-out"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              
              {/* Top Floating Badge */}
              <div
                className="absolute -top-5 right-4 z-30 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#0e1626]/95 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md transition-all duration-300"
                style={{
                  transform: 'translateZ(40px)',
                }}
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold">Spacio & AI System</div>
                  <div className="text-[10px] text-slate-400">Smart Meeting & Analytics</div>
                </div>
              </div>

              {/* Main Futuristic Card Container with Glowing Cyan Border */}
              <div
                className="relative rounded-[2rem] p-2 bg-slate-950/70 border-2 border-cyan-500/60 shadow-[0_0_80px_rgba(6,182,212,0.4)] backdrop-blur-sm overflow-hidden"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Photo Frame Container with Adjusted Alignment to Prevent Top Clipping */}
                <div className="relative h-[420px] sm:h-[480px] w-full rounded-[1.6rem] overflow-hidden bg-[#cacaca]">
                  <img
                    src="/fadil-photo.png"
                    alt="Fadil Rafliansyah"
                    className="w-full h-full object-contain object-top filter brightness-[0.98] transition-transform duration-500"
                    style={{
                      // Whole upper body fits; side edges feather into the photo's matching grey backdrop
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
                      maskImage: 'linear-gradient(to right, transparent 0%, #000 11%, #000 89%, transparent 100%)',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/profile.jpg';
                    }}
                  />
                  {/* Bottom Gradient Fade */}
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#090d16]/85 to-transparent"></div>
                </div>

                {/* Code Snippet Box Overlay at Bottom of Card */}
                <div
                  className="absolute bottom-3 left-3 right-3 bg-[#0a0f1d]/90 backdrop-blur-md rounded-xl border border-slate-700/70 p-3 shadow-2xl font-mono text-[11px] sm:text-xs z-20"
                  style={{
                    transform: 'translateZ(30px)',
                  }}
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

              {/* Bottom Left GPA Badge with 3D Offset */}
              <div
                className="absolute -bottom-4 -left-4 z-30 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0d1424]/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md"
                style={{
                  transform: 'translateZ(50px)',
                }}
              >
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-white tracking-tight leading-none">
                    3.66 <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 font-medium">GPA (Cum Laude)</div>
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