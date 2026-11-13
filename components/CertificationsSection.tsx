import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import TiltCard from './TiltCard';
import type { Certification } from '../types';
import { Award, Eye, X, CheckCircle2 } from 'lucide-react';

const certificationsData: Certification[] = [
  {
    title: 'AI for Work & Career Readiness with Google AI Products',
    issuer: 'Hacktiv8 Indonesia',
    date: 'Mei 2026',
    credentialId: '04484/H8/CSR/MBA2/V/2026',
    skills: ['Artificial Intelligence', 'Google AI'],
    credentialUrl: '/certificates/hacktiv8-ai-for-work.pdf',
  },
  {
    title: 'AI Engineering',
    issuer: 'Digital Talent Scholarship (DTS Kominfo)',
    date: 'Mei 2026',
    credentialId: '22910029850-20496',
    skills: ['Artificial Intelligence', 'Machine Learning'],
    credentialUrl: '/certificates/dts-ai-engineering.pdf',
  },
  {
    title: 'Build an AI Agent',
    issuer: 'IBM',
    date: 'Mei 2026',
    skills: ['AI Agent', 'Python Programming'],
    credentialUrl: '/certificates/ibm-build-ai-agent.pdf',
  },
  {
    title: 'Web Development Fundamentals',
    issuer: 'IBM',
    date: 'Mei 2026',
    skills: ['Web Development', 'HTML/CSS/JS'],
    credentialUrl: '/certificates/ibm-web-development.pdf',
  },
  {
    title: 'AI Fundamentals (AI-900)',
    issuer: 'Microsoft Certified',
    date: 'Mei 2025',
    credentialId: 'cbf3f9d3',
    skills: ['Azure AI', 'Artificial Intelligence'],
    credentialUrl: '/certificates/microsoft-ai-fundamentals.pdf',
  },
  {
    title: 'DigiHack 2025: AI for Good',
    issuer: 'Digistar Club by Telkom Indonesia',
    date: 'Agu 2025',
    credentialId: '1447/CC-TELU/DigiClub/X/2025',
    skills: ['Artificial Intelligence', 'Hackathon'],
    credentialUrl: '/certificates/digihack-2025.pdf',
  },
];

const CertCard: React.FC<{ cert: Certification; index: number; onOpen: (c: Certification) => void }> = ({ cert, index, onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'pre' | 'in' | 'done'>('pre');

  // Inner content staggers in once the card is on screen, then the class is dropped
  // so hover animations never replay the entrance.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || navigator.webdriver) {
      setPhase('done');
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setPhase('in');
        timer = window.setTimeout(() => setPhase('done'), 1600);
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const idx = (n: number) => ({ '--i': n } as React.CSSProperties);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`cert-card h-full p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-md shadow-xl flex flex-col justify-between group ${
        phase === 'pre' ? 'cert-pre' : phase === 'in' ? 'cert-in' : ''
      }`}
    >
      <span className="cert-shine" aria-hidden="true" />

      <div>
        <div className="flex items-start gap-4 mb-4">
          <div
            className="cert-medal p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0"
            style={idx(0)}
          >
            <Award className="w-5 h-5" />
          </div>
          <div className="cert-text min-w-0">
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug" style={idx(1)}>
              {cert.title}
            </h3>
            <div className="text-xs font-semibold text-cyan-400 mt-1" style={idx(2)}>{cert.issuer}</div>
            <div className="text-[11px] text-slate-400 mt-0.5" style={idx(3)}>Diterbitkan: {cert.date}</div>
            {cert.credentialId && (
              <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate" style={idx(4)}>
                ID: {cert.credentialId}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {cert.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="cert-chip px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/20 text-purple-300 text-[11px]"
              style={idx(5 + sIdx)}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {cert.credentialUrl && (
        <button
          type="button"
          onClick={() => onOpen(cert)}
          className="cert-btn w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-semibold transition-colors"
          style={idx(8)}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Dokumen Sertifikat</span>
        </button>
      )}
    </div>
  );
};

const CertificationsSection: React.FC = () => {
  const [activeCertificate, setActiveCertificate] = useState<Certification | null>(null);

  useEffect(() => {
    if (!activeCertificate) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCertificate(null);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [activeCertificate]);

  return (
    <section id="certifications" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            VERIFIED CREDENTIALS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Lisensi & <span className="gradient-text-cyan">Sertifikasi</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Sertifikasi profesional resmi dari IBM, Microsoft, Google, Kominfo, dan Telkom Indonesia.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificationsData.map((cert, idx) => (
            <TiltCard key={idx} max={7}>
              <CertCard cert={cert} index={idx} onOpen={setActiveCertificate} />
            </TiltCard>
          ))}
        </div>

      </div>

      {/* Lightbox PDF / Document Modal */}
      {activeCertificate?.credentialUrl && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in-up"
          onClick={() => setActiveCertificate(null)}
        >
          <div
            className="relative w-full max-w-4xl h-[85vh] bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white">{activeCertificate.title}</h3>
                <p className="text-xs text-cyan-400">{activeCertificate.issuer}</p>
              </div>
              <button
                onClick={() => setActiveCertificate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Tutup sertifikat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <iframe
              src={activeCertificate.credentialUrl}
              title={activeCertificate.title}
              className="w-full h-[calc(85vh-3.5rem)] bg-white"
            />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default CertificationsSection;
