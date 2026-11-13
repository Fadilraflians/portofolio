import React, { useEffect, useRef } from 'react';
import type { Experience } from '../types';
import { useCardFx, stagger } from './useCardFx';
import { Briefcase, Calendar, MapPin, GraduationCap, Users, Code2, Landmark } from 'lucide-react';

const experienceData: Experience[] = [
  {
    title: 'IT & Digital Operations',
    company: 'PT. Bank Negara Indonesia (Persero) Tbk.',
    type: 'Pekerjaan / On-site',
    period: 'Sep 2026 – Sekarang',
    location: 'Jakarta, Indonesia · On-site',
    logoUrl: '/logo-bni.png',
    highlights: [
      'Membangun custom dashboard dengan chatbot AI yang dapat ditanya untuk menggali insight dari data.',
      'Chatbot dapat membuatkan card dan chart secara langsung: pie, line, bar, scatter, area, dan donut chart.',
      'Mengembangkan frontend dashboard menggunakan React dengan database Oracle.',
      'Merancang ikon chatbot AI dalam bentuk 3D untuk tampilan dashboard yang lebih interaktif.',
      'Membuat tampilan peta 3D untuk BOK Puskesmas dan tampilan 3D kantor untuk PMO Tools.',
    ],
    skills: ['React', 'Oracle Database', 'AI Chatbot', 'Data Visualization', '3D Visualization', 'Government Technology'],
  },
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

/** Accent colour (r,g,b) + icon per kind of experience */
const kindOf = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('magang')) return { rgb: '59,130,246', Icon: Landmark, label: 'Magang' };
  if (t.includes('akademik')) return { rgb: '168,85,247', Icon: GraduationCap, label: 'Akademik' };
  if (t.includes('organisasi')) return { rgb: '245,158,11', Icon: Users, label: 'Organisasi' };
  if (t.includes('komunitas')) return { rgb: '16,185,129', Icon: Code2, label: 'Komunitas' };
  return { rgb: '34,211,238', Icon: Briefcase, label: 'Pekerjaan' };
};

const XpItem: React.FC<{ exp: Experience; index: number }> = ({ exp, index }) => {
  const { ref, onPointerMove, phaseClass } = useCardFx();
  const isEven = index % 2 === 0;
  const kind = kindOf(exp.type);
  const current = /sekarang|present/i.test(exp.period);
  const accent = { '--ac': kind.rgb } as React.CSSProperties;

  return (
    <div className="xp-row relative flex flex-col sm:flex-row items-start mb-12 last:mb-0 group" style={accent}>
      {/* Timeline node */}
      <div className="xp-node absolute left-4 sm:left-1/2 -translate-x-1/2 top-5 z-20" data-node>
        {current && <span className="xp-ping" aria-hidden="true" />}
        <div className="xp-node-core relative w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {exp.logoUrl ? (
            <img src={exp.logoUrl} alt="" className="w-7 h-7 object-contain" />
          ) : (
            <kind.Icon className="w-4 h-4" style={{ color: `rgb(${kind.rgb})` }} />
          )}
        </div>
      </div>

      {/* Connector arm to card (desktop) */}
      <span
        className={`xp-arm hidden sm:block absolute top-[2.35rem] h-px w-8 ${isEven ? 'right-1/2 mr-5' : 'left-1/2 ml-5'}`}
        aria-hidden="true"
      />

      <div className={`w-full sm:w-1/2 pl-14 sm:pl-0 ${isEven ? 'sm:pr-14' : 'sm:pl-14 sm:ml-auto'}`}>
        <div
          ref={ref}
          onPointerMove={onPointerMove}
          className={`cert-card xp-card p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md shadow-xl ${phaseClass}`}
        >
          <span className="cert-shine" aria-hidden="true" />
          <span className="xp-bar" aria-hidden="true" />

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4" style={stagger(0)}>
            <span className="xp-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider">
              <kind.Icon className="w-3 h-3" />
              {kind.label}
            </span>
            {current && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                <span className="status-dot" /> Sedang berjalan
              </span>
            )}
          </div>

          <div className="cert-text">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug transition-colors group-hover:text-cyan-300" style={stagger(1)}>
              {exp.title}
            </h3>
            <div className="text-sm font-semibold mt-1" style={{ ...stagger(2), color: `rgb(${kind.rgb})` }}>
              {exp.company}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400 mt-3 mb-4" style={stagger(3)}>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Calendar className="w-3 h-3" style={{ color: `rgb(${kind.rgb})` }} /> {exp.period}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
                <MapPin className="w-3 h-3" style={{ color: `rgb(${kind.rgb})` }} /> {exp.location}
              </span>
            </div>
          </div>

          {exp.highlights.length > 0 && (
            <ul className="space-y-2.5 mb-5 text-xs sm:text-sm text-slate-300">
              {exp.highlights.map((item, i) => (
                <li key={i} className="xp-li flex items-start gap-2.5 leading-relaxed" style={stagger(4 + i)}>
                  <span className="xp-bullet shrink-0 mt-[7px]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-1.5">
            {exp.skills.map((skill, sIdx) => (
              <span
                key={sIdx}
                style={stagger(8 + sIdx)}
                className="cert-chip xp-chip px-2.5 py-0.5 rounded-md text-[11px] font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExperienceSection: React.FC = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fill the centre line with scroll progress and light up nodes it has passed
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const focus = window.innerHeight * 0.55;
      const progress = Math.min(1, Math.max(0, (focus - rect.top) / rect.height));
      el.style.setProperty('--p', String(progress));
      el.querySelectorAll<HTMLElement>('[data-node]').forEach((n) => {
        n.dataset.lit = n.getBoundingClientRect().top + 20 < focus ? '1' : '0';
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

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

        {/* Timeline */}
        <div ref={timelineRef} className="xp-timeline max-w-5xl mx-auto relative">
          <div className="xp-track absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5" aria-hidden="true">
            <div className="xp-fill" />
          </div>
          {experienceData.map((exp, index) => (
            <XpItem key={index} exp={exp} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
