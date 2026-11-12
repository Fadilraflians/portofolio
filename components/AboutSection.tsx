import React from 'react';
import TiltCard from './TiltCard';
import { User, Code, Award, BookOpen, Building2, ChevronRight } from 'lucide-react';

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
          
          {/* Left Column Photo & Highlights */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10"></div>
              
              <TiltCard max={12} rounded="rounded-3xl">
              <div className="p-3 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="h-[400px] rounded-2xl overflow-hidden relative">
                  <img
                    src="/fadil-photo.png"
                    alt="Fadil Rafliansyah"
                    className="w-full h-full object-cover object-[center_top] group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/profile.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800">
                    <div className="font-bold text-white text-base">Fadil Rafliansyah, S.Kom</div>
                    <div className="text-xs text-cyan-400">S1 Informatika Telkom University</div>
                  </div>
                </div>
              </div>
              </TiltCard>
            </div>
          </div>

          {/* Right Column Bio & Cards */}
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