import React from 'react';
import TiltCard from './TiltCard';
import HalftoneReveal from './HalftoneReveal';
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
import { User, Code, Award, Building2, MousePointerClick } from 'lucide-react';

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

const AboutSection: React.FC = () => {
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
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md space-y-4">
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
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-md flex items-start gap-4 group"
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

          {/* Right Column — Halftone reveal: Fadil first, Iron Man under the cursor */}
          <div className="lg:col-span-5 order-first lg:order-none flex flex-col items-center">
            <Float3D
              className="w-full max-w-[300px] sm:max-w-[340px] aspect-[868/1550]"
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
                  {/* thin energy halo behind the torso */}
                  <div
                    className="absolute left-1/2 top-[16%] w-[78%] aspect-square -translate-x-1/2 rounded-full border border-cyan-300/15"
                    style={{ boxShadow: '0 0 40px rgba(34,211,238,0.12), inset 0 0 40px rgba(34,211,238,0.08)' }}
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
              <div
                className="relative w-full h-full cursor-crosshair"
                role="img"
                aria-label="Fadil Rafliansyah — arahkan kursor untuk melihat armor Iron Man"
              >
                <HalftoneReveal
                  src="/fadil-flight.webp"
                  revealSrc="/ironman-suit.webp"
                  fit="contain"
                  cellSize={5}
                  angle={45}
                  revealRadius={120}
                  softness={0.9}
                  linger={1.8}
                  smoothing={0.06}
                  clickBurst
                  intro
                  style={{ touchAction: 'pan-y' }}
                />
              </div>
            </Float3D>

            <div className="mt-2 text-center space-y-1">
              <div className="font-bold text-white text-lg">Fadil Rafliansyah, S.Kom</div>
              <div className="text-xs text-cyan-400">S1 Informatika Telkom University</div>
              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-mono uppercase tracking-widest text-slate-500">
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>Hover / klik untuk suit up</span>
              </div>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {stats.map((stat, idx) => (
            <TiltCard key={idx} max={14}>
            <div
              className="h-full p-6 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-center hover:border-cyan-500/40 transition-all duration-300 group shadow-lg"
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