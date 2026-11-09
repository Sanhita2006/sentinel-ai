import React, { useMemo, useState } from 'react';
import {
  Search,
  Globe,
  Shield,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  FileCode,
  Download,
  Blocks,
  CheckCircle2,
  XCircle,
  Copy,
  Info,
  Sparkles,
  Terminal,
  Activity,
  Ban,
  Check,
  Loader2,
  Circle,
  ChevronRight,
} from 'lucide-react';
import { PageId, InvestigationRecord } from '../types';
import {
  SAMPLE_INVESTIGATIONS,
  SAMPLE_DNS_RECORDS,
  SAMPLE_SECURITY_HEADERS,
  SAMPLE_TLS_CERTIFICATE,
  SAMPLE_PHISHING_VECTORS,
} from '../data/mockData';
import { InvestigationSearchBar } from '../components/common/InvestigationSearchBar';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { SeverityBar } from '../components/common/SeverityBar';
import { PageHeader, Panel, DataTag, KV, Notice, Segmented, EmptyState } from '../components/ui/Soc';
import { SEVERITY_STYLES, normalizeSeverity, verdictSeverity } from '../lib/severity';

export interface RealInvestigationResponse {
  success: boolean;
  isRealScan: boolean;
  id: string;
  timestamp: string;
  parsedUrl: {
    rawInput: string;
    normalizedUrl: string;
    protocol: string;
    hostname: string;
    domain: string;
    subdomain: string;
    tld: string;
    port: string;
    pathname: string;
    search: string;
    isIpAddress: boolean;
    ipVersion: 'IPv4' | 'IPv6' | null;
  };
  scoreAssessment: {
    trustScore: number;
    verdict: 'Malicious' | 'Suspicious' | 'Clean';
    severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
    totalDeductions: number;
    deductionBreakdown: Array<{
      id: string;
      source: string;
      title: string;
      pointsDeducted: number;
      reason: string;
    }>;
    scoringSummary: string;
  };
  findings: Array<{
    id: string;
    source: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
    title: string;
    description: string;
    evidence: string;
    confidence: number;
    deductionPoints: number;
  }>;
  dns: {
    resolves: boolean;
    aRecords: string[];
    aaaaRecords: string[];
    mxRecords: Array<{ exchange: string; priority: number }>;
    txtRecords: string[];
    nsRecords: string[];
    spfConfigured: boolean;
    error?: string;
  };
  threatFeeds: Array<{
    source: 'Google Safe Browsing' | 'URLhaus Intelligence';
    status: 'clean' | 'flagged' | 'unavailable';
    details: string;
    threatType?: string;
  }>;
  geminiExplanation: {
    status: 'available' | 'unavailable';
    modelUsed?: string;
    rawExplanation?: string;
  } | null;
  hashProof: string;
}

interface WebsiteInvestigationPageProps {
  currentTarget: string;
  onSelectTarget: (target: string) => void;
  onNavigate: (page: PageId) => void;
  onOpenDemoNotice: () => void;
}

type TabId = 'overview' | 'dns' | 'tls' | 'headers' | 'whois' | 'raw';

/* ------------------------------------------------------------------ */
/* Local building blocks                                               */
/* ------------------------------------------------------------------ */

