import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../types';
import { X, Github, ExternalLink, Sparkles, CheckCircle2, Calendar } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

const step = (n: number) => ({ '--i': n } as React.CSSProperties);

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

  return createPortal(
    <div
      className="pm-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="pm-panel relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0a0f1a] rounded-3xl border border-slate-700/60 shadow-2xl shadow-cyan-500/10 overflow-hidden font-sans text-slate-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
      >
        <button
          onClick={onClose}
          className="pm-close absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-600/60 backdrop-blur-md"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto overscroll-contain flex-1">
          {/* Cover */}
          <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="pm-cover w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/spacio.png';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent" />
            <div className="pm-glow absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-40 rounded-full bg-cyan-500/25 blur-3xl pointer-events-none" />

            <div className="absolute left-0 right-0 bottom-0 p-5 sm:p-8">
              <div className="pm-in flex flex-wrap items-center gap-2 mb-3" style={step(0)}>
                {project.date && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold backdrop-blur-md">
                    <Calendar className="w-3.5 h-3.5" />
                    {project.date}
                  </span>
                )}
                {project.tags[0] && (
                  <span className="px-3 py-1 rounded-full bg-slate-950/70 border border-slate-600/60 text-slate-200 text-xs font-semibold backdrop-blur-md">
                    {project.tags[0]}
                  </span>
                )}
              </div>
              <h2
                className="pm-in text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg"
                style={step(1)}
              >
                {project.title}
              </h2>
              {project.subtitle && (
                <p className="pm-in mt-2 text-sm sm:text-base font-semibold gradient-text-cyan" style={step(2)}>
                  {project.subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-8">
            {/* Tech stack */}
            <div className="pm-in" style={step(3)}>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 font-mono">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="pm-pill px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="pm-in" style={step(4)}>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 font-mono">Tentang Project</h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {project.fullDescription || project.description}
              </p>
            </div>

            {/* Highlights */}
            {project.keyHighlights && project.keyHighlights.length > 0 && (
              <div className="pm-in" style={step(5)}>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Fitur Utama & Implementasi Teknis</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.keyHighlights.map((highlight, hIdx) => (
                    <div
                      key={hIdx}
                      className="pm-in pm-feature group relative flex items-start gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40"
                      style={step(6 + hIdx)}
                    >
                      <span className="shrink-0 w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center">
                        {String(hIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs sm:text-sm text-slate-300 leading-relaxed pr-5">{highlight}</span>
                      <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-emerald-400/0 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-5 sm:px-8 py-4 border-t border-slate-800 bg-[#0a0f1a]/95 backdrop-blur-md flex flex-wrap items-center gap-3">
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pm-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-white font-semibold text-xs sm:text-sm"
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
              className="pm-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Website</span>
            </a>
          )}
          <button
            onClick={onClose}
            className="pm-btn px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold ml-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectDetailModal;
