import React from 'react';
import {
  LayoutDashboard,
  Search,
  Fish,
  Lock,
  MailWarning,
  ShieldAlert,
  Globe2,
  Blocks,
  History,
  FileText,
  Bot,
  Settings,
  Shield,
  ChevronsLeft,
  ChevronsRight,
  FlaskConical,
  X,
} from 'lucide-react';
import { PageId } from '../../types';
import { SAMPLE_INVESTIGATIONS } from '../../data/mockData';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDemoNotice: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    id: PageId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'website-investigation', label: 'Website Investigation', icon: Search },
      { id: 'history', label: 'Investigation History', icon: History, badge: String(SAMPLE_INVESTIGATIONS.length) },
    ],
  },
  {
    title: 'Detection Engines',
    items: [
      { id: 'phishing-detection', label: 'Phishing Detection', icon: Fish },
      { id: 'tls-certificate', label: 'TLS Intelligence', icon: Lock },
      { id: 'scam-analysis', label: 'Scam Message Analysis', icon: MailWarning },
      { id: 'security-assessment', label: 'Security Assessment', icon: ShieldAlert },
    ],
  },
  {
    title: 'Intelligence & Trust',
    items: [
      { id: 'threat-intelligence', label: 'Threat Intelligence', icon: Globe2, badge: 'Demo' },
      { id: 'blockchain-verification', label: 'Blockchain Verification', icon: Blocks },
      { id: 'reports', label: 'Reports & Compliance', icon: FileText },
    ],
  },
  {
    title: 'Copilot & System',
    items: [
      { id: 'ai-assistant', label: 'AI Security Assistant', icon: Bot, badge: 'Beta' },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isOpen,
  onToggle,
  isMobileOpen,
  onCloseMobile,
  onOpenDemoNotice,
}) => {
  // On mobile the drawer is always shown expanded.
  const expanded = isOpen || isMobileOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-soc-bg/80 lg:hidden print:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-soc-line bg-soc-surface transition-[width,transform] duration-200 print:hidden ${
          isOpen ? 'w-60' : 'w-60 lg:w-16'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between gap-2 border-b border-soc-line px-3">
          <button
            className="flex min-w-0 items-center gap-2.5 text-left"
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-soc-forest-2 bg-soc-forest">
              <Shield className="h-4 w-4 text-soc-accent-hi" />
            </div>
            {expanded && (
              <div className="min-w-0 leading-tight">
                <div className="text-[13px] font-semibold tracking-wide text-soc-text">
                  SENTINEL <span className="text-soc-accent">AI</span>
                </div>
                <div className="truncate font-mono text-[9.5px] uppercase tracking-[0.14em] text-soc-muted">
                  Cyber Trust SOC
                </div>
              </div>
            )}
          </button>

          <button
            onClick={onToggle}
            className="hidden h-7 w-7 items-center justify-center rounded text-soc-muted hover:bg-soc-raised hover:text-soc-text lg:flex"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
          </button>
          <button
            onClick={onCloseMobile}
            className="flex h-7 w-7 items-center justify-center rounded text-soc-muted hover:bg-soc-raised hover:text-soc-text lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3" aria-label="Primary">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {expanded ? (
                <div className="soc-label px-2.5 pb-1.5">{section.title}</div>
              ) : (
                <div className="mx-auto mb-1.5 h-px w-6 bg-soc-line" />
              )}
              <div className="space-y-px">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onCloseMobile();
                      }}
                      title={!expanded ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group relative flex h-8 w-full items-center gap-2.5 rounded px-2.5 text-left text-[12.5px] transition-colors ${
                        isActive
                          ? 'bg-soc-forest/70 text-soc-text'
                          : 'text-soc-text-2 hover:bg-soc-raised hover:text-soc-text'
                      } ${!expanded ? 'justify-center px-0' : ''}`}
                    >
                      {isActive && <span className="absolute inset-y-1 left-0 w-[2px] rounded-r bg-soc-accent" />}
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-soc-accent-hi' : 'text-soc-muted group-hover:text-soc-text-2'
                        }`}
                      />
                      {expanded && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-[3px] border border-soc-line-strong bg-soc-well px-1.5 font-mono text-[9.5px] leading-4 text-soc-muted">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-soc-line p-2.5">
          {expanded ? (
            <div className="space-y-2">
              <button
                onClick={onOpenDemoNotice}
                className="w-full rounded border border-sev-medium/30 bg-sev-medium/[0.06] px-2.5 py-2 text-left transition-colors hover:bg-sev-medium/10"
              >
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sev-medium">
                  <FlaskConical className="h-3 w-3" />
                  Demo data active
                </div>
                <p className="mt-0.5 text-[10.5px] leading-snug text-soc-text-2">
                  Hackathon prototype. Sample panels use simulated threat scores.
                </p>
              </button>
              <div className="flex items-center justify-between px-1 font-mono text-[9.5px] uppercase tracking-wider text-soc-muted">
                <span>SOC build v1.0.4</span>
                <span>UI only</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenDemoNotice}
              className="flex w-full items-center justify-center rounded border border-sev-medium/30 bg-sev-medium/[0.06] py-1.5 text-sev-medium"
              title="Demo data notice"
              aria-label="Demo data notice"
            >
              <FlaskConical className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
