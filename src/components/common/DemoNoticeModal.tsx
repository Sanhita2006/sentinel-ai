import React, { useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X, Info } from 'lucide-react';
import { DEMO_DATA_DISCLAIMER } from '../../data/mockData';

interface DemoNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoNoticeModal: React.FC<DemoNoticeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const active = [
    'Complete 12-page SOC dashboard and investigation interface',
    'Client-side lexical parser for homoglyph / punycode inspection',
    'Website investigation request to the backend /api/investigate endpoint',
    'Scam message analysis via the backend /api/scam-analysis endpoint (local Ollama model)',
    'Blockchain ledger verification simulator over sample SHA-256 records',
    'AI Security Assistant interface with scripted local responses (model connection not wired in this build)',
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-soc-bg/80 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-notice-title"
      onClick={onClose}
    >
      <div
        className="soc-panel w-full max-w-xl overflow-hidden shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-soc-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-soc-forest-2 bg-soc-forest/60 text-soc-accent-hi">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 id="demo-notice-title" className="text-sm font-semibold text-soc-text">
                Prototype transparency &amp; demo data notice
              </h3>
              <p className="text-[11px] text-soc-muted">Cybersecurity hackathon compliance &amp; ethics disclosure</p>
            </div>
          </div>
          <button onClick={onClose} className="soc-btn soc-btn-ghost h-7 w-7 px-0" aria-label="Close notice">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4 text-xs text-soc-text-2">
          <div className="flex items-start gap-2.5 rounded border border-sev-medium/35 bg-sev-medium/[0.07] px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sev-medium" />
            <p className="leading-relaxed">{DEMO_DATA_DISCLAIMER}</p>
          </div>

          <div>
            <h4 className="soc-label mb-2">Active in this build</h4>
            <ul className="space-y-1.5">
              {active.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-soc-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-start gap-2 border-t border-soc-line pt-3 text-soc-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Target domains in sample views are curated representative patterns used to illustrate detection
              metrics without executing disruptive active probes. Panels marked <b className="text-sev-medium">Demo</b>{' '}
              or <b className="text-sev-medium">Simulated</b> are not live telemetry.
            </span>
          </div>
        </div>

        <footer className="flex justify-end border-t border-soc-line px-5 py-3">
          <button onClick={onClose} className="soc-btn soc-btn-primary">
            Acknowledge &amp; continue
          </button>
        </footer>
      </div>
    </div>
  );
};
