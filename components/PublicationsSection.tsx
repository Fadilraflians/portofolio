import React from 'react';
import TiltCard from './TiltCard';
import { useCardFx, stagger } from './useCardFx';
import type { Publication } from '../types';
import { BookOpen, ExternalLink, Award, FileText } from 'lucide-react';

const publicationsData: Publication[] = [
  {
    title: 'Comparative Performance Analysis of EfficientNetV2-S, InceptionV3, and ResNet50 in Fruit Classification',
    venue: 'Jurnal Ilmiah Komputasi (JIKSTIK), Vol. 24, No. 3, Sinta 4 Accredited',
    year: '2025',
    description:
      'Publikasi jurnal ilmiah membandingkan 3 arsitektur deep learning (EfficientNetV2-S, InceptionV3, ResNet50) untuk klasifikasi gambar buah dengan fokus pada evaluasi performa akurasi dan efisiensi komputasi.',
    tags: ['CNN', 'Machine Learning', 'Computer Vision', 'Image Classification', 'JIKSTIK'],
    url: 'https://doi.org/10.32409/jikstik.24.3.3842',
    imageUrl: '/publication-jikstik.png',
    status: 'Published Journal (Sinta 4)',
  },
  {
    title: 'Classification of Dragon Fruit Ripeness Level Using Convolutional Neural Networks Architecture',
    venue: '2025 International Conference on Green Energy, Computing and Intelligent Technology (GEN-CITY)',
    year: '2026',
    description:
      'Paper konferensi internasional mengenai klasifikasi tingkat kematangan buah naga berbasis metode Convolutional Neural Networks (CNN) dalam konteks penerapan AI pertanian cerdas.',
    tags: ['CNN', 'Deep Learning', 'Agriculture AI', 'Conference Paper', 'IEEE / GEN-CITY'],
    url: 'https://doi.org/10.1049/icp.2026.2110',
    imageUrl: '/publication-gencity.png',
    status: 'Accepted International Conference',
  },
];

const PublicationCard: React.FC<{ pub: Publication }> = ({ pub }) => {
  const { ref, onPointerMove, phaseClass } = useCardFx();
  return (
    <TiltCard max={4} rounded="rounded-3xl">
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        className={`cert-card h-full p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 backdrop-blur-md shadow-xl ${phaseClass}`}
      >
        <span className="cert-shine" aria-hidden="true" />
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="cert-media pub-preview lg:w-64 shrink-0 rounded-2xl bg-slate-900 border border-slate-800 p-3 flex items-center justify-center">
            <img
              src={pub.imageUrl}
              alt={pub.title}
              className="max-h-44 object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="cert-text flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2" style={stagger(0)}>
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                {pub.year}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="status-dot" />
                {pub.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white leading-snug" style={stagger(1)}>{pub.title}</h3>
            <div className="text-xs font-semibold text-cyan-400 font-mono" style={stagger(2)}>{pub.venue}</div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed" style={stagger(3)}>{pub.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {pub.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={stagger(4 + tIdx)}
                  className="cert-chip px-2.5 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/20 text-purple-300 text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {pub.url && (
              <div className="pt-2">
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={stagger(9)}
                  className="cert-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka DOI / Link Publikasi</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

const PublicationsSection: React.FC = () => {
  return (
    <section id="publications" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            ACADEMIC RESEARCH & PAPERS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Publikasi <span className="gradient-text-cyan">Ilmiah</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Dua karya publikasi ilmiah di bidang Computer Vision dan Deep Learning.
          </p>
        </div>

        {/* Publications Grid */}
        <div className="max-w-5xl mx-auto space-y-8">
          {publicationsData.map((pub, idx) => (
            <PublicationCard key={idx} pub={pub} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default PublicationsSection;
