import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { SAMPLE_INVESTIGATIONS } from '../data/mockData';

export const ReportsPage: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<string>('INV-2026-9041');
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  const incident =
    SAMPLE_INVESTIGATIONS.find((i) => i.id === selectedIncident) || SAMPLE_INVESTIGATIONS[0];

  const markdownReport = `# SENTINEL AI - THREAT INTELLIGENCE INCIDENT REPORT
**Document Reference:** ${incident.id}
**Classification:** PROTOTYPE DEMO REPORT // SIMULATED FOR HACKATHON EVALUATION
**Generated:** 2026-11-07 18:15:00 UTC
**Investigator:** ${incident.investigator}

---

## 1. Executive Summary
During automated perimeter and threat intelligence sweeps, target domain **${incident.target}** was flagged with a **${incident.verdict.toUpperCase()}** verdict and a Digital Trust Score of **${incident.trustScore}/100**. The target demonstrates hostile intent matching credential harvesting operations against online banking consumers.

## 2. Threat Vector Attribution
- **Target Domain:** ${incident.target}
- **Resolved IPv4:** ${incident.ipAddress}
- **Origin Geolocation:** ${incident.country} (${incident.countryCode})
- **Autonomous System:** ${incident.asn}
- **TLS Status:** ${incident.tlsStatus}
- **Classified Vectors:** ${incident.categories.join(', ')}

## 3. Compliance & Governance Alignment
- **NIST CSF 2.0:** DE.CM-01 (Continuous Threat Monitoring), RS.AN-03 (Forensic Analysis)
- **ISO/IEC 27001:2022:** A.8.16 (Monitoring activities), A.8.23 (Web filtering)
- **Consensus Hash Anchor:** \`${incident.hashProof}\`

## 4. Immediate Remediation Actions
1. **Network Layer:** Sinkhole DNS record across internal resolvers and edge proxies.
2. **Identity & Access:** Revoke and force re-authentication for all corporate sessions that accessed this domain.
3. **External Takedown:** Transmit verified digital proof to hosting provider abuse team.
`;

  const copyMarkdown = () => {
    navigator.clipboard?.writeText(markdownReport);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Executive &amp; Compliance Incident Reports
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Export audit-ready forensic dossiers aligned with NIST CSF 2.0 and ISO/IEC 27001 standards for CISOs, regulators, and legal response teams.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Incident Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Select Incident Dossier:</span>
          {SAMPLE_INVESTIGATIONS.slice(0, 4).map((inv) => (
            <button
              key={inv.id}
              onClick={() => setSelectedIncident(inv.id)}
              className={`px-3 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                selectedIncident === inv.id
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {inv.id} ({inv.target.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Report Preview Document */}
      <div className="p-8 rounded-xl bg-[#070b16] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-widest text-white font-mono">
                SENTINEL // SOC INCIDENT REPORT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              CONFIDENTIAL FORENSIC DOSSIER · REF: {incident.id}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#050811] border border-slate-800 text-right text-xs font-mono">
            <div className="text-slate-400 text-[10px]">THREAT VERDICT</div>
            <div className="text-rose-400 font-bold text-sm">{incident.verdict.toUpperCase()}</div>
          </div>
        </div>

        {/* Rendered Sections */}
        <div className="space-y-6 text-sm text-slate-300">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">1. Executive Summary</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target domain <code className="text-cyan-300 font-mono font-bold">{incident.target}</code> has been confirmed hostile by the automated threat intelligence cluster with an overall Digital Trust Score of <strong className="text-rose-400 font-mono">{incident.trustScore}/100</strong>. Primary indicators confirm an active credential harvesting campaign impersonating financial services.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">2. Technical Attribution Evidence</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#050811] border border-slate-800">
                <span className="text-slate-400 text-[10px]">IP Address:</span>
                <p className="text-white font-bold">{incident.ipAddress}</p>
              </div>
              <div className="p-3 rounded bg-[#050811] border border-slate-800">
                <span className="text-slate-400 text-[10px]">Autonomous System:</span>
                <p className="text-cyan-300 font-semibold">{incident.asn}</p>
              </div>
              <div className="p-3 rounded bg-[#050811] border border-slate-800">
                <span className="text-slate-400 text-[10px]">TLS Certificate:</span>
                <p className="text-amber-400 font-semibold">{incident.tlsStatus}</p>
              </div>
              <div className="p-3 rounded bg-[#050811] border border-slate-800">
                <span className="text-slate-400 text-[10px]">Consensus Proof:</span>
                <p className="text-slate-400 truncate">{incident.hashProof}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-base font-bold text-white tracking-tight">3. Incident Response Recommendations</h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>Add {incident.ipAddress} and domain indicators to security gateway blocklists.</li>
              <li>Submit automated abuse report to hosting provider and registrar.</li>
              <li>Verify on Sentinel blockchain ledger to preserve tamper-proof timestamp evidence.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
