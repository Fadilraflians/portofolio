import React from 'react';
import type { Project } from '../types';
import { ExternalLink, Github, FileText, Info } from 'lucide-react';
import TiltCard from './TiltCard';
import { useCardFx, stagger } from './useCardFx';

interface ProjectCardProps {
  project: Project;
  onOpenDetail: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenDetail }) => {
  const { ref, onPointerMove, phaseClass } = useCardFx();
  return (
    <TiltCard max={8} flow>
    <div ref={ref} onPointerMove={onPointerMove} className={`cert-card group h-full rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between backdrop-blur-md ${phaseClass}`}>
      <span className="cert-shine" aria-hidden="true" />
      <div>
        {/* Cover Image Container */}
        <div className="cert-media relative h-52 w-full bg-slate-900 cursor-pointer" onClick={() => onOpenDetail(project)}>
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover "
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/spacio.png';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          
          {/* Top Tag */}
          <div className="cert-tag absolute top-3 left-3 z-10">
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 text-cyan-300 text-[11px] font-semibold backdrop-blur-md">
              {project.tags[0] || 'Featured Project'}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="cert-text p-6">
          <h3
            onClick={() => onOpenDetail(project)}
            className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors cursor-pointer"
          >
            {project.title}
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                style={stagger(4 + idx)}
                className="cert-chip px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 pb-6 pt-2 flex items-center gap-3 border-t border-slate-900">
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={stagger(8)}
            className="cert-btn flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 font-semibold text-xs transition-all"
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>Repository</span>
          </a>
        )}
        <button
          type="button"
          onClick={() => onOpenDetail(project)}
          style={stagger(9)}
          className="cert-btn flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-md hover:brightness-110 transition-all"
        >
          <Info className="w-4 h-4" />
          <span>Detail Project</span>
        </button>
      </div>
    </div>
    </TiltCard>
  );
};

export default ProjectCard;
