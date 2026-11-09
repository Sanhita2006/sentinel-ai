import React, { useMemo, useState } from 'react';
import { FileText, Printer, Copy, ShieldCheck } from 'lucide-react';
import { SAMPLE_INVESTIGATIONS } from '../data/mockData';
import { PageHeader, DataTag, KV } from '../components/ui/Soc';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { normalizeVerdict, utcStamp, verdictSeverity, SEVERITY_STYLES } from '../lib/severity';

export const ReportsPage: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<string>('INV-2026-9041');
  const [copiedMd, setCopiedMd] = useState<boolean>(false);

  const incident = SAMPLE_INVESTIGATIONS.find((i) => i.id === selectedIncident) || SAMPLE_INVESTIGATIONS[0];
  const verdict = normalizeVerdict(incident.verdict);
  const verdictTone = SEVERITY_STYLES[verdictSeverity(incident.verdict)].text;
  const generatedAt = useMemo(() => utcStamp(), [selectedIncident]);

  // Summary and recommendations follow the incident's actual verdict.
  const summary =
    verdict === 'Malicious'
      ? `Target domain ${incident.target} was flagged with a MALICIOUS verdict and a Digital Trust Score of ${incident.trustScore}/100. Primary indicators: ${incident.categories.join(', ')}.`
      : verdict === 'Suspicious'
      ? `Target domain ${incident.target} was flagged as SUSPICIOUS with a Digital Trust Score of ${incident.trustScore}/100 and requires analyst review. Observed indicators: ${incident.categories.join(', ')}.`
      : verdict === 'Clean'
      ? `Target domain ${incident.target} returned a CLEAN verdict with a Digital Trust Score of ${incident.trustScore}/100. Positive posture indicators: ${incident.categories.join(', ')}.`
      : `Target domain ${incident.target} returned an INCONCLUSIVE verdict (Digital Trust Score ${incident.trustScore}/100). Further evidence is required.`;

  const recommendations =
    verdict === 'Clean'
      ? [
          'No blocking action required. Retain the domain on the monitored allow-list.',
          'Re-assess on certificate renewal or infrastructure change.',
          'Verify on Sentinel blockchain ledger to preserve tamper-proof timestamp evidence.',
        ]
      : [
          `Add ${incident.ipAddress} and domain indicators to security gateway blocklists.`,
          'Submit automated abuse report to hosting provider and registrar.',
          'Verify on Sentinel blockchain ledger to preserve tamper-proof timestamp evidence.',
        ];

  const markdownReport = `# SENTINEL AI - THREAT INTELLIGENCE INCIDENT REPORT
**Document Reference:** ${incident.id}
**Classification:** PROTOTYPE DEMO REPORT // SIMULATED FOR HACKATHON EVALUATION
**Generated:** ${generatedAt}
**Investigator:** ${incident.investigator}

---

## 1. Executive Summary
${summary}

## 2. Threat Vector Attribution
- **Target Domain:** ${incident.target}
- **Verdict / Severity:** ${incident.verdict} / ${incident.severity}
- **Resolved IPv4:** ${incident.ipAddress}
- **Origin Geolocation:** ${incident.country} (${incident.countryCode})
- **Autonomous System:** ${incident.asn}
- **TLS Status:** ${incident.tlsStatus}
- **Classified Vectors:** ${incident.categories.join(', ')}

## 3. Compliance & Governance Alignment
- **NIST CSF 2.0:** DE.CM-01 (Continuous Threat Monitoring), RS.AN-03 (Forensic Analysis)
- **ISO/IEC 27001:2022:** A.8.16 (Monitoring activities), A.8.23 (Web filtering)
- **Consensus Hash Anchor:** \`${incident.hashProof}\`

## 4. Recommended Actions
${recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
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
    <div className="soc-page">
      <div className="print:hidden">
        <PageHeader
          icon={FileText}
          title="Executive & compliance incident reports"
          description="Export audit-ready forensic dossiers aligned with NIST CSF 2.0 and ISO/IEC 27001 for CISOs, regulators and legal response teams."
          actions={
            <>
              <DataTag kind="demo" label="Demo report" />
              <button onClick={copyMarkdown} className="soc-btn h-7 text-[11px]">
                <Copy className="h-3.5 w-3.5" />
                {copiedMd ? 'Copied' : 'Copy Markdown'}
              </button>
              <button onClick={handlePrint} className="soc-btn h-7 text-[11px]">
                <Printer className="h-3.5 w-3.5" />
                Print / PDF
              </button>
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="soc-label mr-1">Incident dossier</span>
            {SAMPLE_INVESTIGATIONS.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedIncident(inv.id)}
                data-active={selectedIncident === inv.id}
                className="soc-chip hover:border-soc-forest-2 hover:text-soc-text data-[active=true]:border-soc-forest-2 data-[active=true]:bg-soc-forest/60 data-[active=true]:text-soc-text"
              >
                {inv.id} · {inv.target.split(' ')[0]}
              </button>
            ))}
          </div>
        </PageHeader>
      </div>

      {/* Report document */}
      <article className="soc-panel soc-print-doc mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-3 border-b border-soc-line px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-soc-accent" />
              <span className="font-mono text-xs font-semibold tracking-[0.18em] text-soc-text">SENTINEL // SOC INCIDENT REPORT</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-soc-muted">CONFIDENTIAL FORENSIC DOSSIER · REF {incident.id}</p>
            <p className="font-mono text-[11px] text-soc-muted">
              Generated {generatedAt} · {incident.investigator}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-sev-medium">
              Prototype demo report // simulated for hackathon evaluation
            </p>
          </div>
          <div className="soc-well min-w-[160px] px-3 py-2 text-right">
            <div className="soc-label">Threat verdict</div>
            <div className={`font-mono text-sm font-semibold ${verdictTone}`}>{incident.verdict.toUpperCase()}</div>
            <div className="mt-1 flex justify-end">
              <SeverityBadge level={incident.severity} />
            </div>
          </div>
        </header>

        <div className="space-y-5 px-6 py-5 text-sm text-soc-text-2">
          <section>
            <h3 className="mb-1.5 text-[13px] font-semibold text-soc-text">1. Executive summary</h3>
            <p className="text-xs leading-relaxed">{summary}</p>
          </section>

          <section>
            <h3 className="mb-1.5 text-[13px] font-semibold text-soc-text">2. Technical attribution evidence</h3>
            <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <KV k="Target domain" v={incident.target} />
                <KV k="IP address" v={incident.ipAddress} />
                <KV k="Geolocation" v={`${incident.country} (${incident.countryCode})`} />
                <KV k="Autonomous system" v={incident.asn} />
              </div>
              <div>
                <KV k="Verdict" v={<StatusBadge verdict={incident.verdict} size="sm" />} />
                <KV k="Trust score" v={`${incident.trustScore}/100`} />
                <KV k="TLS certificate" v={<StatusBadge verdict={incident.tlsStatus} size="sm" />} />
                <KV k="Classified vectors" v={<span className="block max-w-[260px] truncate">{incident.categories.join(', ')}</span>} />
              </div>
            </div>
            <div className="soc-well mt-2 px-3 py-2">
              <div className="soc-label">Consensus hash anchor</div>
              <div className="break-all font-mono text-[11px] text-soc-text-2">{incident.hashProof}</div>
            </div>
          </section>

          <section>
            <h3 className="mb-1.5 text-[13px] font-semibold text-soc-text">3. Compliance & governance alignment</h3>
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Control</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono text-soc-text">NIST CSF 2.0</td>
                  <td className="font-mono">DE.CM-01</td>
                  <td>Continuous threat monitoring</td>
                </tr>
                <tr>
                  <td className="font-mono text-soc-text">NIST CSF 2.0</td>
                  <td className="font-mono">RS.AN-03</td>
                  <td>Forensic analysis</td>
                </tr>
                <tr>
                  <td className="font-mono text-soc-text">ISO/IEC 27001:2022</td>
                  <td className="font-mono">A.8.16</td>
                  <td>Monitoring activities</td>
                </tr>
                <tr>
                  <td className="font-mono text-soc-text">ISO/IEC 27001:2022</td>
                  <td className="font-mono">A.8.23</td>
                  <td>Web filtering</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="border-t border-soc-line pt-4">
            <h3 className="mb-1.5 text-[13px] font-semibold text-soc-text">4. Incident response recommendations</h3>
            <ol className="list-inside list-decimal space-y-1 text-xs">
              {recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </section>
        </div>
      </article>
    </div>
  );
};
