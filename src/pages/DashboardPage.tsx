import React, { useMemo } from 'react';
import {
  ShieldAlert,
  Globe,
  Lock,
  Search,
  ChevronRight,
  Fingerprint,
  Fish,
  MailWarning,
  Radar,
  LayoutDashboard,
  Globe2,
  ArrowUpRight,
} from 'lucide-react';
import { PageId } from '../types';
import { SAMPLE_INVESTIGATIONS, SAMPLE_THREAT_FEED } from '../data/mockData';
import { InvestigationSearchBar } from '../components/common/InvestigationSearchBar';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageHeader, Panel, KpiTile, DataTag, SeverityMeter, TrustScore } from '../components/ui/Soc';
import { SEVERITY_STYLES, SeverityKey, normalizeSeverity, normalizeVerdict } from '../lib/severity';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onSelectTarget: (target: string) => void;
  onOpenDemoNotice: () => void;
}

const SEVERITY_ORDER: SeverityKey[] = ['critical', 'high', 'medium', 'low', 'clean'];

// Illustrative attack-vector mix (static demo figures, not derived from live telemetry)
const ATTACK_VECTORS = [
  { name: 'Punycode / Homoglyph Spoofing', rate: 34, count: '1,160 cases' },
  { name: 'Credential Harvesting Landing Pages', rate: 29, count: '989 cases' },
  { name: 'SMS Smishing & Fake Delivery Redirections', rate: 21, count: '716 cases' },
  { name: 'Impersonated Enterprise SSO / OAuth Portals', rate: 16, count: '547 cases' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectTarget, onOpenDemoNotice }) => {
  const handleInvestigate = (target: string) => {
    onSelectTarget(target);
    onNavigate('website-investigation');
  };

  // All dashboard figures are derived from the bundled sample dataset.
  const stats = useMemo(() => {
    const total = SAMPLE_INVESTIGATIONS.length;
    const bySeverity = SEVERITY_ORDER.reduce<Record<SeverityKey, number>>(
      (acc, k) => ({ ...acc, [k]: 0 }),
      { critical: 0, high: 0, medium: 0, low: 0, clean: 0, unknown: 0 }
    );
    SAMPLE_INVESTIGATIONS.forEach((r) => {
      bySeverity[normalizeSeverity(r.severity)] += 1;
    });
    const malicious = SAMPLE_INVESTIGATIONS.filter((r) => normalizeVerdict(r.verdict) === 'Malicious').length;
    const highRisk = bySeverity.critical + bySeverity.high;
    const tlsAnomalies = SAMPLE_INVESTIGATIONS.filter((r) => r.tlsStatus.toLowerCase() !== 'valid').length;
    const activeIocs = SAMPLE_THREAT_FEED.filter((i) => i.status.toLowerCase() === 'active').length;
    return { total, bySeverity, malicious, highRisk, tlsAnomalies, activeIocs };
  }, []);

  const engines: Array<{ id: PageId; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'phishing-detection', label: 'Phishing Engine', desc: 'Homoglyph & punycode analysis', icon: Fish },
    { id: 'tls-certificate', label: 'TLS Intelligence', desc: 'Certificate chain & CT log audit', icon: Lock },
    { id: 'scam-analysis', label: 'Scam Analysis', desc: 'Email headers, SMS smishing', icon: MailWarning },
    { id: 'blockchain-verification', label: 'Ledger Verification', desc: 'Verify cryptographic ledgers', icon: Fingerprint },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={LayoutDashboard}
        title="SOC overview"
        description="Investigate URLs, domains and infrastructure. Detect punycode homoglyphs, brand impersonation, invalid TLS and weaponised redirect chains."
        actions={
          <>
            <DataTag kind="demo" label="Demo environment" />
            <button onClick={onOpenDemoNotice} className="soc-btn soc-btn-ghost h-7 text-[11px]">
              Disclaimer
            </button>
          </>
        }
      >
        <InvestigationSearchBar onInvestigate={handleInvestigate} />
      </PageHeader>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiTile label="Investigations" value={stats.total} hint="Sample case records" icon={Search} />
        <KpiTile label="Malicious verdicts" value={stats.malicious} hint={`${Math.round((stats.malicious / Math.max(1, stats.total)) * 100)}% of sample set`} icon={ShieldAlert} tone="critical" />
        <KpiTile label="High-risk targets" value={stats.highRisk} hint="Critical + high severity" icon={Globe} tone="high" />
        <KpiTile label="TLS anomalies" value={stats.tlsAnomalies} hint="Self-signed / untrusted / expired" icon={Lock} tone="medium" />
        <KpiTile label="Active IOCs" value={stats.activeIocs} hint={`of ${SAMPLE_THREAT_FEED.length} feed indicators`} icon={Radar} tone="low" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Left column */}
        <div className="space-y-4 xl:col-span-8">
          <Panel
            title="Threat severity distribution"
            subtitle={`${stats.total} sample investigations, classified by severity`}
            actions={<DataTag kind="demo" />}
          >
            <div className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-sm bg-soc-line">
              {SEVERITY_ORDER.map((k) =>
                stats.bySeverity[k] > 0 ? (
                  <div
                    key={k}
                    className={`h-full ${SEVERITY_STYLES[k].bar}`}
                    style={{ width: `${(stats.bySeverity[k] / Math.max(1, stats.total)) * 100}%` }}
                    title={`${SEVERITY_STYLES[k].label}: ${stats.bySeverity[k]}`}
                  />
                ) : null
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded border border-soc-line bg-soc-line sm:grid-cols-5">
              {SEVERITY_ORDER.map((k) => {
                const count = stats.bySeverity[k];
                const pct = ((count / Math.max(1, stats.total)) * 100).toFixed(1);
                return (
                  <div key={k} className="bg-soc-panel px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${SEVERITY_STYLES[k].dot}`} />
                      <span className="text-[11px] text-soc-text-2">{SEVERITY_STYLES[k].label}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between font-mono">
                      <span className="text-base font-semibold tabular-nums text-soc-text">{count}</span>
                      <span className="text-[10px] tabular-nums text-soc-muted">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel
            title="Recent investigation activity"
            subtitle="Audit stream of domain scans and threat evaluations"
            flush
            actions={
              <>
                <DataTag kind="demo" />
                <button onClick={() => onNavigate('history')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                  Full history ({SAMPLE_INVESTIGATIONS.length})
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </>
            }
          >
            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th className="w-8">Sev</th>
                    <th>Case ID</th>
                    <th>Target</th>
                    <th>Verdict</th>
                    <th>Trust</th>
                    <th>Primary indicators</th>
                    <th>ASN</th>
                    <th>Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_INVESTIGATIONS.map((inv) => (
                    <tr
                      key={inv.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        onSelectTarget(inv.target);
                        onNavigate('website-investigation');
                      }}
                    >
                      <td>
                        <SeverityMeter level={inv.severity} />
                      </td>
                      <td className="whitespace-nowrap font-mono text-soc-muted">{inv.id}</td>
                      <td className="max-w-[220px] truncate font-mono font-medium text-soc-text">{inv.target}</td>
                      <td className="whitespace-nowrap">
                        <StatusBadge verdict={inv.verdict} size="sm" />
                      </td>
                      <td className="whitespace-nowrap">
                        <TrustScore score={inv.trustScore} />
                      </td>
                      <td className="max-w-[240px] truncate">{inv.categories.join(' · ')}</td>
                      <td className="max-w-[160px] truncate font-mono text-soc-muted">{inv.asn}</td>
                      <td className="whitespace-nowrap font-mono text-soc-muted">{inv.timestamp.split(' ')[0]}</td>
                      <td className="whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-soc-accent group-hover:text-soc-accent-hi">
                          Inspect
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-4 xl:col-span-4">
          <Panel
            title="IOC watchlist"
            icon={Globe2}
            flush
            actions={
              <button onClick={() => onNavigate('threat-intelligence')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                Feed
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
          >
            <ul className="divide-y divide-soc-line">
              {SAMPLE_THREAT_FEED.slice(0, 4).map((ioc) => (
                <li key={ioc.id} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="soc-chip mt-0.5 w-[74px] justify-center">{ioc.type === 'Phishing Campaign' ? 'Campaign' : ioc.type}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs text-soc-text">{ioc.indicator}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-soc-muted">
                      <span className="truncate">{ioc.threatActor || 'Unclassified'}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{ioc.lastActive}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-soc-text-2">{ioc.confidence}%</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-soc-line px-4 py-2">
              <DataTag kind="demo" label="Demo IOC feed" />
            </div>
          </Panel>

          <Panel title="Dominant attack vectors" actions={<DataTag kind="demo" label="Illustrative" />}>
            <div className="space-y-3">
              {ATTACK_VECTORS.map((vec) => (
                <div key={vec.name}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-soc-text-2" title={vec.name}>
                      {vec.name}
                    </span>
                    <span className="font-mono font-semibold tabular-nums text-soc-text">{vec.rate}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-sm bg-soc-line">
                    <div className="h-full rounded-sm bg-soc-forest-2" style={{ width: `${vec.rate}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-soc-muted">{vec.count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Detection engines" flush>
            <div className="grid grid-cols-1 divide-y divide-soc-line">
              {engines.map((e) => {
                const Icon = e.icon;
                return (
                  <button
                    key={e.id}
                    onClick={() => onNavigate(e.id)}
                    className="group flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-soc-raised"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-soc-muted group-hover:text-soc-accent" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-soc-text">{e.label}</div>
                      <div className="text-[11px] text-soc-muted">{e.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-soc-muted group-hover:text-soc-accent" />
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};
