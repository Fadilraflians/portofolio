import React from 'react';
import { ChevronUp, Github, Linkedin, MessageCircle } from 'lucide-react';

const socialLinks = [
  { name: 'GitHub', url: 'https://github.com/fadilrafliansyah', icon: Github },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/fadilrafliansyah', icon: Linkedin },
  { name: 'WhatsApp', url: 'https://wa.me/6285834324366', icon: MessageCircle },
];

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#05070b] border-t border-slate-900 py-10 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left Side Info */}
        <div className="text-center sm:text-left space-y-1">
          <div className="font-bold text-white text-base">Fadil Rafliansyah</div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Fadil Rafliansyah. S1 Informatika Telkom University.
          </p>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>

        {/* Scroll To Top */}
        <button
          onClick={scrollToTop}
          className="p-3 rounded-full bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 transition-all flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

      </div>
    </footer>
  );
};

export default Footer;