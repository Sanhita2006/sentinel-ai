import React from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { DEMO_DATA_DISCLAIMER } from '../../data/mockData';

interface DemoNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoNoticeModal: React.FC<DemoNoticeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0b101e] border border-cyan-500/30 rounded-xl p-6 shadow-2xl shadow-cyan-950/50">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Prototype Transparency & Demo Data Notice</h3>
              <p className="text-xs text-slate-400">Cybersecurity Hackathon Compliance & Ethics Disclosure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <p className="text-xs leading-relaxed">{DEMO_DATA_DISCLAIMER}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">What is active in this build:</h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Complete responsive 12-page SOC dashboard & investigation UI</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time client-side lexical parser for homoglyph / punycode spoof detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive URL & email scam analyzer with simulated pipeline stages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Blockchain Merkle verification simulator with SHA-256 integrity proofs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Gemini 2.5/Flash AI Copilot integration architecture ready for server routes</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Target domains evaluated in this dashboard are curated representative test patterns to illustrate detection metrics without executing disruptive active probes.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-semibold"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
