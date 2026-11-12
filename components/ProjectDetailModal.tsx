import React, { useEffect } from 'react';
import type { Project } from '../types';
import { X, Github, ExternalLink, Sparkles, CheckCircle2, Calendar } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    if (!project) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c121e] rounded-3xl border border-slate-700/70 shadow-2xl p-6 sm:p-8 overflow-y-auto font-sans text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-4 pb-2">
          {project.date && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              {project.date}
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 transition-colors ml-auto"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 mt-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {project.title}
          </h2>
          {project.subtitle && (
            <p className="text-sm sm:text-base font-semibold text-cyan-400">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Tech Stack Pills Row */}
        <div className="flex flex-wrap gap-2 my-4">
          {project.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Main Screenshot Container */}
        <div className="my-6 rounded-2xl border border-slate-700/60 overflow-hidden bg-slate-950 shadow-2xl p-2 sm:p-3">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-auto max-h-[420px] object-cover rounded-xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/spacio.png';
            }}
          />
        </div>

        {/* Highlight Callout Quote */}
        <div className="p-4 rounded-xl bg-cyan-500/10 border-l-4 border-cyan-400 text-cyan-200 font-medium text-sm sm:text-base my-4">
          "{project.subtitle || project.description}"
        </div>

        {/* Comprehensive Description Body */}
        <div className="space-y-4 my-6 text-sm sm:text-base text-slate-300 leading-relaxed">
          <p>{project.fullDescription || project.description}</p>

          {/* Key Highlights */}
          {project.keyHighlights && project.keyHighlights.length > 0 && (
            <div className="pt-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Fitur Utama & Implementasi Teknis:</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {project.keyHighlights.map((highlight, hIdx) => (
                  <li key={hIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xs sm:text-sm transition-all"
              >
                <Github className="w-4 h-4 text-cyan-400" />
                <span>Repository GitHub</span>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-110 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Website</span>
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-all ml-auto"
          >
            Tutup Modal
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetailModal;
