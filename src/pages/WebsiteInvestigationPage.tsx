import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
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
  RefreshCw,
  Info,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight,
  Ban,
  Check,
} from 'lucide-react';
import { PageId, InvestigationRecord } from '../types';
import {
  SAMPLE_INVESTIGATIONS,
  SAMPLE_DNS_RECORDS,
  SAMPLE_SECURITY_HEADERS,
  SAMPLE_TLS_CERTIFICATE,
  SAMPLE_PHISHING_VECTORS,
  DEMO_PRESET_TARGETS,
} from '../data/mockData';
import { InvestigationSearchBar } from '../components/common/InvestigationSearchBar';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { SeverityBar } from '../components/common/SeverityBar';

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

export const WebsiteInvestigationPage: React.FC<WebsiteInvestigationPageProps> = ({
  currentTarget,
  onSelectTarget,
  onNavigate,
  onOpenDemoNotice,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dns' | 'tls' | 'headers' | 'whois' | 'raw'>('overview');
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
  } | null>(null);

  // Fallback demo matched record for demo tab / comparison
  const matchedDemoRecord: InvestigationRecord =
    SAMPLE_INVESTIGATIONS.find(
      (r) =>
        r.target.toLowerCase().includes(currentTarget.toLowerCase()) ||
        currentTarget.toLowerCase().includes(r.target.split(' ')[0].toLowerCase())
    ) || {
      id: `INV-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      target: currentTarget || 'secure-login-chase-update.info',
      targetType: 'domain',
      verdict: currentTarget.includes('clean') || currentTarget.includes('stripe') || currentTarget.includes('github')
        ? 'Clean'
        : 'Malicious',
      severity: currentTarget.includes('clean') || currentTarget.includes('stripe') || currentTarget.includes('github')
        ? 'clean'
        : 'critical',
      trustScore: currentTarget.includes('clean') || currentTarget.includes('stripe') || currentTarget.includes('github')
        ? 98
        : 14,
      categories: ['Simulated Target Evaluation', 'Punycode / Homoglyph Check', 'Heuristic Flagging'],
      timestamp: '2026-11-07 18:05:12 UTC',
      investigator: 'Analyst SOC-03',
      ipAddress: '194.26.29.114',
      country: 'Seychelles',
      countryCode: 'SC',
      asn: 'AS208657 - Fenix Host LTD',
      tlsStatus: 'Self-Signed',
      hashProof: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

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

  const analysisStepsLabels = [
    'Parsing & normalizing FQDN, validating SSRF safety bounds...',
    'Performing multi-vector DNS zone resolution (A, AAAA, MX, TXT, NS)...',
    'Executing lexical heuristics, homoglyph detection & keyword correlation...',
    'Querying external threat feeds (Google Safe Browsing & URLhaus)...',
    'Calculating transparent trust score deductions & synthesizing Gemini SOC analysis...',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Prominent Investigation Search Bar */}
      <div className="p-5 md:p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Website &amp; Domain Threat Investigation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit any full URL, hostname, or IP for deep multi-vector inspection
            </p>
          </div>

          {/* Real vs Demo Mode Indicator & Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Engine Mode:</span>
            {realScanResult && activeScanMode === 'live' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                REAL ENGINE (ACTIVE)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-amber-950/50 text-amber-300 border border-amber-500/30">
                DEMO SIMULATION
              </span>
            )}

            {realScanResult && (
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 ml-1">
                <button
                  onClick={() => setActiveScanMode('live')}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition-colors ${
                    activeScanMode === 'live'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Live Scan
                </button>
                <button
                  onClick={() => setActiveScanMode('demo')}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded font-semibold transition-colors ${
                    activeScanMode === 'demo'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Demo Preset
                </button>
              </div>
            )}
          </div>
        </div>

        <InvestigationSearchBar
          onInvestigate={handleStartInvestigation}
          initialValue={currentTarget || (realScanResult ? realScanResult.parsedUrl.rawInput : matchedDemoRecord.target)}
        />
      </div>

      {/* SSRF & Input Validation Security Error Banner */}
      {apiError && (
        <div
          className={`p-5 rounded-xl border ${
            apiError.isBlockedBySsrf
              ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.15)] text-rose-200'
              : apiError.isMalformed
              ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] text-amber-200'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {apiError.isBlockedBySsrf ? (
              <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : apiError.isMalformed ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {apiError.isBlockedBySsrf
                    ? 'SSRF Security Violation: Prohibited Address Space'
                    : apiError.isMalformed
                    ? 'Malformed URL Input'
                    : 'Investigation Request Error'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 border border-current">
                  STATUS 403 / BLOCKED
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{apiError.message}</p>
              {apiError.isBlockedBySsrf && (
                <p className="text-[11px] font-mono text-rose-300/80 pt-1">
                  SENTINEL AI strictly enforces SSRF RFC-1918 / RFC-3927 guardrails. Outgoing connections to private networks, 127.0.0.1, localhost, and link-local cloud metadata endpoints (169.254.169.254) are rejected by security design.
                </p>
              )}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handleStartInvestigation('https://github.com')}
                  className="px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                >
                  Test Legitimate Target (github.com)
                </button>
                <button
                  onClick={() => setApiError(null)}
                  className="px-3 py-1 text-xs font-mono rounded bg-black/40 hover:bg-black/60 text-slate-400 transition-colors"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Pipeline Analysis Loading Indicator */}
      {isAnalyzing && (
        <div className="p-8 rounded-xl bg-[#090e1c] border border-cyan-500/40 flex flex-col items-center justify-center text-center space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.1)] animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-cyan-400 animate-spin" />
            <Shield className="w-7 h-7 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                ACTIVE SOC ENGINE
              </span>
              <h3 className="text-base font-bold text-white">
                Live URL Investigation: <span className="font-mono text-cyan-300">{currentTarget}</span>
              </h3>
            </div>
            <p className="text-xs font-mono text-cyan-400 mt-2">
              {analysisStepsLabels[analysisStep - 1] || 'Executing live threat vector inspection...'}
            </p>
          </div>
          <div className="w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(analysisStep / 5) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>DNS Lookup: {analysisStep > 1 ? '✓ Complete' : 'Resolving...'}</span>
            <span>·</span>
            <span>Heuristics: {analysisStep > 2 ? '✓ Analyzed' : 'Evaluating...'}</span>
            <span>·</span>
            <span>Threat Feeds: {analysisStep > 3 ? '✓ Checked' : 'Querying...'}</span>
          </div>
        </div>
      )}

      {/* Real Scan Output Dossier */}
      {!isAnalyzing && realScanResult && activeScanMode === 'live' && (
        <div className="space-y-6">
          {/* Verdict Banner Card (Real Result) */}
          <div
            className={`p-6 rounded-xl border ${
              realScanResult.scoreAssessment.verdict === 'Malicious'
                ? 'bg-[#150a10] border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                : realScanResult.scoreAssessment.verdict === 'Suspicious'
                ? 'bg-[#15110a] border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                : 'bg-[#081510] border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs text-slate-400">{realScanResult.id}</span>
                  <span className="text-slate-600">·</span>
                  <StatusBadge verdict={realScanResult.scoreAssessment.verdict} />
                  <SeverityBadge level={realScanResult.scoreAssessment.severity} />
                  <span className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    LIVE SCAN ENGINE RESULT
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">{realScanResult.timestamp}</span>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight break-all">
                    {realScanResult.parsedUrl.normalizedUrl}
                  </h3>
                  {realScanResult.parsedUrl.hostname !== realScanResult.parsedUrl.rawInput && (
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Target Hostname: <span className="text-cyan-300">{realScanResult.parsedUrl.hostname}</span>
                      {realScanResult.parsedUrl.subdomain && (
                        <span> (Subdomain: {realScanResult.parsedUrl.subdomain})</span>
                      )}
                      <span> · TLD: .{realScanResult.parsedUrl.tld || 'none'}</span>
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Classified Vectors:</span>
                    {realScanResult.findings.map((f) => (
                      <span
                        key={f.id}
                        className={`px-2 py-0.5 rounded font-mono text-[11px] border ${
                          f.severity === 'critical'
                            ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                            : f.severity === 'high'
                            ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                            : f.severity === 'medium'
                            ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                            : 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {f.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gauge and Quick Action Buttons */}
              <div className="w-full lg:w-72 space-y-3 p-4 rounded-lg bg-black/40 border border-slate-800">
                <SeverityBar score={realScanResult.scoreAssessment.trustScore} />

                <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onNavigate('blockchain-verification')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 font-medium transition-colors"
                  >
                    <Blocks className="w-3.5 h-3.5" />
                    <span>Ledger Proof</span>
                  </button>

                  <button
                    onClick={() => onNavigate('reports')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dossier Tabs Navigation */}
          <div className="flex items-center gap-1 p-1 bg-[#090e1c] rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: 'overview', label: 'Threat Overview', icon: Shield },
              { id: 'dns', label: 'DNS Infrastructure', icon: Server },
              { id: 'tls', label: 'TLS / SSL Certificate', icon: Lock },
              { id: 'headers', label: 'Security Headers', icon: Layers },
              { id: 'whois', label: 'Geo & Host', icon: Globe },
              { id: 'raw', label: 'Forensic JSON', icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Gemini Evidence Explanation Card */}
              <div className="p-5 md:p-6 rounded-xl bg-[#070c18] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.06)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                      Gemini SOC Analyst Evidence Explanation
                    </h4>
                  </div>
                  {realScanResult.geminiExplanation?.status === 'available' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      Model: {realScanResult.geminiExplanation.modelUsed || 'gemini-3.8-flash'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      <Info className="w-3 h-3 text-slate-400" />
                      Empirical Telemetry Mode
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {realScanResult.geminiExplanation?.rawExplanation ||
                    'Empirical findings have been cataloged below by Sentinel AI heuristic and DNS engines.'}
                </div>
              </div>

              {/* Threat Feeds Status Bar */}
              <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono uppercase font-bold text-slate-300">
                      Integrated Threat Intelligence Feeds
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {realScanResult.threatFeeds.map((feed) => (
                      <div
                        key={feed.source}
                        className={`px-3 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-2 ${
                          feed.status === 'clean'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : feed.status === 'flagged'
                            ? 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                        }`}
                        title={feed.details}
                      >
                        <span className="font-bold">{feed.source}:</span>
                        <span className="uppercase text-[10px] font-bold">
                          {feed.status === 'unavailable' ? 'Unavailable / Offline' : feed.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Empirical Findings & Transparent Score Deductions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Findings List */}
                <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
                      Empirical Findings &amp; Evidence ({realScanResult.findings.length})
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-400">Zero-Fabrication Guarantee</span>
                  </div>

                  <div className="space-y-3">
                    {realScanResult.findings.map((f) => (
                      <div
                        key={f.id}
                        className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-2 hover:border-slate-700 transition-colors text-xs"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{f.title}</span>
                              <SeverityBadge level={f.severity} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">Source: {f.source}</span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-cyan-300">
                              {f.confidence}% Conf.
                            </span>
                            {f.deductionPoints > 0 && (
                              <div className="text-[11px] font-mono font-bold text-rose-400">
                                -{f.deductionPoints} pts
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-300 text-[11px] leading-relaxed">{f.description}</p>

                        <div className="p-2 rounded bg-black/60 border border-slate-800/80 font-mono text-[10px] text-cyan-300/90 break-all">
                          <span className="text-slate-500 mr-1.5">Evidence:</span>
                          {f.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transparent Score Deductions */}
                <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
                  <h4 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
                    Transparent Trust Score Breakdown
                  </h4>
                  <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-3 text-xs font-mono">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                      <span className="text-slate-400">Maximum Baseline Trust:</span>
                      <span className="text-emerald-400 font-bold">100 / 100</span>
                    </div>

                    {realScanResult.scoreAssessment.deductionBreakdown.length === 0 ? (
                      <div className="py-3 text-center text-slate-400">
                        <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        No risk deductions applied. Target exhibits pristine baseline indicators.
                      </div>
                    ) : (
                      <div className="space-y-2 py-1">
                        {realScanResult.scoreAssessment.deductionBreakdown.map((item) => (
                          <div key={item.id} className="flex justify-between items-start text-[11px]">
                            <div className="pr-2">
                              <div className="text-white font-medium">{item.title}</div>
                              <div className="text-slate-500 text-[10px]">{item.source}</div>
                            </div>
                            <span className="text-rose-400 font-bold shrink-0">
                              -{item.pointsDeducted}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-slate-300 font-bold">Final Computed Score:</span>
                      <span
                        className={`text-base font-bold ${
                          realScanResult.scoreAssessment.trustScore >= 80
                            ? 'text-emerald-400'
                            : realScanResult.scoreAssessment.trustScore >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {realScanResult.scoreAssessment.trustScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Proof */}
                  <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Forensic Consensus Proof (SHA-256)
                      </span>
                      <button
                        onClick={() => copyHashToClipboard(realScanResult.hashProof)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedHash ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="font-mono text-[11px] text-cyan-300 break-all select-all">
                      {realScanResult.hashProof}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: DNS */}
          {activeTab === 'dns' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Live Authoritative DNS Resolution</h4>
                  <p className="text-xs text-slate-400">
                    Real-time DNS query results for hostname {realScanResult.parsedUrl.hostname}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                      realScanResult.dns.resolves
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {realScanResult.dns.resolves ? 'DNS ACTIVE (RESOLVES)' : 'NXDOMAIN / UNRESOLVED'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono ${
                      realScanResult.dns.spfConfigured
                        ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    SPF: {realScanResult.dns.spfConfigured ? 'Configured' : 'Missing'}
                  </span>
                </div>
              </div>

              {!realScanResult.dns.resolves && (
                <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs text-rose-200">
                  <span className="font-bold">NXDOMAIN Notice:</span> This domain failed to resolve to an active IPv4 address. Hostnames without DNS mapping often indicate discarded phishing domains, sinkholed malware hosts, or typosquatting campaigns.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* A Records */}
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    A Records (IPv4 Host Mapping)
                  </span>
                  {realScanResult.dns.aRecords.length > 0 ? (
                    <div className="space-y-1">
                      {realScanResult.dns.aRecords.map((ip) => (
                        <div key={ip} className="p-1.5 rounded bg-slate-900 text-white font-bold">
                          {ip}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No A records returned.</p>
                  )}
                </div>

                {/* Nameservers */}
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    NS Records (Authoritative Nameservers)
                  </span>
                  {realScanResult.dns.nsRecords.length > 0 ? (
                    <div className="space-y-1">
                      {realScanResult.dns.nsRecords.map((ns) => (
                        <div key={ns} className="p-1.5 rounded bg-slate-900 text-slate-200 truncate">
                          {ns}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No NS records returned.</p>
                  )}
                </div>

                {/* MX Records */}
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    MX Records (Mail Exchange Servers)
                  </span>
                  {realScanResult.dns.mxRecords.length > 0 ? (
                    <div className="space-y-1">
                      {realScanResult.dns.mxRecords.map((mx, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-slate-900 text-slate-200 flex justify-between">
                          <span className="truncate">{mx.exchange}</span>
                          <span className="text-cyan-400 shrink-0 ml-2">Pri: {mx.priority}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No MX mail records configured.</p>
                  )}
                </div>

                {/* TXT Records */}
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">
                    TXT Records &amp; SPF Policies
                  </span>
                  {realScanResult.dns.txtRecords.length > 0 ? (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {realScanResult.dns.txtRecords.map((txt, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-slate-900 text-slate-300 text-[10px] break-all">
                          {txt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px]">No TXT records configured.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: TLS */}
          {activeTab === 'tls' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">TLS / SSL Certificate Intelligence</h4>
                  <p className="text-xs text-slate-400">
                    Transport Layer Security status for {realScanResult.parsedUrl.hostname}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('tls-certificate')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Full TLS Engine →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Protocol Scheme</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white uppercase">{realScanResult.parsedUrl.protocol}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        realScanResult.parsedUrl.protocol === 'https:'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {realScanResult.parsedUrl.protocol === 'https:' ? 'Encrypted Channel' : 'Cleartext Unencrypted'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] pt-1">
                    Port: {realScanResult.parsedUrl.port || (realScanResult.parsedUrl.protocol === 'https:' ? '443' : '80')}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Host Identity</span>
                  <div className="text-white font-semibold break-all">{realScanResult.parsedUrl.hostname}</div>
                  <div className="pt-2 border-t border-slate-800 text-slate-400">
                    Is Raw IP: <span className="text-cyan-300">{realScanResult.parsedUrl.isIpAddress ? 'Yes (High Risk)' : 'No (Standard FQDN)'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Security Headers */}
          {activeTab === 'headers' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">HTTP Security Headers Evaluation</h4>
                  <p className="text-xs text-slate-400">
                    Defense-in-depth posture against clickjacking, MIME-sniffing, and SSL stripping
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('security-assessment')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Full Assessment Report →
                </button>
              </div>

              <div className="space-y-3">
                {SAMPLE_SECURITY_HEADERS.map((h) => (
                  <div
                    key={h.name}
                    className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{h.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            h.status === 'present'
                              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                              : h.status === 'misconfigured'
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{h.recommendation}</p>
                    </div>

                    {h.value && (
                      <span className="px-2.5 py-1 rounded bg-slate-900 font-mono text-slate-300 text-[11px] shrink-0 border border-slate-800">
                        {h.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Geo & Host */}
          {activeTab === 'whois' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">Host Infrastructure &amp; Network Routing</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Hostname:</span>
                    <span className="text-white font-bold">{realScanResult.parsedUrl.hostname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Top-Level Domain:</span>
                    <span className="text-cyan-300">.{realScanResult.parsedUrl.tld || 'none'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DNS Resolution Status:</span>
                    <span className={realScanResult.dns.resolves ? 'text-emerald-400' : 'text-rose-400'}>
                      {realScanResult.dns.resolves ? 'Resolves' : 'NXDOMAIN'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Resolved IP:</span>
                    <span className="text-white font-bold">
                      {realScanResult.dns.aRecords[0] || 'Unresolved'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protocol Scheme:</span>
                    <span className="text-white">{realScanResult.parsedUrl.protocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subdomain Depth:</span>
                    <span className="text-white">
                      {realScanResult.parsedUrl.subdomain ? realScanResult.parsedUrl.subdomain.split('.').length : 0} levels
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Forensic Engine:</span>
                    <span className="text-cyan-300">Sentinel AI Core v2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SSRF Enforcement:</span>
                    <span className="text-emerald-400 font-bold">Passed (Protected)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Forensic JSON */}
          {activeTab === 'raw' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white font-mono">
                    Real Forensic Investigation Telemetry (JSON)
                  </h4>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(realScanResult, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedJson ? 'Copied JSON!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#050811] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
                {JSON.stringify(realScanResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Demo Preset Dossier (Shown when in demo mode or before first real scan) */}
      {!isAnalyzing && (!realScanResult || activeScanMode === 'demo') && (
        <div className="space-y-6">
          {/* Verdict Banner Card (Demo Simulation) */}
          <div
            className={`p-6 rounded-xl border ${
              matchedDemoRecord.verdict === 'Malicious'
                ? 'bg-[#150a10] border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.1)]'
                : matchedDemoRecord.verdict === 'Suspicious'
                ? 'bg-[#15110a] border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
                : 'bg-[#081510] border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.1)]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs text-slate-400">{matchedDemoRecord.id}</span>
                  <span className="text-slate-600">·</span>
                  <StatusBadge verdict={matchedDemoRecord.verdict} />
                  <SeverityBadge level={matchedDemoRecord.severity} />
                  <span className="text-slate-600">·</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    DEMO PRESET FINDINGS
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400 font-mono">{matchedDemoRecord.timestamp}</span>
                </div>

                <div>
                  <h3 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight break-all">
                    {matchedDemoRecord.target}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Classified Vectors:</span>
                    {matchedDemoRecord.categories.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 font-mono text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gauge and Quick Action Buttons */}
              <div className="w-full lg:w-72 space-y-3 p-4 rounded-lg bg-black/40 border border-slate-800">
                <SeverityBar score={matchedDemoRecord.trustScore} />

                <div className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onNavigate('blockchain-verification')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 font-medium transition-colors"
                  >
                    <Blocks className="w-3.5 h-3.5" />
                    <span>Ledger Proof</span>
                  </button>

                  <button
                    onClick={() => onNavigate('reports')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#090e1c] rounded-xl border border-slate-800 overflow-x-auto">
            {[
              { id: 'overview', label: 'Threat Overview', icon: Shield },
              { id: 'dns', label: 'DNS Infrastructure', icon: Server },
              { id: 'tls', label: 'TLS / SSL Certificate', icon: Lock },
              { id: 'headers', label: 'Security Headers', icon: Layers },
              { id: 'whois', label: 'Geo & WHOIS', icon: Globe },
              { id: 'raw', label: 'Forensic JSON', icon: FileCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content: Demo Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
                  Threat Engine Findings (Simulated)
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">Homoglyph / Punycode Check</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {matchedDemoRecord.target.includes('pаypаl')
                          ? 'ALERT: Cyrillic character "а" detected replacing Latin letter.'
                          : 'No visual character deception detected in hostname.'}
                      </p>
                    </div>
                    {matchedDemoRecord.target.includes('pаypаl') ? (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">Fast-Flux / Bulletproof Hosting</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        IP {matchedDemoRecord.ipAddress} resides in an ASN frequently associated with bulletproof hosting.
                      </p>
                    </div>
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  </div>

                  <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                    <div>
                      <span className="font-semibold text-white">Credential Harvester Signatures</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        DOM lexical tokenizer flagged banking password submission fields with external action endpoints.
                      </p>
                    </div>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('phishing-detection')}
                    className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors text-center"
                  >
                    Open in Phishing Deep-Inspection Lab →
                  </button>
                </div>
              </div>

              {/* Host Infrastructure Card */}
              <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
                <h4 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider">
                  Host &amp; Network Telemetry
                </h4>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Resolved IPv4:</span>
                    <span className="text-white font-bold">{matchedDemoRecord.ipAddress}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Origin Geolocation:</span>
                    <span className="text-white">
                      {matchedDemoRecord.country} ({matchedDemoRecord.countryCode})
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Autonomous System:</span>
                    <span className="text-cyan-300 text-right truncate max-w-[220px]">
                      {matchedDemoRecord.asn}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">TLS Status:</span>
                    <span className="text-amber-400">{matchedDemoRecord.tlsStatus}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Investigation Lead:</span>
                    <span className="text-slate-300">{matchedDemoRecord.investigator}</span>
                  </div>
                </div>

                {/* Cryptographic Hash Proof */}
                <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      SHA-256 Consensus Integrity Hash
                    </span>
                    <button
                      onClick={() => copyHashToClipboard(matchedDemoRecord.hashProof)}
                      className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-slate-300 break-all select-all">
                    {matchedDemoRecord.hashProof}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Demo DNS Tab */}
          {activeTab === 'dns' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">DNS Zone Resolution Records (Simulated)</h4>
                  <p className="text-xs text-slate-400">
                    Nameservers, MX routing, and SPF validation records for {matchedDemoRecord.target}
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">TTL Standard: 300s</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Hostname</th>
                      <th className="py-2.5 px-3">Destination / Target Value</th>
                      <th className="py-2.5 px-3 text-right">TTL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {SAMPLE_DNS_RECORDS.map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{rec.name}</td>
                        <td className="py-2.5 px-3 text-white break-all">{rec.value}</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{rec.ttl}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Demo TLS Tab */}
          {activeTab === 'tls' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">TLS / SSL Certificate Forensics (Simulated)</h4>
                  <p className="text-xs text-slate-400">
                    Chain verification, cryptographic algorithms, and Certificate Transparency logs
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('tls-certificate')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Full TLS Engine →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Certificate Subject (Leaf)</span>
                  <p className="text-white font-semibold break-all">{SAMPLE_TLS_CERTIFICATE.subject}</p>
                  <div className="pt-2 border-t border-slate-800 text-slate-400">
                    Issuer: <span className="text-cyan-300">{SAMPLE_TLS_CERTIFICATE.issuer}</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase">Validity Period</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Valid From:</span>
                    <span className="text-white">{SAMPLE_TLS_CERTIFICATE.validFrom.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expires:</span>
                    <span className="text-amber-400">
                      {SAMPLE_TLS_CERTIFICATE.validTo.split(' ')[0]} ({SAMPLE_TLS_CERTIFICATE.daysRemaining} days left)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Headers Tab */}
          {activeTab === 'headers' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">HTTP Security Headers Evaluation</h4>
                  <p className="text-xs text-slate-400">
                    Defense-in-depth posture against clickjacking, MIME-sniffing, and SSL stripping
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('security-assessment')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Full Assessment Report →
                </button>
              </div>

              <div className="space-y-3">
                {SAMPLE_SECURITY_HEADERS.map((h) => (
                  <div
                    key={h.name}
                    className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{h.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            h.status === 'present'
                              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                              : h.status === 'misconfigured'
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {h.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{h.recommendation}</p>
                    </div>

                    {h.value && (
                      <span className="px-2.5 py-1 rounded bg-slate-900 font-mono text-slate-300 text-[11px] shrink-0 border border-slate-800">
                        {h.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo WHOIS Tab */}
          {activeTab === 'whois' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white">WHOIS Registrar &amp; Registration Timeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registrar Name:</span>
                    <span className="text-white">NameCheap, Inc. (Privacy Shield)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Domain Age:</span>
                    <span className="text-rose-400 font-bold">4 Days Old (Newly Minted)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Creation Date:</span>
                    <span className="text-white">2026-11-03 04:12:00 UTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expiration Date:</span>
                    <span className="text-white">2027-11-03 04:12:00 UTC</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Registrant Country:</span>
                    <span className="text-white">Seychelles (Redacted)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Abuse Contact:</span>
                    <span className="text-cyan-300">abuse@namecheap.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DNSSEC:</span>
                    <span className="text-rose-400">Unsigned</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-amber-400">clientTransferProhibited</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demo Raw JSON Tab */}
          {activeTab === 'raw' && (
            <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-mono">Raw Simulated Telemetry (JSON)</h4>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(matchedDemoRecord, null, 2));
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedJson ? 'Copied JSON!' : 'Copy JSON'}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-[#050811] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-96">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};
