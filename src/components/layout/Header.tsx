import React, { useEffect, useState } from 'react';
import { Menu, Clock, FlaskConical, Plus, ChevronRight } from 'lucide-react';
import { PageId } from '../../types';
import { utcStamp } from '../../lib/severity';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMobileMenu: () => void;
  onOpenDemoNotice: () => void;
  onQuickInvestigate: () => void;
}

const PAGE_TITLES: Record<PageId, { section: string; title: string; subtitle: string }> = {
  dashboard: { section: 'Operations', title: 'Security Operations Center', subtitle: 'Threat telemetry & risk overview' },
  'website-investigation': { section: 'Operations', title: 'Website Investigation', subtitle: 'Domain & infrastructure analysis' },
  history: { section: 'Operations', title: 'Investigation History', subtitle: 'Searchable audit log & forensics archive' },
  'phishing-detection': { section: 'Detection Engines', title: 'Phishing Detection', subtitle: 'Homoglyph, punycode & lexical engine' },
  'tls-certificate': { section: 'Detection Engines', title: 'TLS Certificate Intelligence', subtitle: 'Cipher suites, CT logs & trust chain' },
  'scam-analysis': { section: 'Detection Engines', title: 'Scam Message Analysis', subtitle: 'Email, SMS & social-engineering heuristics' },
  'security-assessment': { section: 'Detection Engines', title: 'Website Security Assessment', subtitle: 'Header posture & surface exposure' },
  'threat-intelligence': { section: 'Intelligence & Trust', title: 'Threat Intelligence Feed', subtitle: 'IOCs, infrastructure & MITRE ATT&CK mapping' },
  'blockchain-verification': { section: 'Intelligence & Trust', title: 'Blockchain Trust Ledger', subtitle: 'Cryptographic audit proofs & Merkle integrity' },
  reports: { section: 'Intelligence & Trust', title: 'Executive & Compliance Reports', subtitle: 'Incident dossiers, NIST CSF & ISO 27001' },
  'ai-assistant': { section: 'Copilot & System', title: 'AI Security Assistant', subtitle: 'Threat analysis copilot' },
  settings: { section: 'Copilot & System', title: 'System Settings', subtitle: 'Thresholds, connectors & alerting' },
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
    const updateTime = () => setCurrentTime(utcStamp());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageInfo = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-soc-line bg-soc-surface/95 px-4 backdrop-blur md:px-5 print:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded p-1.5 text-soc-text-2 hover:bg-soc-raised hover:text-soc-text lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <nav className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-soc-muted" aria-label="Breadcrumb">
            <button onClick={() => onNavigate('dashboard')} className="hover:text-soc-text-2">
              Sentinel
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="truncate">{pageInfo.section}</span>
          </nav>
          <div className="flex items-baseline gap-2">
            <h1 className="truncate text-sm font-semibold text-soc-text">{pageInfo.title}</h1>
            <span className="hidden truncate text-[11px] text-soc-muted md:inline">{pageInfo.subtitle}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded border border-soc-line bg-soc-well px-2 py-1 font-mono text-[11px] text-soc-text-2 xl:flex">
          <Clock className="h-3.5 w-3.5 text-soc-muted" />
          <span className="tabular-nums">{currentTime || '—'}</span>
        </div>

        <button
          onClick={onOpenDemoNotice}
          className="hidden items-center gap-1.5 rounded border border-sev-medium/35 bg-sev-medium/[0.07] px-2 py-1 font-mono text-[10.5px] font-medium uppercase tracking-wider text-sev-medium hover:bg-sev-medium/10 md:flex"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Demo data
        </button>

        <button onClick={onQuickInvestigate} className="soc-btn soc-btn-primary">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New investigation</span>
          <span className="sm:hidden">Investigate</span>
        </button>
      </div>
    </header>
  );
};
