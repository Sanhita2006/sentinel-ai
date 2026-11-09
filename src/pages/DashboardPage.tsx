import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Globe,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  Zap,
  ExternalLink,
  ChevronRight,
  Fingerprint,
  Mail,
  Search,
} from 'lucide-react';
import { PageId, InvestigationRecord } from '../types';
import { SAMPLE_INVESTIGATIONS, SAMPLE_THREAT_FEED } from '../data/mockData';
import { InvestigationSearchBar } from '../components/common/InvestigationSearchBar';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectTarget: (target: string) => void;
  onOpenDemoNotice: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTarget,
  onOpenDemoNotice,
}) => {
  const handleInvestigate = (target: string) => {
    onSelectTarget(target);
    onNavigate('website-investigation');
  };

  const metrics = [
    {
      title: 'TOTAL INVESTIGATIONS',
      value: '14,892',
      change: '+18.4%',
      trend: 'up',
      subtitle: 'Trailing 30-day volume',
      icon: Search,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'THREATS NEUTRALIZED',
      value: '3,412',
      change: '+24.1%',
      trend: 'up',
      subtitle: '22.9% Threat detection rate',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'HIGH-RISK DOMAINS',
      value: '879',
      change: '+12.3%',
      trend: 'up',
      subtitle: 'Under active mitigation',
      icon: Globe,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'TLS ANOMALIES FLAGGED',
      value: '412',
      change: '-4.2%',
      trend: 'down',
      subtitle: 'Expired & spoofed certificates',
      icon: Lock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
  ];

  // Threat severity breakdown counts
  const severityBreakdown = [
    { label: 'Critical Threat', count: 1248, percentage: 36.5, color: 'bg-rose-500' },
    { label: 'High Risk', count: 984, percentage: 28.8, color: 'bg-orange-500' },
    { label: 'Suspicious / Medium', count: 680, percentage: 19.9, color: 'bg-amber-500' },
    { label: 'Low / Minor', count: 340, percentage: 10.0, color: 'bg-blue-500' },
    { label: 'Clean / Safe', count: 160, percentage: 4.8, color: 'bg-emerald-500' },
  ];

  // Attack vectors distribution
  const attackVectors = [
    { name: 'Punycode / Homoglyph Spoofing', rate: '34%', count: '1,160 cases' },
    { name: 'Credential Harvesting Landing Pages', rate: '29%', count: '989 cases' },
    { name: 'SMS Smishing & Fake Delivery Redirections', rate: '21%', count: '716 cases' },
    { name: 'Impersonated Enterprise SSO / OAuth Portals', rate: '16%', count: '547 cases' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner with Prominent Search Bar */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#0b1224] to-[#070b16] border border-cyan-500/20 p-6 md:p-8 shadow-[0_0_30px_rgba(6,182,212,0.06)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-semibold rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                INTELLIGENCE GRID ONLINE
              </span>
              <span className="text-xs text-slate-400">· Real-time Web Threat Radar</span>
            </div>

            <button
              onClick={onOpenDemoNotice}
              className="text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 font-mono"
            >
              Demo Environment Disclaimer
            </button>
          </div>

          <div className="max-w-2xl">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Investigate Any URL, Domain, or Infrastructure
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Detect deceptive punycode homoglyphs, brand impersonations, invalid TLS certificates, and weaponized redirect chains before users fall victim.
            </p>
          </div>

          <div className="pt-2">
            <InvestigationSearchBar onInvestigate={handleInvestigate} />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="p-5 rounded-xl bg-[#090e1c] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium tracking-wider text-slate-400">
                  {m.title}
                </span>
                <div className={`p-2 rounded-lg border ${m.bgColor}`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
                    {m.value}
                  </span>
                  <span
                    className={`text-xs font-mono font-semibold flex items-center ${
                      m.trend === 'up' ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{m.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Threat Severity Breakdown & Attack Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Threat Severity Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Classified threat breakdown across 3,412 confirmed malicious findings (Demo Data)
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono rounded bg-slate-900 border border-slate-800 text-slate-300">
              30-Day Snapshot
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-800 rounded-lg overflow-hidden flex gap-0.5 p-0.5 border border-slate-700/60">
              {severityBreakdown.map((item) => (
                <div
                  key={item.label}
                  style={{ width: `${item.percentage}%` }}
                  className={`h-full ${item.color} rounded-sm transition-all duration-300`}
                  title={`${item.label}: ${item.percentage}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {severityBreakdown.map((item) => (
                <div key={item.label} className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[11px] text-slate-400 truncate">{item.label}</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between font-mono">
                    <span className="text-sm font-bold text-white tabular-nums">
                      {item.count}
                    </span>
                    <span className="text-[10px] text-slate-400 tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('phishing-detection')}
              className="p-3 text-left rounded-lg bg-[#0c1326] hover:bg-[#121c38] border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  Phishing Engine
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Homoglyph & Punycode analysis</p>
            </button>

            <button
              onClick={() => onNavigate('tls-certificate')}
              className="p-3 text-left rounded-lg bg-[#0c1326] hover:bg-[#121c38] border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  TLS Intelligence
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Certificate chain & CT log audit</p>
            </button>

            <button
              onClick={() => onNavigate('scam-analysis')}
              className="p-3 text-left rounded-lg bg-[#0c1326] hover:bg-[#121c38] border border-slate-800 hover:border-cyan-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  Scam Analysis
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Email headers, SMS smishing</p>
            </button>
          </div>
        </div>

        {/* Attack Vector Matrix */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Dominant Attack Vectors
            </h3>
            <span className="text-xs text-cyan-400 font-mono">Q4 2026</span>
          </div>

          <div className="space-y-3.5">
            {attackVectors.map((vec) => (
              <div key={vec.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[200px]" title={vec.name}>
                    {vec.name}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">{vec.rate}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: vec.rate }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{vec.count}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigate('blockchain-verification')}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#070b15] hover:bg-slate-800/50 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Verify Cryptographic Ledgers</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Investigation Activity Table */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recent Investigation Activity
            </h3>
            <p className="text-xs text-slate-400">
              Live audit stream of domain scans and threat intelligence evaluations
            </p>
          </div>

          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View Complete History (14,892)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Target Domain / URL</th>
                <th className="py-3 px-3">Verdict</th>
                <th className="py-3 px-3">Trust Score</th>
                <th className="py-3 px-3">Primary Threat Indicators</th>
                <th className="py-3 px-3">ASN Infrastructure</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {SAMPLE_INVESTIGATIONS.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => {
                    onSelectTarget(inv.target);
                    onNavigate('website-investigation');
                  }}
                >
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {inv.id}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-white max-w-[220px] truncate">
                    <span className="group-hover:text-cyan-300 transition-colors">
                      {inv.target}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge verdict={inv.verdict} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                    <span
                      className={
                        inv.trustScore < 30
                          ? 'text-rose-400'
                          : inv.trustScore < 70
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      {inv.trustScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[240px] truncate text-slate-300">
                    {inv.categories.join(' · ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 max-w-[160px] truncate">
                    {inv.asn}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {inv.timestamp.split(' ')[0]}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
