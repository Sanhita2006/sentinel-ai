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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PageId } from '../../types';

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

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'website-investigation', label: 'Website Investigation', icon: Search },
      { id: 'history', label: 'Investigation History', icon: History, badge: '7 New' },
    ],
  },
  {
    title: 'DETECTION ENGINES',
    items: [
      { id: 'phishing-detection', label: 'Phishing Detection', icon: Fish },
      { id: 'tls-certificate', label: 'TLS Intelligence', icon: Lock },
      { id: 'scam-analysis', label: 'Scam Message Analysis', icon: MailWarning },
      { id: 'security-assessment', label: 'Security Assessment', icon: ShieldAlert },
    ],
  },
  {
    title: 'INTELLIGENCE & TRUST',
    items: [
      { id: 'threat-intelligence', label: 'Threat Intelligence', icon: Globe2, badge: 'Live Feed' },
      { id: 'blockchain-verification', label: 'Blockchain Verification', icon: Blocks },
      { id: 'reports', label: 'Reports & Compliance', icon: FileText },
    ],
  },
  {
    title: 'COPILOT & SYSTEM',
    items: [
      { id: 'ai-assistant', label: 'AI Security Assistant', icon: Bot, badge: 'Gemini' },
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
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#070b15] border-r border-slate-800/80 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#060913]">
          <div
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/60 shrink-0">
              <Shield className="w-5 h-5 text-black" />
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-wider text-white whitespace-nowrap">
                  SENTINEL <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest truncate">
                  Cyber Trust SOC
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {isOpen && (
                <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
                  {section.title}
                </div>
              )}
              <div className="space-y-1 pt-1">
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
                      title={!isOpen ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group text-left ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                        }`}
                      />

                      {isOpen && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info: Demo disclaimer pill & Version */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060912]">
          {isOpen ? (
            <div className="space-y-2">
              <button
                onClick={onOpenDemoNotice}
                className="w-full text-left p-2 rounded-lg bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/30 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300">
                  <span>DEMO DATA ACTIVE</span>
                  <ExternalLink className="w-3 h-3 text-amber-400" />
                </div>
                <p className="text-[10px] text-amber-200/80 mt-0.5 leading-snug">
                  Hackathon Prototype. Simulated threat scores.
                </p>
              </button>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>SOC BUILD v1.0.4</span>
                <span className="text-emerald-400 font-semibold">ALL SYSTEMS NOMINAL</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenDemoNotice}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400 hover:text-amber-300"
              title="Demo Data Notice"
            >
              <span className="text-[10px] font-bold font-mono">DEMO</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