const DossierTabs: React.FC<{
  active: TabId;
  onChange: (t: TabId) => void;
  whoisLabel: string;
}> = ({ active, onChange, whoisLabel }) => {
  const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Threat Overview', icon: Shield },
    { id: 'dns', label: 'DNS Infrastructure', icon: Server },
    { id: 'tls', label: 'TLS / SSL Certificate', icon: Lock },
    { id: 'headers', label: 'Security Headers', icon: Layers },
    { id: 'whois', label: whoisLabel, icon: Globe },
    { id: 'raw', label: 'Forensic JSON', icon: FileCode },
  ];
  return (
    <div className="soc-panel flex items-center overflow-x-auto px-2" role="tablist">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            data-active={active === tab.id}
            onClick={() => onChange(tab.id)}
            className="soc-tab"
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const VerdictBanner: React.FC<{
  caseId: string;
  verdict: string;
  severity: string;
  timestamp: string;
  target: string;
  provenance: React.ReactNode;
  meta?: React.ReactNode;
  vectors: React.ReactNode;
  trustScore: number;
  onNavigate: (page: PageId) => void;
}> = ({ caseId, verdict, severity, timestamp, target, provenance, meta, vectors, trustScore, onNavigate }) => {
  const sevKey = verdictSeverity(verdict);
  return (
    <section className="soc-panel relative overflow-hidden">
      <span className={`absolute inset-y-0 left-0 w-[3px] ${SEVERITY_STYLES[sevKey].bar}`} aria-hidden />
      <div className="flex flex-col gap-4 p-4 pl-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-soc-muted">{caseId}</span>
            <StatusBadge verdict={verdict} />
            <SeverityBadge level={severity} />
            {provenance}
            <span className="font-mono text-[11px] text-soc-muted">{timestamp}</span>
          </div>
          <h3 className="break-all font-mono text-lg font-semibold tracking-tight text-soc-text md:text-xl">{target}</h3>
          {meta}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="soc-label mr-1">Classified vectors</span>
            {vectors}
          </div>
        </div>

        <div className="w-full shrink-0 space-y-3 rounded border border-soc-line bg-soc-well p-3 lg:w-72">
          <SeverityBar score={trustScore} />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => onNavigate('blockchain-verification')} className="soc-btn h-7 text-[11px]">
              <Blocks className="h-3.5 w-3.5" />
              Ledger proof
            </button>
            <button onClick={() => onNavigate('reports')} className="soc-btn h-7 text-[11px]">
              <Download className="h-3.5 w-3.5" />
              Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeaderStatusPill: React.FC<{ status: string }> = ({ status }) => {
  const s = status.toLowerCase();
  const sev = s === 'present' ? 'clean' : s === 'misconfigured' ? 'medium' : 'critical';
  const st = SEVERITY_STYLES[sev];
  return (
    <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase tracking-wider ${st.bg} ${st.border} ${st.text}`}>
      {status}
    </span>
  );
};

const SecurityHeadersTable: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="soc-table">
      <thead>
        <tr>
          <th>Header</th>
          <th>Status</th>
          <th>Severity</th>
          <th>Current value</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        {SAMPLE_SECURITY_HEADERS.map((h) => (
          <tr key={h.name}>
            <td className="whitespace-nowrap font-mono font-medium text-soc-text">{h.name}</td>
            <td>
              <HeaderStatusPill status={h.status} />
            </td>
            <td>
              <SeverityBadge level={h.severity} />
            </td>
            <td className="max-w-[200px] truncate font-mono text-[11px]">{h.value || <span className="text-soc-muted">—</span>}</td>
            <td className="min-w-[260px] text-[11px] leading-relaxed">{h.recommendation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RecordList: React.FC<{ title: string; items: React.ReactNode[]; empty: string }> = ({ title, items, empty }) => (
  <div className="soc-well p-3">
    <div className="soc-label mb-2">{title}</div>
    {items.length > 0 ? (
      <ul className="max-h-48 space-y-1 overflow-y-auto font-mono text-[11px]">{items}</ul>
    ) : (
      <p className="font-mono text-[11px] text-soc-muted">{empty}</p>
    )}
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const WebsiteInvestigationPage: React.FC<WebsiteInvestigationPageProps> = ({
  currentTarget,
  onSelectTarget,
  onNavigate,
  onOpenDemoNotice,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Phase 2 Live Backend State
  const [activeScanMode, setActiveScanMode] = useState<'live' | 'demo'>('live');
  const [realScanResult, setRealScanResult] = useState<RealInvestigationResponse | null>(null);
  const [apiError, setApiError] = useState<{
    message: string;
    isBlockedBySsrf?: boolean;
    isMalformed?: boolean;
    target?: string;
    status?: number;
  } | null>(null);

  // Fallback demo matched record for demo tab / comparison.
  // Memoised so the generated demo case ID stays stable between renders.
  const matchedDemoRecord: InvestigationRecord = useMemo(() => {
    const t = currentTarget.toLowerCase();
    const isCleanish = t.includes('clean') || t.includes('stripe') || t.includes('github');
    return (
      SAMPLE_INVESTIGATIONS.find(
        (r) => r.target.toLowerCase().includes(t) || t.includes(r.target.split(' ')[0].toLowerCase())
      ) || {
        id: `INV-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
        target: currentTarget || 'secure-login-chase-update.info',
        targetType: 'domain',
        verdict: isCleanish ? 'Clean' : 'Malicious',
        severity: isCleanish ? 'clean' : 'critical',
        trustScore: isCleanish ? 98 : 14,
        categories: ['Simulated Target Evaluation', 'Punycode / Homoglyph Check', 'Heuristic Flagging'],
        timestamp: '2026-11-07 18:05:12 UTC',
        investigator: 'Analyst SOC-03',
        ipAddress: '194.26.29.114',
        country: 'Seychelles',
        countryCode: 'SC',
        asn: 'AS208657 - Fenix Host LTD',
        tlsStatus: 'Self-Signed',
        hashProof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      }
    );
  }, [currentTarget]);

  // Run real investigation against backend API
  const handleStartInvestigation = async (target: string) => {
    onSelectTarget(target);
    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const response = await fetch('/api/investigate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: target,
          enableGemini: true,
        }),
      });

      clearInterval(stepInterval);
      setAnalysisStep(5);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        setApiError({
          message: errorJson.error || `HTTP error ${response.status}: Failed to analyze target`,
          isBlockedBySsrf: Boolean(errorJson.isBlockedBySsrf),
          isMalformed: Boolean(errorJson.isMalformed),
          target: errorJson.target || target,
          status: response.status,
        });
        setIsAnalyzing(false);
        return;
      }

      const scanData: RealInvestigationResponse = await response.json();
      setRealScanResult(scanData);
      setActiveScanMode('live');
      setIsAnalyzing(false);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setApiError({
        message: err.message || 'Network connection failed while connecting to Sentinel AI backend engine.',
        target,
      });
    }
  };

  const copyHashToClipboard = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyJson = (value: unknown) => {
    navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const analysisStepsLabels = [
    'Parsing & normalizing FQDN, validating SSRF safety bounds',
    'Multi-vector DNS zone resolution (A, AAAA, MX, TXT, NS)',
    'Lexical heuristics, homoglyph detection & keyword correlation',
    'Querying external threat feeds (Google Safe Browsing & URLhaus)',
    'Trust score deductions & AI analyst explanation',
  ];

  const errorBadge = apiError
    ? apiError.isBlockedBySsrf
      ? `BLOCKED${apiError.status ? ` · HTTP ${apiError.status}` : ''}`
      : apiError.status
      ? `HTTP ${apiError.status}`
      : 'NETWORK ERROR'
    : '';

  // Defensive accessors: tolerate partial backend payloads without crashing the dossier.
  const live = realScanResult;
  const liveFindings = live?.findings ?? [];
  const liveFeeds = live?.threatFeeds ?? [];
  const liveDeductions = live?.scoreAssessment?.deductionBreakdown ?? [];
  const liveDns = live?.dns ?? {
    resolves: false,
    aRecords: [],
    aaaaRecords: [],
    mxRecords: [],
    txtRecords: [],
    nsRecords: [],
    spfConfigured: false,
  };

  const showLive = !isAnalyzing && !!live && activeScanMode === 'live';
  const showDemo = !isAnalyzing && (!live || activeScanMode === 'demo');

  return (
    <div className="soc-page">
      {/* Investigation input */}
      <PageHeader
        icon={Search}
        title="Website & domain threat investigation"
        description="Submit a full URL, hostname or IP for multi-vector inspection."
        actions={
          <>
            <span className="soc-label">Engine mode</span>
            {live && activeScanMode === 'live' ? (
              <DataTag kind="live" label="Real engine" />
            ) : (
              <DataTag kind="simulated" label="Demo simulation" />
            )}
            {live && (
              <Segmented
                ariaLabel="Result source"
                value={activeScanMode}
                onChange={setActiveScanMode}
                options={[
                  { value: 'live', label: 'Live scan' },
                  { value: 'demo', label: 'Demo preset' },
                ]}
              />
            )}
          </>
        }
      >
        <InvestigationSearchBar
          onInvestigate={handleStartInvestigation}
          initialValue={currentTarget || (live ? live.parsedUrl.rawInput : matchedDemoRecord.target)}
        />
      </PageHeader>

      {/* Request / SSRF error */}
      {apiError && (
        <section
          className={`soc-panel relative overflow-hidden ${
            apiError.isBlockedBySsrf ? 'border-sev-critical/40' : apiError.isMalformed ? 'border-sev-medium/40' : 'border-sev-high/35'
          }`}
          role="alert"
        >
          <span
            className={`absolute inset-y-0 left-0 w-[3px] ${
              apiError.isBlockedBySsrf ? 'bg-sev-critical' : apiError.isMalformed ? 'bg-sev-medium' : 'bg-sev-high'
            }`}
          />
          <div className="flex items-start gap-3 p-4 pl-5">
            {apiError.isBlockedBySsrf ? (
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-sev-critical" />
            ) : apiError.isMalformed ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sev-medium" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-sev-high" />
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-soc-text">
                  {apiError.isBlockedBySsrf
                    ? 'SSRF security violation: prohibited address space'
                    : apiError.isMalformed
                    ? 'Malformed URL input'
                    : 'Investigation request error'}
                </span>
                <span className="soc-chip">{errorBadge}</span>
                {apiError.target && <span className="truncate font-mono text-[11px] text-soc-muted">{apiError.target}</span>}
              </div>
              <p className="text-xs leading-relaxed text-soc-text-2">{apiError.message}</p>
              {apiError.isBlockedBySsrf && (
                <p className="font-mono text-[11px] leading-relaxed text-soc-muted">
                  SENTINEL AI enforces SSRF RFC-1918 / RFC-3927 guardrails. Outgoing connections to private networks,
                  127.0.0.1, localhost and link-local cloud metadata endpoints (169.254.169.254) are rejected by design.
                </p>
              )}
              {apiError.status === 404 && (
                <p className="text-[11px] text-soc-muted">
                  The backend did not expose <code className="font-mono text-soc-text-2">POST /api/investigate</code>. Check that the
                  investigation route is mounted on the server.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button onClick={() => handleStartInvestigation('https://github.com')} className="soc-btn h-7 text-[11px]">
                  Test legitimate target (github.com)
                </button>
                <button onClick={() => setApiError(null)} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live pipeline progress */}
      {isAnalyzing && (
        <Panel
          title={
            <span className="normal-case tracking-normal">
              Live URL investigation · <span className="font-mono text-soc-accent-hi">{currentTarget}</span>
            </span>
          }
          icon={Activity}
          actions={<DataTag kind="live" label="Engine running" />}
        >
          <div className="relative mb-4 h-1 w-full overflow-hidden rounded-sm bg-soc-line">
            <div
              className="h-full rounded-sm bg-soc-accent transition-all duration-300"
              style={{ width: `${(analysisStep / 5) * 100}%` }}
            />
          </div>
          <ol className="grid grid-cols-1 gap-2 md:grid-cols-5">
            {analysisStepsLabels.map((label, i) => {
              const stepNo = i + 1;
              const done = analysisStep > stepNo;
              const running = analysisStep === stepNo;
              return (
                <li
                  key={label}
                  className={`soc-well flex items-start gap-2 p-2.5 text-[11px] ${running ? 'border-soc-forest-2' : ''}`}
                >
                  {done ? (
                    <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-soc-accent" />
                  ) : running ? (
                    <Loader2 className="mt-px h-3.5 w-3.5 shrink-0 animate-spin text-soc-accent-hi" />
                  ) : (
                    <Circle className="mt-px h-3.5 w-3.5 shrink-0 text-soc-line-strong" />
                  )}
                  <div>
                    <div className="soc-label">Step {stepNo}</div>
                    <div className={done || running ? 'text-soc-text' : 'text-soc-muted'}>{label}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>
      )}

      {/* ============================ LIVE RESULT ============================ */}
      {showLive && live && (
        <div className="space-y-4">
          <VerdictBanner
            caseId={live.id}
            verdict={live.scoreAssessment.verdict}
            severity={live.scoreAssessment.severity}
            timestamp={live.timestamp}
            target={live.parsedUrl.normalizedUrl}
            trustScore={live.scoreAssessment.trustScore}
            onNavigate={onNavigate}
            provenance={<DataTag kind="live" label="Live scan engine result" />}
            meta={
              live.parsedUrl.hostname !== live.parsedUrl.rawInput && (
                <p className="font-mono text-[11px] text-soc-muted">
                  Hostname <span className="text-soc-text-2">{live.parsedUrl.hostname}</span>
                  {live.parsedUrl.subdomain && <span> · subdomain {live.parsedUrl.subdomain}</span>}
                  <span> · TLD .{live.parsedUrl.tld || 'none'}</span>
                </p>
              )
            }
            vectors={
              liveFindings.length > 0 ? (
                liveFindings.map((f) => {
                  const st = SEVERITY_STYLES[normalizeSeverity(f.severity)];
                  return (
                    <span key={f.id} className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10.5px] ${st.bg} ${st.border} ${st.text}`}>
                      {f.title}
                    </span>
                  );
                })
              ) : (
                <span className="text-[11px] text-soc-muted">No findings reported</span>
              )
            }
          />

          <DossierTabs active={activeTab} onChange={setActiveTab} whoisLabel="Geo & Host" />

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <Panel
                title="AI analyst evidence explanation"
                icon={Sparkles}
                actions={
                  live.geminiExplanation?.status === 'available' ? (
                    <span className="soc-chip">
                      <CheckCircle2 className="h-3 w-3 text-soc-accent" />
                      Model: {live.geminiExplanation.modelUsed || 'not reported'}
                    </span>
                  ) : (
                    <span className="soc-chip">
                      <Info className="h-3 w-3" />
                      Empirical telemetry mode
                    </span>
                  )
                }
              >
                <div className="soc-well whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-soc-text-2">
                  {live.geminiExplanation?.rawExplanation ||
                    'Empirical findings have been cataloged below by Sentinel AI heuristic and DNS engines.'}
                </div>
              </Panel>

              <Panel title="Integrated threat intelligence feeds" icon={Activity} flush>
                {liveFeeds.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-soc-muted">No feed results were returned with this scan.</p>
                ) : (
                  <table className="soc-table">
                    <thead>
                      <tr>
                        <th>Feed</th>
                        <th>Status</th>
                        <th>Threat type</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveFeeds.map((feed) => {
                        const s = String(feed.status).toLowerCase();
                        const st = SEVERITY_STYLES[s === 'flagged' ? 'critical' : s === 'clean' ? 'clean' : 'unknown'];
                        return (
                          <tr key={feed.source}>
                            <td className="whitespace-nowrap font-medium text-soc-text">{feed.source}</td>
                            <td>
                              <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase ${st.bg} ${st.border} ${st.text}`}>
                                {s === 'unavailable' ? 'Unavailable' : feed.status}
                              </span>
                            </td>
                            <td className="font-mono text-[11px]">{feed.threatType || '—'}</td>
                            <td className="text-[11px]">{feed.details}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </Panel>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Panel
                  className="lg:col-span-3"
                  title={`Empirical findings & evidence (${liveFindings.length})`}
                  actions={<span className="soc-label">Zero-fabrication</span>}
                  flush
                >
                  {liveFindings.length === 0 ? (
                    <EmptyState icon={CheckCircle2} title="No findings">
                      The scan engines did not report any risk findings for this target.
                    </EmptyState>
                  ) : (
                    <ul className="divide-y divide-soc-line">
                      {liveFindings.map((f) => {
                        const st = SEVERITY_STYLES[normalizeSeverity(f.severity)];
                        return (
                          <li key={f.id} className="relative space-y-1.5 px-4 py-3 pl-5 text-xs">
                            <span className={`absolute inset-y-3 left-0 w-[3px] rounded-r ${st.bar}`} />
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-soc-text">{f.title}</span>
                                  <SeverityBadge level={f.severity} />
                                </div>
                                <span className="font-mono text-[10px] text-soc-muted">Source: {f.source}</span>
                              </div>
                              <div className="shrink-0 text-right font-mono text-[11px]">
                                <div className="text-soc-text-2">{f.confidence}% conf.</div>
                                {f.deductionPoints > 0 && <div className="font-semibold text-sev-critical">−{f.deductionPoints} pts</div>}
                              </div>
                            </div>
                            <p className="text-[11px] leading-relaxed text-soc-text-2">{f.description}</p>
                            <div className="soc-well break-all px-2 py-1.5 font-mono text-[10.5px] text-soc-text-2">
                              <span className="mr-1.5 text-soc-muted">evidence:</span>
                              {f.evidence}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Panel>

                <div className="space-y-4 lg:col-span-2">
                  <Panel title="Trust score breakdown">
                    <div className="space-y-1 font-mono text-xs">
                      <KV k="Maximum baseline trust" v="100 / 100" vClassName="text-sev-clean" />
                      {liveDeductions.length === 0 ? (
                        <div className="flex items-center gap-2 py-3 text-soc-text-2">
                          <Check className="h-4 w-4 text-sev-clean" />
                          No risk deductions applied.
                        </div>
                      ) : (
                        liveDeductions.map((item) => (
                          <div key={item.id} className="soc-kv">
                            <div className="min-w-0">
                              <div className="truncate text-soc-text">{item.title}</div>
                              <div className="text-[10px] text-soc-muted">{item.source}</div>
                            </div>
                            <span className="shrink-0 font-semibold text-sev-critical">−{item.pointsDeducted}</span>
                          </div>
                        ))
                      )}
                      <div className="flex items-center justify-between border-t border-soc-line-strong pt-2">
                        <span className="font-sans font-semibold text-soc-text">Final computed score</span>
                        <span
                          className={`text-base font-semibold ${
                            live.scoreAssessment.trustScore >= 80
                              ? 'text-sev-clean'
                              : live.scoreAssessment.trustScore >= 50
                              ? 'text-sev-medium'
                              : 'text-sev-critical'
                          }`}
                        >
                          {live.scoreAssessment.trustScore} / 100
                        </span>
                      </div>
                    </div>
                    {live.scoreAssessment.scoringSummary && (
                      <p className="mt-3 text-[11px] leading-relaxed text-soc-muted">{live.scoreAssessment.scoringSummary}</p>
                    )}
                  </Panel>

                  <Panel
                    title="Forensic consensus proof"
                    subtitle="SHA-256"
                    actions={
                      <button onClick={() => copyHashToClipboard(live.hashProof)} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                        <Copy className="h-3.5 w-3.5" />
                        {copiedHash ? 'Copied' : 'Copy'}
                      </button>
                    }
                  >
                    <p className="select-all break-all font-mono text-[11px] text-soc-text-2">{live.hashProof}</p>
                  </Panel>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: DNS */}
          {activeTab === 'dns' && (
            <Panel
              title="Live authoritative DNS resolution"
              subtitle={`Query results for ${live.parsedUrl.hostname}`}
              actions={
                <>
                  <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold ${liveDns.resolves ? 'border-sev-clean/35 bg-sev-clean/10 text-sev-clean' : 'border-sev-critical/35 bg-sev-critical/10 text-sev-critical'}`}>
                    {liveDns.resolves ? 'RESOLVES' : 'NXDOMAIN / UNRESOLVED'}
                  </span>
                  <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold ${liveDns.spfConfigured ? 'border-sev-clean/35 bg-sev-clean/10 text-sev-clean' : 'border-sev-medium/35 bg-sev-medium/10 text-sev-medium'}`}>
                    SPF {liveDns.spfConfigured ? 'CONFIGURED' : 'MISSING'}
                  </span>
                </>
              }
            >
              {!liveDns.resolves && (
                <Notice tone="danger" title="NXDOMAIN notice" className="mb-3">
                  This domain failed to resolve to an active IPv4 address. Hostnames without DNS mapping often indicate
                  discarded phishing domains, sinkholed malware hosts or typosquatting campaigns.
                  {liveDns.error && <div className="mt-1 font-mono text-[11px] text-soc-muted">{liveDns.error}</div>}
                </Notice>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <RecordList
                  title="A records · IPv4 host mapping"
                  empty="No A records returned."
                  items={liveDns.aRecords.map((ip) => (
                    <li key={ip} className="rounded bg-soc-raised px-2 py-1 font-semibold text-soc-text">{ip}</li>
                  ))}
                />
                <RecordList
                  title="NS records · authoritative nameservers"
                  empty="No NS records returned."
                  items={liveDns.nsRecords.map((ns) => (
                    <li key={ns} className="truncate rounded bg-soc-raised px-2 py-1 text-soc-text-2">{ns}</li>
                  ))}
                />
                <RecordList
                  title="MX records · mail exchange"
                  empty="No MX mail records configured."
                  items={liveDns.mxRecords.map((mx, idx) => (
                    <li key={idx} className="flex justify-between gap-2 rounded bg-soc-raised px-2 py-1 text-soc-text-2">
                      <span className="truncate">{mx.exchange}</span>
                      <span className="shrink-0 text-soc-muted">pri {mx.priority}</span>
                    </li>
                  ))}
                />
                <RecordList
                  title="TXT records & SPF policies"
                  empty="No TXT records configured."
                  items={liveDns.txtRecords.map((txt, idx) => (
                    <li key={idx} className="break-all rounded bg-soc-raised px-2 py-1 text-[10.5px] text-soc-text-2">{txt}</li>
                  ))}
                />
                {liveDns.aaaaRecords.length > 0 && (
                  <RecordList
                    title="AAAA records · IPv6 host mapping"
                    empty="No AAAA records returned."
                    items={liveDns.aaaaRecords.map((ip) => (
                      <li key={ip} className="break-all rounded bg-soc-raised px-2 py-1 text-soc-text-2">{ip}</li>
                    ))}
                  />
                )}
              </div>
            </Panel>
          )}

          {/* Tab 3: TLS */}
          {activeTab === 'tls' && (
            <Panel
              title="TLS / SSL transport status"
              subtitle={`Transport layer security for ${live.parsedUrl.hostname}`}
              actions={
                <button onClick={() => onNavigate('tls-certificate')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                  Full TLS engine
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="soc-well p-3">
                  <div className="soc-label mb-1.5">Protocol scheme</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold uppercase text-soc-text">{live.parsedUrl.protocol}</span>
                    <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold ${live.parsedUrl.protocol === 'https:' ? 'border-sev-clean/35 bg-sev-clean/10 text-sev-clean' : 'border-sev-critical/35 bg-sev-critical/10 text-sev-critical'}`}>
                      {live.parsedUrl.protocol === 'https:' ? 'ENCRYPTED CHANNEL' : 'CLEARTEXT'}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-[11px] text-soc-muted">
                    Port {live.parsedUrl.port || (live.parsedUrl.protocol === 'https:' ? '443' : '80')}
                  </p>
                </div>
                <div className="soc-well p-3 text-xs">
                  <div className="soc-label mb-1.5">Host identity</div>
                  <div className="break-all font-mono font-semibold text-soc-text">{live.parsedUrl.hostname}</div>
                  <div className="mt-2 border-t border-soc-line pt-2 font-mono text-[11px] text-soc-muted">
                    Raw IP: <span className="text-soc-text-2">{live.parsedUrl.isIpAddress ? 'Yes (high risk)' : 'No (standard FQDN)'}</span>
                  </div>
                </div>
              </div>
              <Notice className="mt-3">
                Certificate chain details are not part of the live scan response. Open the TLS engine for certificate-level analysis.
              </Notice>
            </Panel>
          )}

          {/* Tab 4: Security Headers */}
          {activeTab === 'headers' && (
            <Panel
              title="HTTP security headers"
              subtitle="Defense-in-depth posture against clickjacking, MIME-sniffing and SSL stripping"
              flush
              actions={
                <>
                  <DataTag kind="sample" label="Sample reference" />
                  <button onClick={() => onNavigate('security-assessment')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                    Full assessment
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              }
            >
              <div className="border-b border-soc-line px-4 py-2.5">
                <Notice tone="warn">
                  The live scan response does not include HTTP header data. The rows below are sample reference values, not
                  headers collected from {live.parsedUrl.hostname}.
                </Notice>
              </div>
              <SecurityHeadersTable />
            </Panel>
          )}

          {/* Tab 5: Geo & Host */}
          {activeTab === 'whois' && (
            <Panel title="Host infrastructure & network routing">
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <div>
                  <KV k="Target hostname" v={live.parsedUrl.hostname} />
                  <KV k="Top-level domain" v={`.${live.parsedUrl.tld || 'none'}`} />
                  <KV
                    k="DNS resolution status"
                    v={liveDns.resolves ? 'Resolves' : 'NXDOMAIN'}
                    vClassName={liveDns.resolves ? 'text-sev-clean' : 'text-sev-critical'}
                  />
                  <KV k="Primary resolved IP" v={liveDns.aRecords[0] || 'Unresolved'} />
                </div>
                <div>
                  <KV k="Protocol scheme" v={live.parsedUrl.protocol} />
                  <KV k="Subdomain depth" v={`${live.parsedUrl.subdomain ? live.parsedUrl.subdomain.split('.').length : 0} levels`} />
                  <KV k="Forensic engine" v="Sentinel AI Core v2.0" />
                  <KV k="SSRF enforcement" v="Passed (protected)" vClassName="text-sev-clean" />
                </div>
              </div>
            </Panel>
          )}

          {/* Tab 6: Forensic JSON */}
          {activeTab === 'raw' && (
            <Panel
              title="Real forensic investigation telemetry"
              icon={Terminal}
              subtitle="JSON response as returned by the backend"
              actions={
                <button onClick={() => copyJson(live)} className="soc-btn h-7 text-[11px]">
                  <Copy className="h-3.5 w-3.5" />
                  {copiedJson ? 'Copied JSON' : 'Copy JSON'}
                </button>
              }
            >
              <pre className="soc-well max-h-[28rem] overflow-auto p-3 font-mono text-[11px] leading-relaxed text-soc-text-2">
                {JSON.stringify(live, null, 2)}
              </pre>
            </Panel>
          )}
        </div>
      )}

      {/* ============================ DEMO PRESET ============================ */}
      {showDemo && (
        <div className="space-y-4">
          <VerdictBanner
            caseId={matchedDemoRecord.id}
            verdict={matchedDemoRecord.verdict}
            severity={matchedDemoRecord.severity}
            timestamp={matchedDemoRecord.timestamp}
            target={matchedDemoRecord.target}
            trustScore={matchedDemoRecord.trustScore}
            onNavigate={onNavigate}
            provenance={
              <button onClick={onOpenDemoNotice} title="About demo data">
                <DataTag kind="demo" label="Demo preset findings" />
              </button>
            }
            vectors={matchedDemoRecord.categories.map((c) => (
              <span key={c} className="soc-chip">
                {c}
              </span>
            ))}
          />

          <DossierTabs active={activeTab} onChange={setActiveTab} whoisLabel="Geo & WHOIS" />

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Panel title="Threat engine findings" actions={<DataTag kind="simulated" />} flush>
                <ul className="divide-y divide-soc-line text-xs">
                  {[
                    {
                      title: 'Homoglyph / punycode check',
                      desc: matchedDemoRecord.target.includes('pаypаl')
                        ? 'ALERT: Cyrillic character "а" detected replacing Latin letter.'
                        : 'No visual character deception detected in hostname.',
                      state: matchedDemoRecord.target.includes('pаypаl') ? 'bad' : 'ok',
                    },
                    {
                      title: 'Fast-flux / bulletproof hosting',
                      desc: `IP ${matchedDemoRecord.ipAddress} resides in an ASN frequently associated with bulletproof hosting.`,
                      state: 'warn',
                    },
                    {
                      title: 'Credential harvester signatures',
                      desc: 'DOM lexical tokenizer flagged banking password submission fields with external action endpoints.',
                      state: 'bad',
                    },
                  ].map((row) => (
                    <li key={row.title} className="flex items-start justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="font-medium text-soc-text">{row.title}</div>
                        <p className="mt-0.5 text-[11px] text-soc-text-2">{row.desc}</p>
                      </div>
                      {row.state === 'bad' ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-sev-critical" />
                      ) : row.state === 'warn' ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-sev-medium" />
                      ) : (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sev-clean" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-soc-line px-4 py-2.5">
                  <button onClick={() => onNavigate('phishing-detection')} className="soc-btn h-7 w-full text-[11px]">
                    Open in phishing deep-inspection lab
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Panel>

              <Panel title="Host & network telemetry" actions={<DataTag kind="simulated" />}>
                <KV k="Resolved IPv4" v={matchedDemoRecord.ipAddress} />
                <KV k="Origin geolocation" v={`${matchedDemoRecord.country} (${matchedDemoRecord.countryCode})`} />
                <KV k="Autonomous system" v={<span className="block max-w-[240px] truncate">{matchedDemoRecord.asn}</span>} />
                <KV k="TLS status" v={<StatusBadge verdict={matchedDemoRecord.tlsStatus} size="sm" />} />
                <KV k="Investigation lead" v={matchedDemoRecord.investigator} />
                <div className="soc-well mt-3 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="soc-label">SHA-256 consensus integrity hash</span>
                    <button
                      onClick={() => copyHashToClipboard(matchedDemoRecord.hashProof)}
                      className="flex items-center gap-1 font-mono text-[10px] text-soc-accent hover:text-soc-accent-hi"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="select-all break-all font-mono text-[11px] text-soc-text-2">{matchedDemoRecord.hashProof}</p>
                </div>
              </Panel>
            </div>
          )}

          {activeTab === 'dns' && (
            <Panel
              title="DNS zone resolution records"
              subtitle={`Nameservers, MX routing and SPF records for ${matchedDemoRecord.target}`}
              flush
              actions={
                <>
                  <DataTag kind="simulated" />
                  <span className="soc-label">TTL std 300s</span>
                </>
              }
            >
              <div className="overflow-x-auto">
                <table className="soc-table font-mono">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Hostname</th>
                      <th>Destination / value</th>
                      <th className="text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_DNS_RECORDS.map((rec, i) => (
                      <tr key={i}>
                        <td>
                          <span className="soc-chip w-12 justify-center font-semibold text-soc-text">{rec.type}</span>
                        </td>
                        <td>{rec.name}</td>
                        <td className="break-all text-soc-text">{rec.value}</td>
                        <td className="text-right text-soc-muted">{rec.ttl}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {activeTab === 'tls' && (
            <Panel
              title="TLS / SSL certificate forensics"
              subtitle="Chain verification, cryptographic algorithms and Certificate Transparency logs"
              actions={
                <>
                  <DataTag kind="simulated" />
                  <button onClick={() => onNavigate('tls-certificate')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                    Full TLS engine
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              }
            >
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <div>
                  <div className="soc-label mb-1">Certificate subject (leaf)</div>
                  <p className="break-all font-mono text-xs font-semibold text-soc-text">{SAMPLE_TLS_CERTIFICATE.subject}</p>
                  <div className="mt-2">
                    <KV k="Issuer" v={<span className="break-all">{SAMPLE_TLS_CERTIFICATE.issuer}</span>} />
                  </div>
                </div>
                <div>
                  <div className="soc-label mb-1">Validity period</div>
                  <KV k="Valid from" v={SAMPLE_TLS_CERTIFICATE.validFrom.split(' ')[0]} />
                  <KV
                    k="Expires"
                    v={`${SAMPLE_TLS_CERTIFICATE.validTo.split(' ')[0]} (${SAMPLE_TLS_CERTIFICATE.daysRemaining} days left)`}
                    vClassName="text-sev-medium"
                  />
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'headers' && (
            <Panel
              title="HTTP security headers"
              subtitle="Defense-in-depth posture against clickjacking, MIME-sniffing and SSL stripping"
              flush
              actions={
                <>
                  <DataTag kind="simulated" />
                  <button onClick={() => onNavigate('security-assessment')} className="soc-btn soc-btn-ghost h-7 text-[11px]">
                    Full assessment
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              }
            >
              <SecurityHeadersTable />
            </Panel>
          )}

          {activeTab === 'whois' && (
            <Panel title="WHOIS registrar & registration timeline" actions={<DataTag kind="simulated" />}>
              <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                <div>
                  <KV k="Registrar name" v="NameCheap, Inc. (Privacy Shield)" />
                  <KV k="Domain age" v="4 days old (newly minted)" vClassName="text-sev-critical" />
                  <KV k="Creation date" v="2026-11-03 04:12:00 UTC" />
                  <KV k="Expiration date" v="2027-11-03 04:12:00 UTC" />
                </div>
                <div>
                  <KV k="Registrant country" v="Seychelles (redacted)" />
                  <KV k="Abuse contact" v="abuse@namecheap.com" />
                  <KV k="DNSSEC" v="Unsigned" vClassName="text-sev-critical" />
                  <KV k="Status" v="clientTransferProhibited" vClassName="text-sev-medium" />
                </div>
              </div>
            </Panel>
          )}

          {activeTab === 'raw' && (
            <Panel
              title="Raw simulated telemetry"
              icon={Terminal}
              subtitle="JSON"
              actions={
                <>
                  <DataTag kind="simulated" />
                  <button
                    onClick={() =>
                      copyJson({
                        investigation: matchedDemoRecord,
                        dns: SAMPLE_DNS_RECORDS,
                        tls: SAMPLE_TLS_CERTIFICATE,
                        securityHeaders: SAMPLE_SECURITY_HEADERS,
                        phishingVectors: SAMPLE_PHISHING_VECTORS,
                      })
                    }
                    className="soc-btn h-7 text-[11px]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedJson ? 'Copied JSON' : 'Copy JSON'}
                  </button>
                </>
              }
            >
              <pre className="soc-well max-h-[28rem] overflow-auto p-3 font-mono text-[11px] leading-relaxed text-soc-text-2">
                {JSON.stringify(
                  {
                    investigation: matchedDemoRecord,
                    dns: SAMPLE_DNS_RECORDS,
                    tls: SAMPLE_TLS_CERTIFICATE,
                    securityHeaders: SAMPLE_SECURITY_HEADERS,
                    phishingVectors: SAMPLE_PHISHING_VECTORS,
                  },
                  null,
                  2
                )}
              </pre>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
};
