import React, { useEffect, useState } from 'react';
import { Menu, ShieldCheck, Clock, AlertCircle, PlusCircle, Bell, Search } from 'lucide-react';
import { PageId } from '../../types';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMobileMenu: () => void;
  onOpenDemoNotice: () => void;
  onQuickInvestigate: () => void;
}

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Security Operations Center', subtitle: 'Global Threat Telemetry & Risk Overview' },
  'website-investigation': { title: 'Website Investigation', subtitle: 'Full-Spectrum Domain & Infrastructure Analysis' },
  'phishing-detection': { title: 'Phishing Detection', subtitle: 'Homoglyph, Punycode & Lexical Threat Engine' },
  'tls-certificate': { title: 'TLS Certificate Intelligence', subtitle: 'Cipher Suites, CT Logs & Trust Chain Validation' },
  'scam-analysis': { title: 'Scam Message Analysis', subtitle: 'Email, SMS Smishing & Social Engineering Heuristics' },
  'security-assessment': { title: 'Website Security Assessment', subtitle: 'Header Posture, SSL Stripping & Surface Vulnerabilities' },
  'threat-intelligence': { title: 'Threat Intelligence Feed', subtitle: 'Live IOCs, Malicious ASNs & MITRE ATT&CK Mapping' },
  'blockchain-verification': { title: 'Blockchain Trust Ledger', subtitle: 'Cryptographic Audit Proofs & Merkle Integrity' },
  history: { title: 'Investigation History', subtitle: 'Searchable Audit Log & Forensics Archive' },
  reports: { title: 'Executive & Compliance Reports', subtitle: 'Incident Dossiers & ISO 27001 / NIST Alignment' },
  'ai-assistant': { title: 'AI Security Assistant', subtitle: 'Threat Analysis Copilot (Gemini API Ready)' },
  settings: { title: 'System Settings', subtitle: 'SOC Configuration, API Connectors & Alert Thresholds' },
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenMobileMenu,
  onOpenDemoNotice,
  onQuickInvestigate,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageInfo = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#070b15]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest hidden sm:inline">
              SENTINEL //
            </span>
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight truncate">
              {pageInfo.title}
            </h1>
          </div>
          <span className="text-[11px] text-slate-400 truncate hidden md:inline">
            {pageInfo.subtitle}
          </span>
        </div>
      </div>

      {/* Zone 2: Telemetry status & Demo tag */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="tabular-nums">{currentTime || '2026-11-07 18:00:00 UTC'}</span>
        </div>

        <button
          onClick={onOpenDemoNotice}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-950/60 transition-colors font-sans"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium">DEMO DATA</span>
        </button>
      </div>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onQuickInvestigate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm shadow-cyan-950/50 transition-all whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 text-black" />
          <span className="hidden sm:inline">New Investigation</span>
          <span className="sm:hidden">Investigate</span>
        </button>
      </div>
    </header>
  );
};
