import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Key,
  Layers,
  Calendar,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Search,
} from 'lucide-react';
import { SAMPLE_TLS_CERTIFICATE } from '../data/mockData';

export const TlsCertificatePage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'zerossl' | 'stripe' | 'expired'>('zerossl');
  const [queryDomain, setQueryDomain] = useState<string>('secure-login-chase-update.info');
  const [copiedFingerprint, setCopiedFingerprint] = useState<boolean>(false);

  const certificates = {
    zerossl: {
      ...SAMPLE_TLS_CERTIFICATE,
      target: queryDomain || 'secure-login-chase-update.info',
      subject: `CN=${queryDomain || 'secure-login-chase-update.info'}`,
      issuer: 'CN=ZeroSSL ECC Domain Secure Site CA, O=ZeroSSL, C=AT',
      trustVerdict: 'Suspicious (Free 90-Day Automated Issuer)',
      daysRemaining: 87,
      rootCa: 'USERTrust RSA Certification Authority (Sectigo)',
      intermediateCa: 'ZeroSSL ECC Domain Secure Site CA',
      protocol: 'TLS 1.3 / TLS 1.2 Supported',
      ciphers: 'TLS_AES_128_GCM_SHA256 (PFS Enabled)',
      ocspStapling: false,
      ctLogVerified: true,
      weaknesses: ['Lack of Organizational Validation (DV only)', 'High churn issuer used for phishing'],
    },
    stripe: {
      ...SAMPLE_TLS_CERTIFICATE,
      target: 'stripe.com',
      subject: 'CN=stripe.com, O=Stripe, Inc., L=San Francisco, ST=California, C=US',
      issuer: 'CN=DigiCert Global G2 TLS RSA SHA256 2020 CA1, O=DigiCert Inc, C=US',
      trustVerdict: 'Enterprise Grade (Extended Validation EV)',
      daysRemaining: 240,
      rootCa: 'DigiCert Global Root G2',
      intermediateCa: 'DigiCert Global G2 TLS RSA SHA256 2020 CA1',
      protocol: 'Strict TLS 1.3 Only (TLS 1.0/1.1 Disabled)',
      ciphers: 'TLS_AES_256_GCM_SHA384 (ECDHE-RSA-AES256-GCM-SHA384)',
      ocspStapling: true,
      ctLogVerified: true,
      weaknesses: [],
    },
    expired: {
      ...SAMPLE_TLS_CERTIFICATE,
      target: 'outdated-admin-portal.internal-corp.net',
      subject: 'CN=outdated-admin-portal.internal-corp.net',
      issuer: 'CN=Self-Signed Development CA',
      trustVerdict: 'Critical Untrusted (Expired Certificate)',
      daysRemaining: -42,
      rootCa: 'Self-Signed Development CA (Untrusted in Root Store)',
      intermediateCa: 'None (Direct Self-Signed)',
      protocol: 'Deprecated TLS 1.0 & TLS 1.1 Enabled',
      ciphers: 'RC4-MD5 / 3DES (Insecure Legacy Ciphers)',
      ocspStapling: false,
      ctLogVerified: false,
      weaknesses: ['Certificate expired 42 days ago', 'Untrusted private CA', 'Vulnerable to POODLE and BEAST'],
    },
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = queryDomain.trim().toLowerCase();
    if (!clean) return;
    if (clean.includes('stripe') || clean.includes('google') || clean.includes('apple')) {
      setSelectedPreset('stripe');
    } else if (clean.includes('expired') || clean.includes('old') || clean.includes('internal')) {
      setSelectedPreset('expired');
    } else {
      setSelectedPreset('zerossl');
    }
  };

  const activeCert = certificates[selectedPreset];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                TLS / SSL Certificate Intelligence
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Inspect cryptographic trust chains, cipher suites, Certificate Transparency (CT) logs, and detect rogue certificates or SSL-stripping setups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              DEMO TELEMETRY
            </span>
          </div>
        </div>

        {/* Domain Search & Preset Selector */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleDomainSubmit} className="relative flex-1">
            <input
              type="text"
              value={queryDomain}
              onChange={(e) => setQueryDomain(e.target.value)}
              placeholder="Enter domain to inspect TLS certificate (e.g. stripe.com, chase-update.info)..."
              className="w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </form>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#050811] rounded-lg border border-slate-800 text-xs shrink-0 overflow-x-auto">
            <button
              onClick={() => {
                setSelectedPreset('zerossl');
                setQueryDomain('secure-login-chase-update.info');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedPreset === 'zerossl'
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ZeroSSL Phish
            </button>
            <button
              onClick={() => {
                setSelectedPreset('stripe');
                setQueryDomain('stripe.com');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedPreset === 'stripe'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Stripe EV (Secure)
            </button>
            <button
              onClick={() => {
                setSelectedPreset('expired');
                setQueryDomain('outdated-admin-portal.internal-corp.net');
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedPreset === 'expired'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expired / Legacy
            </button>
          </div>
        </div>
      </div>

      {/* Target Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Chain Visualization */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Cryptographic Trust Hierarchy
            </h3>
            <span className="text-xs font-mono text-cyan-400">X.509 v3 Chain</span>
          </div>

          {/* Visual 3-tier chain */}
          <div className="space-y-4 relative">
            {/* Tier 1: Root CA */}
            <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-1 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Level 1 · Root Certificate Authority (Trust Anchor)
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Root Store Verified
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-white">{activeCert.rootCa}</p>
            </div>

            <div className="w-0.5 h-4 bg-cyan-500/40 mx-auto" />

            {/* Tier 2: Intermediate CA */}
            <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-1 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Level 2 · Intermediate Issuing CA
                </span>
                <span className="text-xs font-mono text-cyan-400">Cross-Signed</span>
              </div>
              <p className="text-sm font-mono font-bold text-cyan-200">{activeCert.intermediateCa}</p>
            </div>

            <div className="w-0.5 h-4 bg-cyan-500/40 mx-auto" />

            {/* Tier 3: Leaf Certificate */}
            <div
              className={`p-4 rounded-lg border space-y-2 relative ${
                selectedPreset === 'expired'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-[#060a14] border-cyan-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Level 3 · Server Leaf Certificate
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    activeCert.daysRemaining > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activeCert.daysRemaining > 0
                    ? `${activeCert.daysRemaining} Days Remaining`
                    : `Expired (${Math.abs(activeCert.daysRemaining)} Days Ago)`}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-white break-all">{activeCert.subject}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>Sig: {activeCert.signatureAlgorithm}</span>
                <span>·</span>
                <span>Serial: {activeCert.serialNumber}</span>
              </div>
            </div>
          </div>

          {/* Cipher Suites & Protocols */}
          <div className="p-4 rounded-lg bg-[#060a14] border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              Cryptographic Parameters &amp; Ciphers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[11px]">Negotiated Protocol:</span>
                <p className="text-white font-semibold mt-0.5">{activeCert.protocol}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Active Cipher Suite:</span>
                <p className="text-cyan-300 font-semibold mt-0.5 break-all">{activeCert.ciphers}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">OCSP Stapling:</span>
                <p
                  className={`font-semibold mt-0.5 ${
                    activeCert.ocspStapling ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {activeCert.ocspStapling ? 'Enabled & Validated' : 'Disabled (Fallback to CRL)'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">CT Log Inclusion:</span>
                <p
                  className={`font-semibold mt-0.5 ${
                    activeCert.ctLogVerified ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activeCert.ctLogVerified ? 'Logged in Google Argon / Cloudflare' : 'No Public CT Logs Found'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Weaknesses & Telemetry summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Certificate Security Posture
            </h3>

            <div className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Assessment Verdict</span>
              <p
                className={`text-sm font-mono font-bold ${
                  selectedPreset === 'stripe'
                    ? 'text-emerald-400'
                    : selectedPreset === 'expired'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {activeCert.trustVerdict}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Identified Vulnerabilities:</span>
              {activeCert.weaknesses.length === 0 ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No cryptographic flaws or insecure cipher suites detected.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeCert.weaknesses.map((w) => (
                    <div
                      key={w}
                      className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Fingerprint SHA-256</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(activeCert.fingerprintSha256);
                    setCopiedFingerprint(true);
                    setTimeout(() => setCopiedFingerprint(false), 2000);
                  }}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  {copiedFingerprint ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-[10px] text-slate-300 break-all select-all p-2 rounded bg-[#060a14] border border-slate-800">
                {activeCert.fingerprintSha256}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
