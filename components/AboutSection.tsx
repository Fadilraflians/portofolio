import React, { useState } from 'react';
import TiltCard from './TiltCard';
import SuitUp from './SuitUp';
import Float3D from './Float3D';

// floating sparks in front of the figure (pulled forward in depth by Float3D)
const SPARKS = [
  { x: '8%', y: '18%', size: 3, color: '#67e8f9', dur: 3.2, delay: 0 },
  { x: '88%', y: '12%', size: 2, color: '#ffffff', dur: 4.1, delay: 1.1 },
  { x: '93%', y: '38%', size: 4, color: '#a78bfa', dur: 3.7, delay: 0.6 },
  { x: '3%', y: '47%', size: 2, color: '#ffffff', dur: 4.6, delay: 2.0 },
  { x: '14%', y: '72%', size: 3, color: '#67e8f9', dur: 3.4, delay: 1.5 },
  { x: '84%', y: '66%', size: 3, color: '#67e8f9', dur: 3.9, delay: 0.3 },
  { x: '72%', y: '86%', size: 2, color: '#ffffff', dur: 4.3, delay: 2.4 },
  { x: '26%', y: '90%', size: 2, color: '#a78bfa', dur: 3.6, delay: 0.9 },
];
import { User, Code, Award, Building2 } from 'lucide-react';

const stats = [
  { value: '3.66', label: 'IPK / GPA (Cum Laude)', sub: 'Telkom University', color: 'text-cyan-400' },
  { value: '2', label: 'Publikasi Ilmiah', sub: 'IEEE GenCity & JIKSTIK', color: 'text-blue-400' },
  { value: '6+', label: 'Sertifikasi IT & AI', sub: 'Alibaba, Google, Hacktiv8', color: 'text-purple-400' },
  { value: '2025', label: 'Airport Application Intern', sub: 'InJourney Airports', color: 'text-emerald-400' },
];

const highlights = [
  {
    icon: Building2,
    title: 'Pengalaman Industri & Inovasi',
    desc: 'Mengembangkan Spacio — sistem reservasi ruang rapat pintar — saat magang di PT Angkasa Pura Indonesia (InJourney Airports) serta mendukung integrasi TI bandara.',
  },
  {
    icon: Code,
    title: 'Pengembangan Perangkat Lunak & API',
    desc: 'Berpengalaman membangun RESTful API dengan FastAPI dan PHP di GDSC, serta menjadi Asisten Praktikum Sistem Operasi di Universitas Telkom.',
  },
  {
    icon: Award,
    title: 'Prestasi Akademik & Organisasi',
    desc: 'Lulus predikat Cum Laude dengan IPK 3.66. Aktif sebagai pimpinan organisasi di Badan Perwakilan Mahasiswa (BPM HIMAIF) Telkom University.',
  },
];

// The full suit-up (reactor button, automatic transformation, thrusters) is not released yet:
// for now only the touch / hover reveal on the photo is on.
const SUIT_UP_ENABLED: boolean = false;

const AboutSection: React.FC = () => {
  const [suited, setSuited] = useState(false);
  const toggleSuit = () => setSuited(v => !v);

  return (
    <section id="about" className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            GET TO KNOW ME
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Tentang <span className="gradient-text-cyan">Saya</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Column — Bio & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-950/85 border border-slate-800/80 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Ringkasan Profil</span>
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Saya adalah lulusan S1 Informatika Telkom University Bandung dengan orientasi pada hasil dan ketepatan solusi. Berpengalaman dalam pengembangan aplikasi web modern, pemrosesan data AI/Machine Learning, serta penyusunan arsitektur sistem backend. Memiliki adaptabilitas yang tinggi, wawasan analitis yang kuat, dan dedikasi dalam menghadirkan teknologi yang bernilai guna.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-950/85 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex items-start gap-4 group"
                  >
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column — touching the photo reveals the Iron Man armour */}
          <div className="lg:col-span-5 order-first lg:order-none flex flex-col items-center">
            <Float3D
              className="w-full max-w-[360px] sm:max-w-[440px] aspect-[944/1340]"
              max={12}
              back={
                <>
                  {/* ambient glow, pushed back in depth so it parallaxes against the figure */}
                  <div
                    className="absolute inset-x-[-25%] top-[2%] bottom-[18%]"
                    style={{
                      background:
                        'radial-gradient(closest-side, rgba(34,211,238,0.2), rgba(59,130,246,0.1) 55%, transparent 100%)',
                      opacity: 'calc(0.85 + var(--lift, 0) * 0.15)',
                    }}
                  />
                </>
              }
              front={
                <>
                  {SPARKS.map((s, i) => (
                    <span
                      key={i}
                      className="absolute rounded-full animate-pulse-glow"
                      style={{
                        left: s.x,
                        top: s.y,
                        width: s.size,
                        height: s.size,
                        background: s.color,
                        boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
                        animationDuration: `${s.dur}s`,
                        animationDelay: `${s.delay}s`,
                      }}
                    />
                  ))}
                </>
              }
            >
              {/* hover / tap: nanotech reveal of the armour under the pointer */}
              <div
                className="relative w-full h-full"
                role="img"
                aria-label="Foto Fadil Rafliansyah, sentuh untuk melihat armor Iron Man"
              >
                <SuitUp
                  src="/fadil-hero.webp"
                  armorSrc="/ironman-hero.webp"
                  suited={suited}
                  onFirstView={SUIT_UP_ENABLED ? () => setSuited(true) : undefined}
                />
              </div>
            </Float3D>

            <div className="relative z-10 mt-5 flex flex-col items-center text-center space-y-1">
              {SUIT_UP_ENABLED && (
                <>
                  <button
                    type="button"
                    onClick={toggleSuit}
                    aria-label={suited ? 'Lepas armor Iron Man' : 'Pakai armor Iron Man'}
                    className="w-16 h-16 rounded-full border-2 border-amber-400 text-amber-50 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    style={{
                      background: 'radial-gradient(circle at 50% 35%, #c2323f, #7f1420 60%, #4a0a12)',
                      boxShadow: '0 0 22px rgba(251,191,36,0.45), inset 0 0 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* arc reactor */}
                    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="currentColor" aria-hidden="true">
                      <circle cx="24" cy="24" r="20" strokeWidth="2" />
                      <circle cx="24" cy="24" r="15" strokeWidth="5" strokeDasharray="6.4 3.02" />
                      <circle cx="24" cy="24" r="10" strokeWidth="1.5" />
                      <path d="M24 18.5 29.5 28h-11Z" fill="currentColor" strokeWidth="1" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="pt-1 pb-2 text-[11px] font-mono uppercase tracking-widest text-slate-400">
                    {suited ? 'Lepas armor' : 'Pakai armor'}
                  </div>
                </>
              )}
              <div className="font-bold text-white text-lg">Fadil Rafliansyah, S.Kom</div>
              <div className="text-xs text-cyan-400">S1 Informatika Telkom University</div>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <TiltCard key={idx} max={14}>
            <div
              className="h-full p-6 rounded-2xl bg-slate-950/85 border border-slate-800/80 text-center hover:border-cyan-500/40 transition-all duration-300 group shadow-lg"
            >
              <div className={`text-3xl sm:text-4xl font-black mb-1 ${stat.color} group-hover:scale-105 transition-transform`}>
                {stat.value}
              </div>
              <div className="text-sm font-bold text-white">{stat.label}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.sub}</div>
            </div>
            </TiltCard>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutSection;