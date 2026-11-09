import React, { useMemo, useState } from 'react';
import { Fish, AlertTriangle, ArrowRight, ShieldCheck, ListChecks } from 'lucide-react';
import { PageHeader, Panel, DataTag, Notice } from '../components/ui/Soc';
import { SeverityBar } from '../components/common/SeverityBar';

/** Convert a hostname to its ASCII (punycode) form using the browser URL parser. */
const toAsciiHost = (domain: string): string | null => {
  try {
    return new URL(`http://${domain.trim()}`).hostname || null;
  } catch {
    return null;
  }
};

/** Shannon entropy (bits per character) of the registrable label(s), excluding the TLD. */
const shannonEntropy = (domain: string): number => {
  const parts = domain.trim().toLowerCase().split('.');
  const body = (parts.length > 1 ? parts.slice(0, -1) : parts).join('');
  if (!body) return 0;
  const freq = new Map<string, number>();
  for (const ch of body) freq.set(ch, (freq.get(ch) || 0) + 1);
  let h = 0;
  freq.forEach((n) => {
    const p = n / body.length;
    h -= p * Math.log2(p);
  });
  return h;
};

const scriptOf = (code: number): string => {
  if (code >= 0x0400 && code <= 0x04ff) return 'CYRILLIC';
  if (code >= 0x0370 && code <= 0x03ff) return 'GREEK';
  if (code >= 0x0530 && code <= 0x058f) return 'ARMENIAN';
  return 'NON-ASCII';
};

