
import React, { useState } from 'react';
import type { Skill } from '../types';

interface SkillBadgeProps {
  skill: Skill;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skill }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = skill.icon;
  
  return (
    <div 
      className="group relative flex flex-col items-center justify-center p-6 glass-effect rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isHovered ? 'animate-shimmer' : ''}`}></div>
      
      {/* Icon with animation */}
      <div className="relative z-10 mb-3">
        <Icon className={`w-12 h-12 text-cyan-400 transition-all duration-500 ${isHovered ? 'animate-pulse-slow text-cyan-300' : ''}`} />
      </div>
      
      {/* Skill name */}
      <span className="relative z-10 text-sm font-semibold text-slate-200 text-center group-hover:text-white transition-colors duration-300">
        {skill.name}
      </span>
      
      {/* Hover effect border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-cyan-400/50 transition-all duration-500"></div>
    </div>
  );
};

export default SkillBadge;
