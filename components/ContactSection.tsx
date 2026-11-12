import React, { useState } from 'react';
import type { SocialLink } from '../types';
import { Mail, MessageCircle, Github, Linkedin, Send, CheckCircle2, Sparkles, MapPin, Phone, Loader2, AlertCircle } from 'lucide-react';

const socialLinks: SocialLink[] = [
  { name: 'GitHub', url: 'https://github.com/fadilrafliansyah', icon: Github },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/fadilrafliansyah', icon: Linkedin },
  { name: 'WhatsApp', url: 'https://wa.me/6285834324366', icon: MessageCircle },
];

const CONTACT_EMAIL = 'rafli.fadil003@gmail.com';
// Default transport: FormSubmit (formsubmit.co), no key needed; needs a one-time email activation.
// If VITE_WEB3FORMS_KEY is set, Web3Forms is used instead.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

type Status = 'idle' | 'sending' | 'success' | 'error';

const ContactSection: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const buildMailto = (name: string, email: string, message: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Pesan dari portofolio: ${name}`)}&body=${encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\n\n${message}`,
    )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    const name = formState.name.trim();
    const email = formState.email.trim();
    const message = formState.message.trim();
    if (!name || !email || !message) return;

    // Hidden field only bots fill in: pretend it worked, send nothing
    if (honeypot) {
      setStatus('success');
      return;
    }

    setStatus('sending');
    setErrorMsg('');
    try {
      const subject = `Pesan baru dari portofolio - ${name}`;
      const res = await fetch(WEB3FORMS_KEY ? 'https://api.web3forms.com/submit' : FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          WEB3FORMS_KEY
            ? { access_key: WEB3FORMS_KEY, subject, from_name: 'Portofolio Fadil', name, email, message }
            : { _subject: subject, _captcha: 'false', _template: 'table', name, email, message },
        ),
      });
      const data = (await res.json().catch(() => null)) as { success?: boolean | string; message?: string } | null;
      // FormSubmit returns success as the string "true"/"false"
      const ok = data?.success === true || data?.success === 'true';
      if (!res.ok || !ok) throw new Error(data?.message || 'Pesan gagal dikirim.');
      setFormState({ name: '', email: '', message: '' });
      setStatus('success');
    } catch (err) {
      setErrorMsg(
        err instanceof TypeError
          ? 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.'
          : err instanceof Error
            ? err.message
            : 'Pesan gagal dikirim.',
      );
      setStatus('error');
    }
  };

  const done = status === 'success';

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
            {done ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in-up">
                <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">Pesan Berhasil Terkirim!</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Terima kasih atas pesan Anda. Fadil akan membalas melalui email secepatnya.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 text-xs font-semibold transition-all"
                >
                  Kirim pesan lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot: hidden from people, bots fill it */}
                <input
                  type="text"
                  name="botcheck"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                />
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

                {status === 'error' && (
                  <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <span>
                      {errorMsg} Atau kirim langsung ke{' '}
                      <a
                        href={buildMailto(formState.name.trim(), formState.email.trim(), formState.message.trim())}
                        className="underline font-semibold text-white"
                      >
                        {CONTACT_EMAIL}
                      </a>
                      .
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-wait transition-all flex items-center justify-center gap-2"
                >
                  {status === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{status === 'sending' ? 'Mengirim...' : 'Kirim Pesan'}</span>
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