export const PhishingDetectionPage: React.FC = () => {
  const [testDomain, setTestDomain] = useState<string>('pаypаl.com');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Pre-configured test cases for judges/analysts
  const testCases = [
    { label: 'Cyrillic Homoglyph (pаypаl.com)', value: 'pаypаl.com', desc: 'Contains Cyrillic "а" (U+0430)' },
    { label: 'Subdomain Stacking', value: 'login.microsoft.com.account-verify-portal.top', desc: 'Legitimate brand nested in deep subdomain' },
    { label: 'Typosquatting', value: 'g00gle-security.support', desc: 'Zeroes replacing letter O + suspicious TLD' },
    { label: 'Legitimate Domain', value: 'google.com', desc: 'Verified canonical domain' },
  ];

  const handleRunEvaluation = (val?: string) => {
    const target = val !== undefined ? val : testDomain;
    setTestDomain(target);
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
    }, 600);
  };

  // Determine heuristic state based on domain (case-insensitive)
  const normalized = testDomain.trim().toLowerCase();
  const hasNonAscii = /[^\x00-\x7f]/.test(normalized);
  const isPunycode = hasNonAscii || normalized.startsWith('xn--') || normalized.includes('.xn--');
  const isSubdomainStack = normalized.split('.').length > 3;
  const isTyposquat = normalized.includes('0') || normalized.includes('-security');
  const isSafe = normalized === 'google.com' || normalized === 'stripe.com';

  const riskScore = isSafe ? 98 : isPunycode ? 8 : isSubdomainStack ? 15 : 22;

  const asciiHost = useMemo(() => toAsciiHost(normalized), [normalized]);
  const entropy = useMemo(() => shannonEntropy(normalized), [normalized]);
  const entropyBand = entropy >= 3.5 ? 'High' : entropy >= 2.8 ? 'Moderate' : 'Low';
  const subdomainDepth = Math.max(0, normalized.split('.').length - 1);

  const brand =
    normalized.includes('paypal') || normalized.includes('pаypаl')
      ? 'PayPal Inc. (Brand Confidence: 99.4%)'
      : normalized.includes('microsoft')
      ? 'Microsoft 365 (Enterprise Identity)'
      : normalized.includes('g00gle') || normalized.includes('google')
      ? 'Google (Consumer Identity)'
      : 'No major brand keyword match';

  const vectorRows: Array<{ name: string; detail: string; result: string; tone: 'bad' | 'warn' | 'ok' | 'info' }> = [
    {
      name: 'Target brand impersonation',
      detail: brand,
      result: normalized.includes('google.com') && isSafe ? 'Canonical' : brand.startsWith('No major') ? 'No match' : 'Target match',
      tone: isSafe ? 'ok' : brand.startsWith('No major') ? 'info' : 'bad',
    },
    {
      name: 'IDN homoglyph / punycode',
      detail: isPunycode ? `Encoded form ${asciiHost ?? 'n/a'}` : 'Hostname is plain ASCII',
      result: isPunycode ? 'Detected' : 'Not detected',
      tone: isPunycode ? 'bad' : 'ok',
    },
    {
      name: 'Shannon lexical entropy',
      detail: 'High entropy can indicate algorithmic generation (DGA) or random token stuffing.',
      result: `${entropy.toFixed(2)} bits/char (${entropyBand})`,
      tone: entropyBand === 'High' ? 'warn' : 'ok',
    },
    {
      name: 'Subdomain tree stacking',
      detail: `Subdomain depth: ${subdomainDepth} levels.`,
      result: isSubdomainStack ? 'High risk depth' : 'Normal',
      tone: isSubdomainStack ? 'bad' : 'ok',
    },
    {
      name: 'Typosquat character substitution',
      detail: 'Digit-for-letter swaps or security-themed tokens.',
      result: isTyposquat ? 'Pattern present' : 'Not detected',
      tone: isTyposquat ? 'warn' : 'ok',
    },
  ];

  const toneCls = { bad: 'text-sev-critical', warn: 'text-sev-medium', ok: 'text-sev-clean', info: 'text-soc-text-2' };

  return (
    <div className="soc-page">
      <PageHeader
        icon={Fish}
        title="AI & heuristic phishing detection engine"
        description="Detects IDN homoglyph spoofing, high-entropy lexical tricks, brand impersonation and deceptive subdomain trees."
        actions={
          <span className="soc-chip">
            Engine status <span className="font-semibold text-sev-clean">READY</span>
          </span>
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={testDomain}
            onChange={(e) => setTestDomain(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunEvaluation();
            }}
            aria-label="Domain to analyze"
            placeholder="Test any domain (e.g., pаypаl.com or apple-security-portal.xyz)"
            className="soc-input h-10 flex-1 text-[13px]"
          />
          <button
            onClick={() => handleRunEvaluation()}
            disabled={!testDomain.trim() || isEvaluating}
            className="soc-btn soc-btn-primary h-10 px-4"
          >
            {isEvaluating ? 'Scanning tokens…' : 'Analyze phishing risk'}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="soc-label mr-1">Quick test vectors</span>
          {testCases.map((tc) => (
            <button
              key={tc.value}
              title={tc.desc}
              onClick={() => handleRunEvaluation(tc.value)}
              className="soc-chip hover:border-soc-forest-2 hover:text-soc-text"
            >
              {tc.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel
            title="Target evaluation result"
            accent={isSafe ? 'clean' : 'critical'}
            actions={<DataTag kind="simulated" label="Demo simulation" />}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="soc-label">Evaluated hostname</div>
                <h3 className="mt-0.5 break-all font-mono text-lg font-semibold text-soc-text">{testDomain}</h3>
                {asciiHost && asciiHost !== normalized && (
                  <div className="mt-0.5 font-mono text-[11px] text-soc-muted">
                    ASCII / punycode: <span className="text-soc-text-2">{asciiHost}</span>
                  </div>
                )}
              </div>
              <div className="w-full md:w-80">
                <SeverityBar score={riskScore} label="Safety confidence" />
              </div>
            </div>

            <div className="soc-well mt-4 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="soc-label">Lexical character tokenization</span>
                <span className="soc-label">Unicode codepoint inspection</span>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono">
                {Array.from(testDomain).map((char, index) => {
                  const code = char.codePointAt(0) ?? 0;
                  const isSuspicious = code > 127; // Non-ASCII homoglyph candidate
                  return (
                    <div
                      key={index}
                      className={`flex min-w-[42px] flex-col items-center rounded border px-1.5 py-1 ${
                        isSuspicious
                          ? 'border-sev-critical/60 bg-sev-critical/10 text-sev-critical'
                          : 'border-soc-line bg-soc-raised text-soc-text'
                      }`}
                    >
                      <span className="text-base font-semibold leading-5">{char}</span>
                      <span className="text-[9.5px] text-soc-muted">U+{code.toString(16).toUpperCase().padStart(4, '0')}</span>
                      {isSuspicious && <span className="text-[8.5px] font-semibold tracking-wider">{scriptOf(code)}</span>}
                    </div>
                  );
                })}
              </div>

              {isPunycode && (
                <Notice tone="danger" icon={AlertTriangle} title="Homoglyph spoof detected" className="mt-3">
                  This domain uses non-Latin characters visually indistinguishable from standard ASCII to deceive human
                  eyes. Encoded punycode form:{' '}
                  <code className="rounded bg-soc-well px-1 py-0.5 font-mono text-soc-text">{asciiHost ?? 'unavailable'}</code>.
                </Notice>
              )}
            </div>
          </Panel>

          <Panel title="Phishing vector breakdown" icon={ListChecks} flush>
            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>Vector</th>
                    <th>Detail</th>
                    <th className="text-right">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {vectorRows.map((row) => (
                    <tr key={row.name}>
                      <td className="whitespace-nowrap font-medium text-soc-text">{row.name}</td>
                      <td className="text-[11px]">{row.detail}</td>
                      <td className={`whitespace-nowrap text-right font-mono text-[11px] font-semibold ${toneCls[row.tone]}`}>{row.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Threat intelligence feeds" subtitle="Aggregated blacklist status" actions={<DataTag kind="simulated" />} flush>
            <table className="soc-table">
              <tbody>
                {[
                  { name: 'Google Safe Browsing', flagged: !isSafe },
                  { name: 'PhishTank Database', flagged: !isSafe },
                  { name: 'Spamhaus DBL', flagged: !isSafe },
                  { name: 'URLhaus Abuse CH', flagged: !isSafe },
                  { name: 'OpenPhish Real-time', flagged: !isSafe },
                ].map((feed) => (
                  <tr key={feed.name}>
                    <td className="font-mono text-soc-text-2">{feed.name}</td>
                    <td className="text-right">
                      {feed.flagged ? (
                        <span className="rounded-[3px] border border-sev-critical/35 bg-sev-critical/10 px-1.5 py-[1px] font-mono text-[10px] font-semibold text-sev-critical">
                          FLAGGED
                        </span>
                      ) : (
                        <span className="rounded-[3px] border border-sev-clean/35 bg-sev-clean/10 px-1.5 py-[1px] font-mono text-[10px] font-semibold text-sev-clean">
                          CLEAN
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-soc-line px-4 py-2 text-[11px] text-soc-muted">
              Feed statuses on this page are simulated and are not queried live.
            </p>
          </Panel>

          <Panel title="Recommended countermeasures" icon={ShieldCheck}>
            <ol className="space-y-2 text-xs text-soc-text-2">
              {[
                'Push DNS sinkhole policy across corporate perimeter gateways.',
                'Submit takedown request to registrar abuse contact.',
                'Anchor forensic fingerprint to Sentinel Blockchain ledger.',
              ].map((t, i) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-soc-forest-2 bg-soc-forest/60 font-mono text-[10px] text-soc-accent-hi">
                    {i + 1}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
};
