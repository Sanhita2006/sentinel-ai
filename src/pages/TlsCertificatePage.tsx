import React, { useState } from 'react';
import { Lock, AlertTriangle, CheckCircle2, XCircle, Copy, ShieldAlert, KeyRound } from 'lucide-react';
import { SAMPLE_TLS_CERTIFICATE } from '../data/mockData';
import { PageHeader, Panel, DataTag, KV, Notice } from '../components/ui/Soc';

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

  const isUntrustedRoot = selectedPreset === 'expired';
  const verdictTone =
    selectedPreset === 'stripe' ? 'text-sev-clean' : selectedPreset === 'expired' ? 'text-sev-critical' : 'text-sev-medium';
  const accent = selectedPreset === 'stripe' ? 'clean' : selectedPreset === 'expired' ? 'critical' : 'medium';

  const presets: Array<{ id: 'zerossl' | 'stripe' | 'expired'; label: string; domain: string }> = [
    { id: 'zerossl', label: 'ZeroSSL Phish', domain: 'secure-login-chase-update.info' },
    { id: 'stripe', label: 'Stripe EV (Secure)', domain: 'stripe.com' },
    { id: 'expired', label: 'Expired / Legacy', domain: 'outdated-admin-portal.internal-corp.net' },
  ];

  const chain = [
    {
      level: 'Level 1 · Root certificate authority (trust anchor)',
      name: activeCert.rootCa,
      status: isUntrustedRoot ? 'Not in root store' : 'Root store verified',
      ok: !isUntrustedRoot,
    },
    {
      level: 'Level 2 · Intermediate issuing CA',
      name: activeCert.intermediateCa,
      status: activeCert.intermediateCa.toLowerCase().startsWith('none') ? 'Not present' : 'Chained',
      ok: !activeCert.intermediateCa.toLowerCase().startsWith('none'),
    },
    {
      level: 'Level 3 · Server leaf certificate',
      name: activeCert.subject,
      status:
        activeCert.daysRemaining > 0
          ? `${activeCert.daysRemaining} days remaining`
          : `Expired (${Math.abs(activeCert.daysRemaining)} days ago)`,
      ok: activeCert.daysRemaining > 0,
    },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={Lock}
        title="TLS / SSL certificate intelligence"
        description="Inspect cryptographic trust chains, cipher suites and Certificate Transparency logs; detect rogue certificates and SSL-stripping setups."
        actions={<DataTag kind="demo" label="Demo telemetry" />}
      >
        <div className="flex flex-col gap-2 lg:flex-row">
          <form onSubmit={handleDomainSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              value={queryDomain}
              onChange={(e) => setQueryDomain(e.target.value)}
              aria-label="Domain to inspect"
              placeholder="Enter domain to inspect TLS certificate (e.g. stripe.com, chase-update.info)…"
              className="soc-input h-9 flex-1"
            />
            <button type="submit" className="soc-btn soc-btn-primary h-9">
              Inspect
            </button>
          </form>
          <div className="soc-seg shrink-0 overflow-x-auto" role="tablist" aria-label="Certificate presets">
            {presets.map((p) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={selectedPreset === p.id}
                data-active={selectedPreset === p.id}
                onClick={() => {
                  setSelectedPreset(p.id);
                  setQueryDomain(p.domain);
                }}
                className="soc-seg-item"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Cryptographic trust hierarchy" actions={<span className="soc-label">X.509 v3 chain</span>}>
            <ol className="relative space-y-2">
              {chain.map((node, i) => (
                <li key={node.level} className="relative pl-6">
                  {i < chain.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%+0.5rem)] w-px bg-soc-line-strong" />}
                  <span
                    className={`absolute left-0 top-3 flex h-[15px] w-[15px] items-center justify-center rounded-full border ${
                      node.ok ? 'border-sev-clean/60 bg-sev-clean/15' : 'border-sev-critical/60 bg-sev-critical/15'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${node.ok ? 'bg-sev-clean' : 'bg-sev-critical'}`} />
                  </span>
                  <div className={`soc-well p-3 ${i === 2 && !node.ok ? 'border-sev-critical/40' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="soc-label">{node.level}</span>
                      <span className={`flex items-center gap-1 font-mono text-[11px] font-medium ${node.ok ? 'text-sev-clean' : 'text-sev-critical'}`}>
                        {node.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {node.status}
                      </span>
                    </div>
                    <p className="mt-1 break-all font-mono text-[13px] font-semibold text-soc-text">{node.name}</p>
                    {i === 2 && (
                      <div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[11px] text-soc-muted">
                        <span>sig {activeCert.signatureAlgorithm}</span>
                        <span>serial {activeCert.serialNumber}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel title="Cryptographic parameters & ciphers" icon={KeyRound}>
            <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
              <div>
                <KV k="Negotiated protocol" v={activeCert.protocol} />
                <KV k="Active cipher suite" v={<span className="break-words">{activeCert.ciphers}</span>} />
              </div>
              <div>
                <KV
                  k="OCSP stapling"
                  v={activeCert.ocspStapling ? 'Enabled & validated' : 'Disabled (fallback to CRL)'}
                  vClassName={activeCert.ocspStapling ? 'text-sev-clean' : 'text-sev-medium'}
                />
                <KV
                  k="CT log inclusion"
                  v={activeCert.ctLogVerified ? 'Logged in Google Argon / Cloudflare' : 'No public CT logs found'}
                  vClassName={activeCert.ctLogVerified ? 'text-sev-clean' : 'text-sev-critical'}
                />
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Certificate security posture" icon={ShieldAlert} accent={accent}>
            <div className="soc-label">Assessment verdict</div>
            <p className={`mt-0.5 font-mono text-sm font-semibold ${verdictTone}`}>{activeCert.trustVerdict}</p>
            <div className="mt-1 font-mono text-[11px] text-soc-muted">Target {activeCert.target}</div>

            <div className="mt-4">
              <div className="soc-label mb-1.5">Identified vulnerabilities ({activeCert.weaknesses.length})</div>
              {activeCert.weaknesses.length === 0 ? (
                <Notice tone="ok" icon={CheckCircle2}>
                  No cryptographic flaws or insecure cipher suites detected.
                </Notice>
              ) : (
                <ul className="space-y-1.5">
                  {activeCert.weaknesses.map((w) => (
                    <li key={w} className="flex items-start gap-2 rounded border border-sev-critical/30 bg-sev-critical/[0.06] px-2.5 py-2 text-xs text-soc-text-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sev-critical" />
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel
            title="Fingerprint"
            subtitle="SHA-256"
            actions={
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(activeCert.fingerprintSha256);
                  setCopiedFingerprint(true);
                  setTimeout(() => setCopiedFingerprint(false), 2000);
                }}
                className="soc-btn soc-btn-ghost h-7 text-[11px]"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedFingerprint ? 'Copied' : 'Copy'}
              </button>
            }
          >
            <p className="select-all break-all font-mono text-[11px] leading-relaxed text-soc-text-2">{activeCert.fingerprintSha256}</p>
          </Panel>

        </div>
      </div>
    </div>
  );
};
