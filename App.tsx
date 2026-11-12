import React from 'react';
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

const App: React.FC = () => {
  return (
    <div id="portfolio-root" className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative">
      {/* WebGL 3D background (falls back to 2D constellation), cursor glow, scroll progress */}
      <EffectsLayer />
      <ScrollReveal3D />

      {/* Floating Pill Navigation Header */}
      <Header />

      {/* Main Content Flow */}
      <main className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <SkillsSection />
        <PublicationsSection />
        <CertificationsSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;