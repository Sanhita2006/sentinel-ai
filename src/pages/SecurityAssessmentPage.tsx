import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Terminal,
  ExternalLink,
  Search,
} from 'lucide-react';
import { SAMPLE_SECURITY_HEADERS } from '../data/mockData';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Website Security Posture Assessment
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Automated audit of defense-in-depth headers, cookie protections, exposed ports, and attack surface hardening.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              DEMO AUDIT
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Security Grade:</span>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl font-mono shadow-lg ${
                  isHardened
                    ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 shadow-emerald-950/50'
                    : 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-rose-950/50'
                }`}
              >
                {isHardened ? 'A+' : 'F'}
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Select Evaluation Target:</span>
          <button
            onClick={() => setTargetHost('secure-login-chase-update.info')}
            className={`px-3 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
              !isHardened
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 font-bold'
                : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Chase Phish (Grade F)
          </button>
          <button
            onClick={() => setTargetHost('stripe.com')}
            className={`px-3 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
              isHardened
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-[#060a14] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Stripe Infrastructure (Grade A+)
          </button>
        </div>
      </div>

      {/* Grid of Security Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Security Headers Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  HTTP Security Headers Audit
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target: <span className="font-mono text-cyan-300">{targetHost}</span>
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  isHardened ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isHardened ? 'All Standards Enforced' : '4 Critical Deficiencies'}
              </span>
            </div>

            <div className="space-y-3">
              {activeHeaders.map((header) => (
                <div
                  key={header.name}
                  className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">
                        {header.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          header.status === 'present'
                            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                            : header.status === 'misconfigured'
                            ? 'bg-amber-950/50 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {header.status}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      Severity: {header.severity}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">{header.recommendation}</p>

                  {header.value && (
                    <div className="p-2 rounded bg-black/60 font-mono text-[11px] text-cyan-300 border border-slate-800">
                      Current Value: {header.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Snippet */}
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white font-mono">
                  Nginx Hardening Configuration Fix
                </h4>
              </div>
              <button
                onClick={() => copySnippet(nginxFixSnippet, 'nginx')}
                className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedSnippet === 'nginx' ? 'Copied!' : 'Copy Config'}
              </button>
            </div>
            <pre className="p-4 rounded-lg bg-[#050811] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
              {nginxFixSnippet}
            </pre>
          </div>
        </div>

        {/* Right Col: Exposed Ports & Cookie Security Posture */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Port &amp; Surface Exposure
            </h3>
            <div className="space-y-2 text-xs font-mono">
              {[
                { port: '80/TCP', service: 'HTTP', status: 'Open (No auto-redirect to 443)', state: 'bad' },
                { port: '443/TCP', service: 'HTTPS', status: 'Open (Weak Cipher Fallback)', state: 'warn' },
                { port: '8080/TCP', service: 'HTTP-Proxy', status: 'Open (Admin Console Exposed)', state: 'bad' },
                { port: '22/TCP', service: 'SSH', status: 'Filtered / Firewalled', state: 'good' },
                { port: '3389/TCP', service: 'RDP', status: 'Closed', state: 'good' },
              ].map((p) => (
                <div
                  key={p.port}
                  className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-bold">{p.port}</span>
                    <span className="text-slate-400 ml-2">({p.service})</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.status}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.state === 'bad'
                        ? 'text-rose-400 bg-rose-950/40 border border-rose-500/30'
                        : p.state === 'warn'
                        ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                        : 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                    }`}
                  >
                    {p.state === 'bad' ? 'RISK' : p.state === 'warn' ? 'WARN' : 'SECURE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cookie Security Flags */}
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Session Cookie Flags
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-slate-300">Secure Flag</span>
                <span className="text-rose-400 font-mono font-bold">Missing</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-slate-300">HttpOnly Flag</span>
                <span className="text-rose-400 font-mono font-bold">Missing (XSS Risk)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-slate-300">SameSite Attribute</span>
                <span className="text-amber-400 font-mono font-bold">None</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
