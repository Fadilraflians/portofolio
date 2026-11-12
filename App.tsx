import React, { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import ProjectsSection from './components/ProjectsSection';
import SkillsSection from './components/SkillsSection';
import PublicationsSection from './components/PublicationsSection';
import CertificationsSection from './components/CertificationsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import EffectsLayer from './components/EffectsLayer';
import ScrollReveal3D from './components/ScrollReveal3D';
import Galaxy from './components/Galaxy';
import { supportsWebGL, isMobileViewport } from './components/three/inputState';

const App: React.FC = () => {
  const [galaxy] = useState(() => supportsWebGL());
  const [mobile] = useState(() => isMobileViewport());

  return (
    <div id="portfolio-root" className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative">
      {/* Cursor glow and scroll progress */}
      <EffectsLayer />
      <ScrollReveal3D />

      {/* Floating Pill Navigation Header */}
      <Header />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <HeroSection />

        {/* Galaxy backdrop from About through Contact: a viewport-sized sticky layer that
            stays pinned while this block scrolls, so the shader only paints one screen.
            (No `relative` here on purpose: Header measures sections via offsetTop relative to <main>.) */}
        <div>
          {galaxy && (
            <div className="sticky top-0 h-screen w-full -mb-[100vh] z-0 pointer-events-none" aria-hidden="true">
              <Galaxy
                starColors={['#ffffff', '#67e8f9', '#a78bfa', '#818cf8']}
                density={mobile ? 0.7 : 1}
                layers={mobile ? 3 : 4}
                glowIntensity={0.35}
                twinkleIntensity={0.4}
                starSpeed={0.35}
                rotationSpeed={0.05}
                mouseRepulsion
                repulsionStrength={2}
                clickWarp={false}
                dpr={1.5}
              />
            </div>
          )}
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
          <SkillsSection />
          <PublicationsSection />
          <CertificationsSection />
          <ContactSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;