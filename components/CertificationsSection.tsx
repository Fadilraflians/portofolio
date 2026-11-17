import React from 'react';
import CertFolder from './CertFolder';
import type { Certification } from '../types';

/* ─── Data ─────────────────────────────────────────────────────────────── */

// Details match the certificate PDFs in /public/certificates (thumbnails in /thumbs).
const GROUP_A: Certification[] = [
  {
    title: 'Intelligent by Design: Build an AI Agent',
    issuer: 'IBM SkillsBuild',
    date: 'Mei 2026',
    credentialId: 'ALM-COURSE_3946359',
    skills: ['AI Agent', 'Generative AI'],
    credentialUrl: '/certificates/ibm-build-ai-agent.pdf',
  },
  {
    title: 'AI for Work & Career Readiness with Google AI Products',
    issuer: 'Hacktiv8 Indonesia',
    date: 'Mei 2026',
    credentialId: '04484/H8/CSR/MBA2/V/2026',
    skills: ['Artificial Intelligence', 'Google AI'],
    credentialUrl: '/certificates/hacktiv8-ai-for-work.pdf',
  },
  {
    title: 'AI Engineer for Milenial (Micro Skill)',
    issuer: 'Digital Talent Scholarship · Komdigi',
    date: 'Mei 2026',
    credentialId: '22910029850-20496/MS/BLSDM.Komdigi/2026',
    skills: ['Artificial Intelligence', 'Machine Learning'],
    credentialUrl: '/certificates/dts-ai-engineering.pdf',
  },
  {
    title: 'Preparation Course for Azure AI Fundamentals (AI-900)',
    issuer: 'Microsoft · elevAIte Indonesia',
    date: 'Mei 2025',
    credentialId: 'cbf3f9d3',
    skills: ['Azure AI', 'Artificial Intelligence'],
    credentialUrl: '/certificates/microsoft-ai-fundamentals.pdf',
  },
];

const GROUP_B: Certification[] = [
  {
    title: 'Intensive Bootcamp Microsoft Excel (Intermediate)',
    issuer: 'Karirnex · PT Ebiz Karisma Internasional',
    date: 'Jun 2026',
    credentialId: '1927/B-13/KBT.EXCEL.8/KRX/VI/2026',
    skills: ['Microsoft Excel', 'Data Analysis'],
    credentialUrl: '/certificates/karirnex-excel.pdf',
  },
  {
    title: 'DigiHack 2025: AI for Good',
    issuer: 'Digistar Club · Telkom Indonesia',
    date: 'Agu–Okt 2025',
    credentialId: '1447/CC-TELU/DigiClub/X/2025',
    skills: ['Artificial Intelligence', 'Hackathon'],
    credentialUrl: '/certificates/digihack-2025.pdf',
  },
  {
    title: 'Web Development Basics',
    issuer: 'IBM SkillsBuild',
    date: 'Mei 2025',
    credentialId: 'MDLPT-268',
    skills: ['Web Development', 'HTML/CSS/JS'],
    credentialUrl: '/certificates/ibm-web-development.pdf',
  },
  {
    title: 'Memulai Pemrograman dengan Python',
    issuer: 'Dicoding Indonesia',
    date: 'Jun 2024',
    credentialId: 'KEXL1MEM4XG2',
    skills: ['Python', 'Programming Fundamentals'],
    credentialUrl: '/certificates/dicoding-python.pdf',
  },
];

/* ─── Section ───────────────────────────────────────────────────────────── */

const CertificationsSection: React.FC = () => (
  <section id="certifications" className="py-24 relative z-10 overflow-visible">
    {/* ambient glows */}
    <div className="absolute top-1/3 left-[5%]  w-[500px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[140px] pointer-events-none" />
    <div className="absolute top-1/3 right-[5%] w-[500px] h-[500px] bg-violet-600/[0.07]  rounded-full blur-[140px] pointer-events-none" />

    <div className="container mx-auto px-4 sm:px-6 xl:px-12">

      {/* ── header ── */}
      <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono">
          VERIFIED CREDENTIALS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
          Lisensi &amp; <span className="gradient-text-cyan">Sertifikasi</span>
        </h2>
        <p className="text-base text-slate-400">
          Sertifikat dari IBM, Microsoft, Hacktiv8, Komdigi, Telkom Indonesia, Dicoding, dan Karirnex.
          Klik folder untuk membuka sertifikat.
        </p>
      </div>

      {/* ── two folders, four certificates each ── */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16 lg:gap-20">
        <CertFolder
          certs={GROUP_A}
          no={1}
          label="AI & Machine Learning"
          sublabel="IBM · Hacktiv8 · Komdigi · Microsoft"
        />
        <CertFolder
          certs={GROUP_B}
          no={2}
          label="Web, Data & Tech"
          sublabel="Karirnex · Telkom · IBM · Dicoding"
        />
      </div>

    </div>
  </section>
);

export default CertificationsSection;
