import React from 'react';
import type { Experience } from '../types';
import { Briefcase, Calendar, MapPin, Building, GraduationCap, Users, Award } from 'lucide-react';

const experienceData: Experience[] = [
  {
    title: 'Airport Application Strategy Intern',
    company: 'InJourney Airports (PT Angkasa Pura Indonesia)',
    type: 'Magang Industri / Internship',
    period: 'Agu 2025 – Sep 2025',
    location: 'Tangerang, Banten · On-site',
    logoUrl: '/logo-injourney.png',
    highlights: [
      'Mendukung pengelolaan sistem TI dan solusi digital operasional bandara untuk optimalisasi alur kerja perusahaan.',
      'Mengembangkan SPACIO, platform digital reservasi ruang rapat pintar yang mengefisiensikan alur booking internal.',
      'Membantu otomatisasi proses bisnis dan analisis data sistem digitalisasi internal korporat.',
      'Berkolaborasi pada integrasi infrastruktur TI dan tools digital pendukung transformasi digital bandara.',
    ],
    skills: ['Spacio System', 'Data Analysis', 'Web Development', 'Process Automation', 'FastAPI'],
  },
  {
    title: 'Operating System Practicum Assistant',
    company: 'Laboratorium Informatika Telkom University',
    type: 'Akademik / Asisten Laboratorium',
    period: 'Sep 2024 – Jul 2025',
    location: 'Bandung, Jawa Barat · On-site',
    logoUrl: '/logo-informatics-lab.png',
    highlights: [
      'Membimbing mahasiswa dalam pemahaman konsep Sistem Operasi dan lingkungan berbasis Linux.',
      'Memandu sesi praktikum, mendampingi pemecahan masalah teknis (troubleshooting), dan penilaian praktikum.',
      'Mengasah kemampuan mentoring teknis, kepemimpinan laboratorium, dan komunikasi efektif.',
    ],
    skills: ['Linux', 'Operating Systems', 'Shell Scripting', 'Mentoring'],
  },
  {
    title: 'Dewan Urusan Rumah Tangga',
    company: 'BPM HIMAIF Telkom University',
    type: 'Organisasi Mahasiswa',
    period: 'Jan 2024 – Mei 2025',
    location: 'Bandung · On-site',
    logoUrl: '/logo-bpm-if.png',
    highlights: [
      'Mengelola proses rekrutmen panitia pemilihan umum himpunan (BPM Oprec PPUH).',
      'Mengkoordinasikan logistik dan pengadaan sarana tempat untuk program kerja BPM Sehat.',
      'Berkolaborasi lintas divisi untuk mendukung efisiensi operasional organisasi.',
    ],
    skills: ['Leadership', 'Event Management', 'Operational Logistics', 'Teamwork'],
  },
  {
    title: 'Member / Core Developer',
    company: 'GDSC Telkom University Bandung',
    type: 'Komunitas / Developer Club',
    period: 'Des 2023 – Mei 2024',
    location: 'Bandung · On-site',
    logoUrl: '/logo-gdsc.png',
    highlights: [
      'Merancang skema database relasional MySQL untuk data reservasi dan profil pengguna.',
      'Membangun RESTful API dengan FastAPI dan PHP untuk autentikasi dan logika pemesanan.',
      'Mengembangkan fungsi utama Spacio untuk otomatisasi alur kerja dan ketersediaan waktu nyata (real-time).',
    ],
    skills: ['FastAPI', 'MySQL', 'PHP', 'Machine Learning', 'Computer Vision'],
  },
];

const ExperienceSection: React.FC = () => {
  return (
    <section id="experience" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            CAREER & ORGANIZATIONAL PATH
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Pengalaman <span className="gradient-text-cyan">Kerja & Organisasi</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Timeline List */}
        <div className="max-w-4xl mx-auto relative before:absolute before:left-4 sm:before:left-1/2 before:-translate-x-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/80 before:via-blue-500/40 before:to-transparent">
          {experienceData.map((exp, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className="relative flex flex-col sm:flex-row items-start mb-12 group"
              >
                {/* Timeline Center Dot Indicator */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 z-20 w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:border-cyan-300 transition-all">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                </div>

                {/* Content Card Container */}
                <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${isEven ? 'sm:pr-10 sm:text-right' : 'sm:pl-10 sm:ml-auto'}`}>
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-md shadow-xl transition-all duration-300 group-hover:translate-y-[-2px]">
                    
                    {/* Header info */}
                    <div className={`flex items-center gap-3 mb-3 ${isEven ? 'sm:justify-end' : 'justify-start'}`}>
                      {exp.logoUrl && (
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 p-1 flex items-center justify-center shrink-0">
                          <img src={exp.logoUrl} alt={exp.company} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {exp.title}
                        </h3>
                        <div className="text-xs font-semibold text-cyan-400">{exp.company}</div>
                      </div>
                    </div>

                    {/* Metadata line */}
                    <div className={`flex flex-wrap gap-2 text-xs text-slate-400 mb-4 ${isEven ? 'sm:justify-end' : 'justify-start'}`}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                        <Calendar className="w-3 h-3 text-cyan-400" /> {exp.period}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                        <MapPin className="w-3 h-3 text-cyan-400" /> {exp.location}
                      </span>
                    </div>

                    {/* Highlights bullet list */}
                    <ul className="space-y-2 mb-4 text-xs sm:text-sm text-slate-300 text-left">
                      {exp.highlights.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold shrink-0">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Skills pills */}
                    <div className={`flex flex-wrap gap-1.5 ${isEven ? 'sm:justify-end' : 'justify-start'}`}>
                      {exp.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ExperienceSection;
