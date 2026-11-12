import React, { useState } from 'react';
import type { SocialLink } from '../types';
import { Mail, MessageCircle, Github, Linkedin, Send, CheckCircle2, Sparkles, MapPin, Phone } from 'lucide-react';

const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: 'https://github.com/fadilrafliansyah', icon: Github },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/fadilrafliansyah', icon: Linkedin },
  { name: 'WhatsApp', url: 'https://wa.me/6285834324366', icon: MessageCircle },
];

const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="py-24 relative z-10 overflow-hidden bg-[#07090e]/25">
      <div className="container mx-auto px-4 sm:px-6 xl:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Hubungi <span className="gradient-text-cyan">Saya</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Terbuka untuk peluang kerja full-time/kontrak, kolaborasi pengembangan software, proyek AI & Web Development.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
          
          {/* Direct Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            <a
              href="mailto:rafli.fadil003@gmail.com"
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md flex items-center gap-4 group transition-all"
            >
              <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Email Resmi</div>
                <div className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  rafli.fadil003@gmail.com
                </div>
              </div>
            </a>

            <a
              href="https://wa.me/6285834324366"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 backdrop-blur-md flex items-center gap-4 group transition-all"
            >
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">WhatsApp / Handphone</div>
                <div className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  +62 858-3432-4366
                </div>
              </div>
            </a>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Lokasi Dominan</div>
                <div className="text-sm sm:text-base font-bold text-white">
                  Jakarta, Indonesia
                </div>
              </div>
            </div>

            {/* Social Connect Links */}
            <div className="pt-4">
              <div className="text-xs text-slate-400 mb-3 font-semibold">Tautan Media Sosial & Portofolio:</div>
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-2 text-xs font-semibold"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Interactive Contact Form */}
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in-up">
                <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Pesan Berhasil Terkirim!</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Terima kasih atas pesan Anda. Fadil akan membalas melalui email secepatnya.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Kirim Pesan Langsung</span>
                </h3>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Masukkan nama Anda..."
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Alamat Email</label>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="nama@perusahaan.com"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-medium">Pesan / Diskusi Proyek</label>
                  <textarea
                    rows={4}
                    required
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Tuliskan pesan atau penawaran kerja sama di sini..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default ContactSection;