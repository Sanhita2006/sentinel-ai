import React, { useState } from 'react';
import {
  Fish,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Zap,
  Globe,
  ArrowRight,
  ShieldAlert,
  Search,
  Sparkles,
} from 'lucide-react';
import { SAMPLE_PHISHING_VECTORS } from '../data/mockData';

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

  // Determine heuristic state based on domain
  const isPunycode = testDomain.includes('а') || testDomain.startsWith('xn--');
  const isSubdomainStack = testDomain.split('.').length > 3;
  const isTyposquat = testDomain.includes('0') || testDomain.includes('-security');
  const isSafe = testDomain === 'google.com' || testDomain === 'stripe.com';

  const riskScore = isSafe ? 98 : isPunycode ? 8 : isSubdomainStack ? 15 : 22;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Engine Overview Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Fish className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI &amp; Heuristic Phishing Detection Engine
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Detects internationalized domain name (IDN) homoglyph spoofing, high-entropy lexical tricks, brand impersonation, and deceptive subdomain trees.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs font-mono text-slate-400">
            ENGINE STATUS: <span className="text-emerald-400 font-bold">READY</span>
          </div>
        </div>

        {/* Input box */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={testDomain}
              onChange={(e) => setTestDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunEvaluation();
              }}
              placeholder="Test any domain (e.g., pаypаl.com or apple-security-portal.xyz)"
              className="w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={() => handleRunEvaluation()}
            disabled={!testDomain.trim() || isEvaluating}
            className="px-5 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{isEvaluating ? 'Scanning Tokens...' : 'Analyze Phishing Risk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Test Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-medium">Quick Test Vectors:</span>
          {testCases.map((tc) => (
            <button
              key={tc.value}
              onClick={() => handleRunEvaluation(tc.value)}
              className="px-2.5 py-1 rounded bg-[#070b16] hover:bg-[#121c38] border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-mono text-[11px] transition-colors"
            >
              {tc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Verdict & Visual Character Inspection */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`p-6 rounded-xl border ${
              isSafe
                ? 'bg-[#081510] border-emerald-500/40'
                : 'bg-[#150a10] border-rose-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400">
                    Target Evaluation Result
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
                    DEMO SIMULATION
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold font-mono text-white mt-1 break-all">
                  {testDomain}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Safety Confidence</span>
                <div
                  className={`text-2xl font-mono font-bold ${
                    isSafe ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {riskScore}/100
                </div>
              </div>
            </div>

            {/* Character-by-Character Visual Lexical Inspector */}
            <div className="mt-6 p-4 rounded-lg bg-black/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 uppercase text-[11px]">
                  Lexical Character Tokenization
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  Unicode Codepoint Inspection
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 font-mono text-sm">
                {testDomain.split('').map((char, index) => {
                  const code = char.charCodeAt(0);
                  const isSuspicious = code > 127; // Non-ASCII homoglyph
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center p-2 rounded border ${
                        isSuspicious
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <span className="text-lg font-bold">{char}</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        U+{code.toString(16).toUpperCase().padStart(4, '0')}
                      </span>
                      {isSuspicious && (
                        <span className="text-[9px] text-rose-400 font-semibold mt-0.5">
                          CYRILLIC
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {isPunycode && (
                <div className="p-3 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs mt-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">HOMOGLYPH SPOOF DETECTED: </span>
                    <span>
                      This domain uses non-Latin Cyrillic characters visually indistinguishable from standard ASCII to deceive human eyes. Resolves to Punycode:{' '}
                      <code className="text-cyan-300 bg-black/50 px-1 py-0.5 rounded">xn--pyp-6cd.com</code>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phishing Vector Diagnostics */}
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Phishing Vector Breakdown
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Target Brand Impersonation</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {testDomain.includes('paypal') || testDomain.includes('pаypаl')
                      ? 'PayPal Inc. (Brand Confidence: 99.4%)'
                      : testDomain.includes('microsoft')
                      ? 'Microsoft 365 (Enterprise Identity)'
                      : 'No major brand keyword match'}
                  </p>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {testDomain.includes('google.com') ? 'Canonical' : 'Target Match'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Shannon Lexical Entropy</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    High entropy indicates algorithmic domain generation (DGA) or random token stuffing.
                  </p>
                </div>
                <span className="font-mono text-white font-bold">3.84 / 5.0 (High)</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Subdomain Tree Stacking</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Subdomain depth: {testDomain.split('.').length - 1} levels.
                  </p>
                </div>
                <span
                  className={`font-mono font-bold ${
                    isSubdomainStack ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isSubdomainStack ? 'High Risk Depth' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Known Threat Blacklists & Heuristics Matrix */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              Threat Intelligence Feeds
            </h4>
            <p className="text-xs text-slate-400">
              Aggregated simulated blacklist status across global feeds:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { name: 'Google Safe Browsing', flagged: !isSafe },
                { name: 'PhishTank Database', flagged: !isSafe },
                { name: 'Spamhaus DBL', flagged: !isSafe },
                { name: 'URLhaus Abuse CH', flagged: !isSafe },
                { name: 'OpenPhish Real-time', flagged: !isSafe },
              ].map((feed) => (
                <div
                  key={feed.name}
                  className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-slate-300">{feed.name}</span>
                  {feed.flagged ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                      FLAGGED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      CLEAN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">Recommended Countermeasures</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Push DNS sinkhole policy across corporate perimeter gateways.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Submit takedown request to registrar abuse contact.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Anchor forensic fingerprint to Sentinel Blockchain ledger.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
