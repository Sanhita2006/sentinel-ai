import React, { useState } from 'react';
import { ShieldAlert, Terminal, Copy, Network, Cookie } from 'lucide-react';
import { SAMPLE_SECURITY_HEADERS } from '../data/mockData';
import { PageHeader, Panel, DataTag } from '../components/ui/Soc';
import { SeverityBadge } from '../components/common/StatusBadge';
import { SEVERITY_STYLES } from '../lib/severity';

export const SecurityAssessmentPage: React.FC = () => {
  const [targetHost, setTargetHost] = useState<string>('secure-login-chase-update.info');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const isHardened = targetHost.toLowerCase().includes('stripe') || targetHost.toLowerCase().includes('google');

  const activeHeaders = isHardened
    ? [
        {
          name: 'Content-Security-Policy',
          status: 'present' as const,
          value: "default-src 'self'; script-src 'self' https://js.stripe.com; object-src 'none';",
          recommendation: 'Strict CSP policy enforced with approved origin whitelist.',
          severity: 'low' as const,
        },
        {
          name: 'Strict-Transport-Security (HSTS)',
          status: 'present' as const,
          value: 'max-age=31536000; includeSubDomains; preload',
          recommendation: 'HSTS preloaded with 1-year duration.',
          severity: 'low' as const,
        },
        {
          name: 'X-Frame-Options',
          status: 'present' as const,
          value: 'DENY',
          recommendation: 'Clickjacking protection fully enabled.',
          severity: 'low' as const,
        },
        {
          name: 'X-Content-Type-Options',
          status: 'present' as const,
          value: 'nosniff',
          recommendation: 'MIME-sniffing protection enabled.',
          severity: 'low' as const,
        },
        {
          name: 'Referrer-Policy',
          status: 'present' as const,
          value: 'strict-origin-when-cross-origin',
          recommendation: 'Referrer credentials shielded on cross-origin requests.',
          severity: 'low' as const,
        },
        {
          name: 'Permissions-Policy',
          status: 'present' as const,
          value: 'camera=(), microphone=(), geolocation=()',
          recommendation: 'Hardware APIs restricted.',
          severity: 'low' as const,
        },
      ]
    : SAMPLE_SECURITY_HEADERS;

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const nginxFixSnippet = `# Recommended Nginx Hardened Security Headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; object-src 'none';" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;`;

  // Derived counts (case-insensitive) instead of a hard-coded deficiency figure.
  const deficiencies = activeHeaders.filter((h) => h.status.toLowerCase() !== 'present');
  const highDeficiencies = deficiencies.filter((h) => h.severity.toLowerCase() === 'high').length;

  const statusPill = (status: string) => {
    const s = status.toLowerCase();
    const st = SEVERITY_STYLES[s === 'present' ? 'clean' : s === 'misconfigured' ? 'medium' : 'critical'];
    return (
      <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase tracking-wider ${st.bg} ${st.border} ${st.text}`}>
        {status}
      </span>
    );
  };

  const ports = [
    { port: '80/TCP', service: 'HTTP', status: 'Open (No auto-redirect to 443)', state: 'bad' },
    { port: '443/TCP', service: 'HTTPS', status: 'Open (Weak Cipher Fallback)', state: 'warn' },
    { port: '8080/TCP', service: 'HTTP-Proxy', status: 'Open (Admin Console Exposed)', state: 'bad' },
    { port: '22/TCP', service: 'SSH', status: 'Filtered / Firewalled', state: 'good' },
    { port: '3389/TCP', service: 'RDP', status: 'Closed', state: 'good' },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={ShieldAlert}
        title="Website security posture assessment"
        description="Audit of defense-in-depth headers, cookie protections, exposed ports and attack-surface hardening."
        actions={
          <>
            <DataTag kind="demo" label="Demo audit" />
            <div className="flex items-center gap-2 rounded border border-soc-line bg-soc-well py-1 pl-2.5 pr-1">
              <span className="soc-label">Security grade</span>
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-sm border font-mono text-lg font-semibold ${
                  isHardened ? 'border-sev-clean/50 bg-sev-clean/10 text-sev-clean' : 'border-sev-critical/50 bg-sev-critical/10 text-sev-critical'
                }`}
              >
                {isHardened ? 'A+' : 'F'}
              </span>
            </div>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="soc-label mr-1">Evaluation target</span>
          <div className="soc-seg" role="tablist" aria-label="Evaluation target">
            <button
              role="tab"
              aria-selected={!isHardened}
              data-active={!isHardened}
              onClick={() => setTargetHost('secure-login-chase-update.info')}
              className="soc-seg-item"
            >
              Chase Phish (Grade F)
            </button>
            <button
              role="tab"
              aria-selected={isHardened}
              data-active={isHardened}
              onClick={() => setTargetHost('stripe.com')}
              className="soc-seg-item"
            >
              Stripe Infrastructure (Grade A+)
            </button>
          </div>
          <span className="font-mono text-[11px] text-soc-muted">target: {targetHost}</span>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel
            title="HTTP security headers audit"
            subtitle={<>Target <span className="font-mono text-soc-text-2">{targetHost}</span></>}
            flush
            actions={
              <span className={`font-mono text-[11px] font-semibold ${deficiencies.length === 0 ? 'text-sev-clean' : 'text-sev-critical'}`}>
                {deficiencies.length === 0
                  ? 'All standards enforced'
                  : `${deficiencies.length} deficiencies · ${highDeficiencies} high severity`}
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Header</th>
                    <th>Status</th>
                    <th>Severity</th>
                    <th>Recommendation / current value</th>
                  </tr>
                </thead>
                <tbody>
                  {activeHeaders.map((header) => (
                    <tr key={header.name}>
                      <td className="whitespace-nowrap align-top font-mono font-medium text-soc-text">{header.name}</td>
                      <td className="align-top">{statusPill(header.status)}</td>
                      <td className="align-top">
                        <SeverityBadge level={header.severity} />
                      </td>
                      <td className="min-w-[280px] align-top">
                        <p className="text-[11px] leading-relaxed">{header.recommendation}</p>
                        {header.value && (
                          <div className="soc-well mt-1.5 break-all px-2 py-1 font-mono text-[10.5px] text-soc-text-2">
                            <span className="text-soc-muted">current:</span> {header.value}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Nginx hardening configuration fix"
            icon={Terminal}
            actions={
              <button onClick={() => copySnippet(nginxFixSnippet, 'nginx')} className="soc-btn h-7 text-[11px]">
                <Copy className="h-3.5 w-3.5" />
                {copiedSnippet === 'nginx' ? 'Copied' : 'Copy config'}
              </button>
            }
          >
            <pre className="soc-well overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-soc-text-2">{nginxFixSnippet}</pre>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Port & surface exposure" icon={Network} flush actions={<DataTag kind="sample" />}>
            <table className="soc-table">
              <tbody>
                {ports.map((p) => {
                  const st = SEVERITY_STYLES[p.state === 'bad' ? 'critical' : p.state === 'warn' ? 'medium' : 'clean'];
                  return (
                    <tr key={p.port}>
                      <td>
                        <div className="font-mono font-semibold text-soc-text">
                          {p.port} <span className="font-normal text-soc-muted">({p.service})</span>
                        </div>
                        <div className="text-[11px] text-soc-muted">{p.status}</div>
                      </td>
                      <td className="text-right">
                        <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold ${st.bg} ${st.border} ${st.text}`}>
                          {p.state === 'bad' ? 'RISK' : p.state === 'warn' ? 'WARN' : 'SECURE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-soc-line px-4 py-2 text-[11px] text-soc-muted">Sample exposure profile. No port scan is performed.</p>
          </Panel>

          <Panel title="Session cookie flags" icon={Cookie} flush actions={<DataTag kind="sample" />}>
            <table className="soc-table">
              <tbody>
                <tr>
                  <td className="font-mono text-soc-text-2">Secure flag</td>
                  <td className="text-right font-mono font-semibold text-sev-critical">Missing</td>
                </tr>
                <tr>
                  <td className="font-mono text-soc-text-2">HttpOnly flag</td>
                  <td className="text-right font-mono font-semibold text-sev-critical">Missing (XSS risk)</td>
                </tr>
                <tr>
                  <td className="font-mono text-soc-text-2">SameSite attribute</td>
                  <td className="text-right font-mono font-semibold text-sev-medium">None</td>
                </tr>
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </div>
  );
};
