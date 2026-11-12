import React, { useState } from 'react';
import type { Project } from '../types';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';

const projectsData: Project[] = [
  {
    title: 'SPACIO – Smart Meeting Room Booking System',
    subtitle: 'Digitized Smart Meeting Room Reservation Platform for InJourney Airports',
    date: 'Agustus 2025',
    description: 'Platform digital manajemen reservasi ruang rapat pintar yang dikembangkan saat magang di InJourney Airports. Dilengkapi ketersediaan ruang real-time, manajemen jadwal, dan otomatisasi alur kerja internal.',
    fullDescription: 'SPACIO adalah sistem reservasi ruang rapat berbasis web yang dirancang dan dikembangkan saat magang di PT Angkasa Pura Indonesia (InJourney Airports). Aplikasi ini mengotomatiskan alur kerja pemesanan ruangan rapat internal yang sebelumnya dilakukan secara manual, menyediakan visibilitas jadwal real-time, manajemen kapasitas ruangan, serta notifikasi reservasi.',
    keyHighlights: [
      'Pengembangan backend RESTful API menggunakan FastAPI dan arsitektur database MySQL.',
      'Fitur visibilitas status ketersediaan ruang rapat secara real-time dan terintegrasi.',
      'Sistem autentikasi peran pengguna (User Umum & Admin Ruangan Korporat).',
      'Mengurangi hambatan alur kerja pemesanan ruang rapat di kantor pusat InJourney Airports.',
    ],
    tags: ['Web Application', 'FastAPI', 'MySQL', 'InJourney Airports', 'Workflow Automation'],
    imageUrl: '/spacio-project.png',
    sourceUrl: 'https://github.com/Fadilraflians/Aplikasi-meeting-ai',
  },
  {
    title: 'E-Commerce Web Platform',
    subtitle: 'Platform Toko Online Responsif & Manajemen Transaksi Digital',
    date: 'Januari 2025',
    description: 'Aplikasi web toko online responsif yang menyediakan alur belanja intuitif, kustomisasi produk, serta manajemen transaksi digital yang aman.',
    fullDescription: 'Platform e-commerce modern berbasis React yang menyediakan antarmuka pengguna responsif, katalog produk dinamis, filter kategori, alur keranjang belanja (cart system), serta integrasi antarmuka pembayaran digital.',
    keyHighlights: [
      'Komponen antarmuka modern yang cepat dan responsif dengan React & TailwindCSS.',
      'Pengelolaan state keranjang belanja dan kalkulasi pajak/diskon otomatis.',
      'Manajemen transaksi dan validasi formulir checkout pengguna secara konsisten.',
    ],
    tags: ['React', 'Web Application', 'UI/UX Design', 'Cart System'],
    imageUrl: '/project-ecommerce.jpg',
    sourceUrl: 'https://github.com/Fadilraflians/Aplikasi-E-Commers',
  },
  {
    title: 'Duit-flow Mobile App',
    subtitle: 'Personal Finance Tracking & Budget Planning Mobile Application',
    date: 'November 2024',
    description: 'Aplikasi manajemen keuangan pribadi berbasis mobile untuk mencatat pengeluaran harian, memantau arus kas, dan mengoptimalkan perencanaan anggaran keuangan.',
    fullDescription: 'Aplikasi mobile manajemen keuangan pribadi yang membantu pengguna mencatat alokasi keuangan harian, memantau arus kas pemasukan dan pengeluaran, serta memberikan visualisasi grafik analitis keuangan harian dan bulanan.',
    keyHighlights: [
      'Pencatatan transaksi harian dengan pengkategorian pintar dan pencarian kilat.',
      'Visualisasi grafik arus kas bulanan dan pemantauan batas anggaran (budget alert).',
      'Desain antarmuka seluler intuitif yang memberikan pengalaman pengguna yang cepat.',
    ],
    tags: ['Mobile App', 'Finance Tracking', 'Product Design', 'Analytics'],
    imageUrl: '/project-duitflow.jpg',
    sourceUrl: 'https://github.com/Fadilraflians/Apps-Duitflow',
  },
  {
    title: 'Warungin Digitalization App',
    subtitle: 'Sistem Pemesanan Digital & Digitalisasi UMKM Kuliner',
    date: 'Oktober 2024',
    description: 'Sistem alur pemesanan digital untuk pemilik UMKM dan warung makan lokal guna mempermudah pencatatan pesanan dan meningkatkan efisiensi pelayanan pelanggan.',
    fullDescription: 'Solusi digitalisasi alur pemesanan untuk usaha warung makan lokal dan UMKM. Aplikasi ini membantu pemilik usaha mencatat pesanan pelanggan, memantau antrean pesanan di dapur, dan mencetak rekapitulasi harian secara otomatis.',
    keyHighlights: [
      'Manajemen menu digital dan alur pemesanan antrean tanpa kertas (paperless).',
      'Optimasi kecepatan pencatatan pesanan kasir dan integrasi status antrean.',
      'Rekapitulasi laporan keuangan dan omzet harian otomatis untuk pemilik UMKM.',
    ],
    tags: ['System & UMKM', 'Digitalization', 'Ordering System', 'Workflow'],
    imageUrl: '/project-warungin.jpg',
    sourceUrl: 'https://github.com/FairX/warungin',
  },
];

const categories = ['Semua Proyek', 'Web Application', 'Mobile App', 'System & UMKM'];

const ProjectsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Semua Proyek');
  const [activeProjectModal, setActiveProjectModal] = useState<Project | null>(null);

  const filteredProjects = selectedCategory === 'Semua Proyek'
    ? projectsData
    : projectsData.filter((p) => p.tags.some((tag) => tag.toLowerCase().includes(selectedCategory.toLowerCase())));

  return (
    <section id="projects" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            PORTFOLIO SHOWCASE
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Proyek <span className="gradient-text-cyan">Unggulan</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Kumpulan proyek pilihan mencakup digitalisasi sistem perusahaan, platform e-commerce, hingga aplikasi keuangan & UMKM.
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-105'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              onOpenDetail={(p) => setActiveProjectModal(p)}
            />
          ))}
        </div>

      </div>

      {/* Project Detail Lightbox Modal */}
      <ProjectDetailModal
        project={activeProjectModal}
        onClose={() => setActiveProjectModal(null)}
      />
    </section>
  );
};

export default ProjectsSection;