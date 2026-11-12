import React from 'react';
import type { Skill } from '../types';
import SkillSphere3D from './SkillSphere3D';
import { Code, Brain, MonitorSmartphone, Figma, GitMerge, Bot, FlaskConical, Wrench, Languages, BookOpen, Cpu, MessageCircle, Database } from 'lucide-react';

const skillsData: { category: string; skills: Skill[] }[] = [
  {
    category: 'Web & Backend Development',
    skills: [
      { name: 'React', icon: Code },
      { name: 'FastAPI', icon: FlaskConical },
      { name: 'PHP', icon: Code },
      { name: 'MySQL', icon: Database },
      { name: 'UI/UX (Figma)', icon: Figma },
      { name: 'Node.js', icon: MonitorSmartphone },
    ],
  },
  {
    category: 'AI & Data Science Specialist',
    skills: [
      { name: 'Machine Learning', icon: Brain },
      { name: 'Computer Vision', icon: Cpu },
      { name: 'CNN (Deep Learning)', icon: Bot },
      { name: 'Data Analysis', icon: BookOpen },
      { name: 'Python', icon: Code },
    ],
  },
  {
    category: 'Tools & Professional Competencies',
    skills: [
      { name: 'Git & GitHub', icon: GitMerge },
      { name: 'Linux OS', icon: Wrench },
      { name: 'Communication', icon: MessageCircle },
      { name: 'Microsoft Excel', icon: BookOpen },
      { name: 'Bahasa Indonesia & English', icon: Languages },
    ],
  },
];

const allSkills = skillsData.flatMap((group) => group.skills);

const SkillsSection: React.FC = () => {
  return (
    <section id="skills" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            TECHNICAL & PROFESSIONAL SKILLS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Keahlian <span className="gradient-text-cyan">Teknologi</span>
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Interactive 3D Skill Sphere */}
        <div className="mb-16">
          <SkillSphere3D skills={allSkills} />
        </div>

      </div>
    </section>
  );
};

export default SkillsSection;