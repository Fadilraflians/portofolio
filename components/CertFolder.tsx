import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Award, Check, ExternalLink } from 'lucide-react';
import './CertFolder.css';
import type { Certification } from '../types';

/** First-page preview rendered from the PDF: /certificates/x.pdf → /certificates/thumbs/x.webp */
const thumbOf = (cert: Certification) =>
  cert.credentialUrl?.replace('/certificates/', '/certificates/thumbs/').replace(/\.pdf$/i, '.webp');

/* ─── Lightbox (full PDF) ──────────────────────────────────────────────── */

const Lightbox: React.FC<{ cert: Certification; onClose: () => void }> = ({ cert, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  return createPortal(
    <div className="cf-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={cert.title}>
      <div className="cf-lightbox-panel" onClick={e => e.stopPropagation()}>
        <div className="cf-lightbox-head">
          <div className="min-w-0">
            <p className="cf-lightbox-eyebrow">CERTIFICATE{cert.credentialId ? ` · ${cert.credentialId}` : ''}</p>
            <h3 className="cf-lightbox-title">{cert.title}</h3>
            <p className="cf-lightbox-meta">{cert.issuer} · {cert.date}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cf-icon-btn"
              aria-label="Buka PDF di tab baru"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button onClick={onClose} className="cf-icon-btn" aria-label="Tutup sertifikat">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <iframe src={cert.credentialUrl} title={cert.title} className="flex-1 w-full bg-white" />
      </div>
    </div>,
    document.body
  );
};

/* ─── Folder (shared by the page and the open-state replica) ───────────── */

interface FolderBodyProps {
  certs: Certification[];
  label: string;
  sublabel: string;
  no: number;
  onClick?: () => void;
  ariaExpanded?: boolean;
  replica?: boolean;
}

const Stamp: React.FC<{ id: string }> = ({ id }) => (
  <svg className="cf-stamp" viewBox="0 0 100 100" aria-hidden="true">
    <defs>
      <path id={`${id}-top`} d="M 18 50 A 32 32 0 0 1 82 50" />
      <path id={`${id}-bottom`} d="M 14 50 A 36 36 0 0 0 86 50" />
    </defs>
    <circle cx="50" cy="50" r="46" className="cf-stamp-ring" />
    <circle cx="50" cy="50" r="40" className="cf-stamp-ring cf-stamp-dashed" />
    <text className="cf-stamp-text">
      <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">VERIFIED</textPath>
    </text>
    <text className="cf-stamp-text cf-stamp-small">
      <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">CREDENTIAL</textPath>
    </text>
    <circle cx="50" cy="52" r="11" className="cf-stamp-ring" />
    <path d="M45 52.5l3.6 3.6L56 48.7" className="cf-stamp-check" />
  </svg>
);

const FolderBody: React.FC<FolderBodyProps> = ({ certs, label, sublabel, no, onClick, ariaExpanded, replica }) => (
  <div
    className={`cf-folder${replica ? ' cf-folder-replica' : ''}`}
    role="button"
    tabIndex={0}
    aria-expanded={ariaExpanded}
    aria-label={replica ? `Tutup folder ${label}` : `Buka folder ${label}, berisi ${certs.length} sertifikat`}
    onClick={onClick}
    onKeyDown={e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
  >
    <div className="cf-back" />
    <div className="cf-tab">Certificates</div>

    {/* real certificate previews peeking out of the pocket */}
    {!replica && (
      <div className="cf-papers" aria-hidden="true">
        {certs.slice(0, 4).map((cert, i) => (
          <div key={i} className={`cf-paper cf-paper-${i + 1}`}>
            <img src={thumbOf(cert)} alt="" loading="lazy" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
    )}

    <div className="cf-front">
      <div className="cf-label">
        <div className="cf-eyebrow">PORTFOLIO FILE · NO. {String(no).padStart(2, '0')}</div>
        <div className="cf-title">{label}</div>
        <div className="cf-rule" />
        <div className="cf-sub">{sublabel}</div>
      </div>
      <div className="cf-count">
        <Award className="w-4 h-4" />
        {certs.length} verified credentials
      </div>
      <Stamp id={`cf-stamp-${no}${replica ? '-r' : ''}`} />
    </div>
  </div>
);

/* ─── Open state: certificates fan out above the folder ────────────────── */

// four cards: a gentle fan, staggered in and out
const CARD_ROT = [-7, -2.5, 2.5, 7];
const CARD_DELAY = [0.06, 0.12, 0.18, 0.24];
const CARD_CLOSE = [0.15, 0.1, 0.05, 0];

interface OverlayProps {
  certs: Certification[];
  label: string;
  sublabel: string;
  no: number;
  onClose: () => void;
  onCertClick: (cert: Certification) => void;
}

const FolderOverlay: React.FC<OverlayProps> = ({ certs, label, sublabel, no, onClose, onCertClick }) => {
  const [phase, setPhase] = useState<'opening' | 'open' | 'closing'>('opening');
  // once the cards have landed, hover reacts instantly (no stagger delay)
  const [settled, setSettled] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPhase('open'));
    const settle = window.setTimeout(() => setSettled(true), 850);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.clearTimeout(timer.current);
      document.body.style.overflow = '';
    };
  }, []);

  const close = useCallback(() => {
    setPhase('closing');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(onClose, 520);
  }, [onClose]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [close]);

  const open = (cert: Certification) => {
    onCertClick(cert);
    close();
  };

  return createPortal(
    <div
      className={`cf-overlay${phase === 'open' ? ' is-open' : ''}${phase === 'open' && settled ? ' is-settled' : ''}${phase === 'closing' ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="cf-overlay-bg" onClick={close} />

      <div className="cf-stage">
        <div className="cf-cards">
          {certs.map((cert, i) => (
            <button
              key={i}
              type="button"
              className="cf-card"
              style={{
                '--rot': `${CARD_ROT[i % 4]}deg`,
                '--delay': `${CARD_DELAY[i % 4]}s`,
                '--close-delay': `${CARD_CLOSE[i % 4]}s`,
              } as React.CSSProperties}
              onClick={() => open(cert)}
              aria-label={`Buka sertifikat ${cert.title}`}
            >
              <div className="cf-card-thumb">
                <img src={thumbOf(cert)} alt="" decoding="async" draggable={false} />
                <span className="cf-card-view">Lihat sertifikat</span>
              </div>
              <div className="cf-card-info">
                <div className="cf-card-issuer">{cert.issuer}</div>
                <div className="cf-card-title">{cert.title}</div>
                <div className="cf-card-meta">
                  <span>{cert.date}</span>
                  <span className="cf-card-ok"><Check className="w-3 h-3" /> Verified</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <FolderBody certs={certs} label={label} sublabel={sublabel} no={no} replica ariaExpanded onClick={close} />
      </div>

      <div className="cf-hint cf-overlay-hint">
        <span className="cf-hint-dot" />
        Klik sertifikat untuk melihat · klik folder untuk menutup
      </div>
    </div>,
    document.body
  );
};

/* ─── Main ─────────────────────────────────────────────────────────────── */

export interface CertFolderProps {
  certs: Certification[];
  label: string;
  sublabel: string;
  /** Number printed on the label: "PORTFOLIO FILE · NO. 01". */
  no: number;
}

const CertFolder: React.FC<CertFolderProps> = ({ certs, label, sublabel, no }) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [activeCert, setActiveCert] = useState<Certification | null>(null);

  return (
    <div className="cf-root">
      <FolderBody
        certs={certs}
        label={label}
        sublabel={sublabel}
        no={no}
        onClick={() => setOverlayOpen(true)}
        ariaExpanded={overlayOpen}
      />

      <div className="cf-hint">
        <span className="cf-hint-dot" />
        {certs.length} certificates inside · tap the folder
      </div>

      {overlayOpen && (
        <FolderOverlay
          certs={certs}
          label={label}
          sublabel={sublabel}
          no={no}
          onClose={() => setOverlayOpen(false)}
          onCertClick={setActiveCert}
        />
      )}

      {activeCert && <Lightbox cert={activeCert} onClose={() => setActiveCert(null)} />}
    </div>
  );
};

export default CertFolder;
