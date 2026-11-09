import React, { useState } from 'react';
import {
  MailWarning,
  Mail,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { SAMPLE_SCAM_MESSAGES } from '../data/mockData';
import { StatusBadge } from '../components/common/StatusBadge';

export const ScamMessageAnalysisPage: React.FC = () => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('scam-email-1');
  const [customText, setCustomText] = useState<string>(SAMPLE_SCAM_MESSAGES[0].rawText);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeChannel, setActiveChannel] = useState<'email' | 'sms' | 'chat'>('email');
  const [analysisResult, setAnalysisResult] = useState<null | {
    urgencyLevel: string;
    manipulationTactics: string[];
    impersonatedEntity: string;
    confidenceScore: number;
    analystSummary: string;
    extractedLinks: Array<{ url: string; status: string }>;
    headerAuthStatus: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSample = (sample: typeof SAMPLE_SCAM_MESSAGES[0]) => {
    setSelectedSampleId(sample.id);
    setCustomText(sample.rawText);
    setActiveChannel(sample.sourceType);
  };

  const handleRunAnalysis = async () => {
    if (!customText.trim()) {
      setError('Please enter a message to analyze');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/scam-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: customText,
          sourceType: activeChannel,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the message');
    } finally {
      setIsScanning(false);
    }
  };

  // Remove local heuristic analysis - all results come from backend API


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <MailWarning className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Suspicious Email &amp; Message Scam Analysis
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Detect social engineering manipulation, coercive urgency triggers, spoofed email headers (SPF/DKIM/DMARC), and deceptive phishing links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Target Vector:</span>
            <div className="flex items-center gap-1 p-1 bg-[#050811] rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveChannel('email')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChannel === 'email' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveChannel('sms')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChannel === 'sms' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                SMS
              </button>
              <button
                onClick={() => setActiveChannel('chat')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeChannel === 'chat' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Chat
              </button>
            </div>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Load Sample Threat:
          </span>
          {SAMPLE_SCAM_MESSAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSample(s)}
              className={`px-3 py-1 rounded-lg border font-mono text-[11px] transition-colors ${
                selectedSampleId === s.id
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-[#060a14] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Interface: Input Pane & Analysis Results Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Text Area */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Message Payload &amp; Header Input
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {customText.length} characters
            </span>
          </div>

          <textarea
            rows={14}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste suspicious raw email headers, body text, SMS smishing string, or chat logs here..."
            className="w-full p-4 rounded-lg bg-[#050811] border border-slate-800 focus:border-cyan-400 focus:outline-none font-mono text-xs text-slate-200 placeholder-slate-600 leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCustomText('')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear input
            </button>

            <button
              onClick={handleRunAnalysis}
              disabled={!customText.trim() || isScanning}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs md:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isScanning ? 'Parsing Indicators...' : 'Evaluate Scam Signatures'}</span>
            </button>
          </div>
        </div>

        {/* Right: Heuristic & Social Engineering Analysis */}
        <div className="space-y-6">
          {/* Scam Verdict Card */}
          <div className="p-6 rounded-xl bg-[#150a10] border border-rose-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-rose-300 uppercase font-bold tracking-wider">
                    Threat Classification
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                    Backend API Analysis
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mt-0.5">
                  High-Confidence Social Engineering Scam
                </h4>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Scam Confidence</span>
                <div className="text-2xl font-bold text-rose-400">{analysisResult && analysisResult.confidenceScore !== undefined ? `${analysisResult.confidenceScore}%` : 'N/A'}</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This message exhibits hallmark hallmarks of weaponized urgency and impersonation designed to compel rash user action before rational verification.
            </p>
          </div>

          {/* Social Engineering Triggers Checklist */}
          <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Behavioral &amp; Psychological Triggers
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="font-bold text-white">Manufactured Time Pressure &amp; Urgency</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {analysisResult && analysisResult.urgencyLevel === "high"
                      ? 'Detected artificial deadline ("2 hours", "immediate action") designed to induce panic.'
                      : 'No explicit artificial deadline detected.'}
                  </p>
                </div>
                {analysisResult && analysisResult.urgencyLevel === "high" ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="font-bold text-white">Coercive Financial / Credential Demand</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {analysisResult && analysisResult.manipulationTactics.some(t => t.includes("financial"))
                      ? 'Demands Social Security Number, gift cards, or external wire payments.'
                      : 'No overt financial coercion token matched.'}
                  </p>
                </div>
                {analysisResult && analysisResult.manipulationTactics.some(t => t.includes("financial")) ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Email Authentication Headers (SPF/DKIM/DMARC) */}
              <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="font-bold text-white">SPF / DKIM / DMARC Authentication</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {analysisResult && analysisResult.headerAuthStatus === "fail"
                      ? 'SPF=FAIL · Sender IP unaligned with authorized domain SPF record.'
                      : 'Authentic headers or non-email message vector.'}
                  </p>
                </div>
                {analysisResult && analysisResult.headerAuthStatus === "fail" ? (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">N/A</span>
                )}
              </div>
            </div>

            {/* Extracted Links */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-300">Extracted URLs & Status:</span>
              {analysisResult && analysisResult.extractedLinks.length > 0 ? (
                <div className="mt-2 space-y-1 p-2.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs font-mono">
                  {analysisResult.extractedLinks.map((link, index) => (
                    <div key={index} className="flex flex-col gap-1 pb-1 border-b border-slate-700/50 last:border-0">
                      <span className="truncate text-rose-300">{link.url}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        link.status === 'flagged' || link.status === 'deceptive' 
                          ? 'bg-rose-950/60 text-rose-400 font-bold border border-rose-500/30' 
                          : 'bg-emerald-950/30 text-emerald-400 font-medium border border-emerald-500/20'
                      }`}>
                        {link.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 p-2.5 rounded-lg bg-[#060a14] border border-slate-800 text-xs font-mono text-slate-500">
                  No link found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
