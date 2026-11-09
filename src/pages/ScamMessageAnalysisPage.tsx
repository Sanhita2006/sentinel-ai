import React, { useState } from 'react';
import {
  MailWarning,
  Send,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  Brain,
  UserX,
  AlertTriangle,
  MinusCircle,
  Loader2,
} from 'lucide-react';
import { SAMPLE_SCAM_MESSAGES } from '../data/mockData';
import { PageHeader, Panel, DataTag, Notice, EmptyState, Segmented } from '../components/ui/Soc';
import { SEVERITY_STYLES, normalizeUrgency, urgencySeverity } from '../lib/severity';

const FINANCIAL_PATTERN = /financ|payment|gift ?card|wire|bank|credential|password|ssn|social security|fee|crypto/i;

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
  const [modelUsed, setModelUsed] = useState<string | null>(null);
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
        // Surface the backend's own error message when it provides one.
        const body = await response.json().catch(() => null);
        throw new Error(
          body && typeof body.error === 'string' && body.error
            ? `Analysis failed (HTTP ${response.status}): ${body.error}`
            : `Analysis failed (HTTP ${response.status})`
        );
      }

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        setModelUsed(typeof data.modelUsed === 'string' ? data.modelUsed : null);
      } else {
        throw new Error(
          typeof data?.error === 'string' && data.error ? data.error : 'The backend returned an unexpected response.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the message');
    } finally {
      setIsScanning(false);
    }
  };

  // Derived, case-insensitive interpretation of the backend result.
  const urgency = analysisResult ? normalizeUrgency(analysisResult.urgencyLevel) : 'unknown';
  const urgencySev = urgencySeverity(analysisResult?.urgencyLevel);
  const urgencyStyle = SEVERITY_STYLES[urgencySev];
  const isUrgent = urgency === 'high' || urgency === 'critical';
  const tactics = analysisResult?.manipulationTactics ?? [];
  const hasFinancial = tactics.some((t) => FINANCIAL_PATTERN.test(t));
  const headerAuth = String(analysisResult?.headerAuthStatus ?? '').trim();
  const headerAuthFailed = headerAuth.toLowerCase() === 'fail' || headerAuth.toLowerCase() === 'failed';
  const headerAuthEvaluated = headerAuth !== '' && !/not provided|n\/a|none|unknown/i.test(headerAuth);

  const classificationTitle = !analysisResult
    ? ''
    : urgency === 'critical'
    ? 'Critical-urgency social engineering indicators'
    : urgency === 'high'
    ? 'High-urgency social engineering indicators'
    : urgency === 'moderate'
    ? 'Moderate manipulation indicators'
    : urgency === 'low'
    ? 'Low-urgency message'
    : 'Urgency not classified';

  const linkTone = (status: string) => {
    const s = status.toLowerCase();
    if (/flagged|deceptive|malicious|phish/.test(s)) return 'border-sev-critical/35 bg-sev-critical/10 text-sev-critical';
    if (/suspicious/.test(s)) return 'border-sev-medium/35 bg-sev-medium/10 text-sev-medium';
    if (/^clean|^safe|benign/.test(s)) return 'border-sev-clean/35 bg-sev-clean/10 text-sev-clean';
    return 'border-soc-line-strong bg-soc-raised text-soc-text-2';
  };

  const triggerRows: Array<{ title: string; detail: string; state: 'bad' | 'ok' | 'na' }> = [
    {
      title: 'Manufactured time pressure & urgency',
      detail: !analysisResult
        ? 'Awaiting analysis.'
        : isUrgent
        ? `Model classified urgency as ${analysisResult.urgencyLevel}. Artificial deadlines are designed to induce panic.`
        : `Model classified urgency as ${analysisResult.urgencyLevel || 'unclassified'}.`,
      state: !analysisResult ? 'na' : isUrgent ? 'bad' : 'ok',
    },
    {
      title: 'Coercive financial / credential demand',
      detail: !analysisResult
        ? 'Awaiting analysis.'
        : hasFinancial
        ? 'At least one identified tactic references payment, credentials or financial transfer.'
        : 'No financial or credential tactic was identified.',
      state: !analysisResult ? 'na' : hasFinancial ? 'bad' : 'ok',
    },
    {
      title: 'SPF / DKIM / DMARC authentication',
      detail: !analysisResult
        ? 'Awaiting analysis.'
        : headerAuthFailed
        ? 'Header authentication reported as failed.'
        : headerAuthEvaluated
        ? `Header authentication: ${headerAuth}.`
        : `Not evaluated by the backend (${headerAuth || 'no value'}).`,
      state: !analysisResult ? 'na' : headerAuthFailed ? 'bad' : headerAuthEvaluated ? 'ok' : 'na',
    },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={MailWarning}
        title="Suspicious email & message scam analysis"
        description="Detect social-engineering manipulation, coercive urgency triggers, spoofed email headers and deceptive links."
        actions={
          <>
            <span className="soc-label">Target vector</span>
            <Segmented
              ariaLabel="Message channel"
              value={activeChannel}
              onChange={setActiveChannel}
              options={[
                { value: 'email', label: 'Email' },
                { value: 'sms', label: 'SMS' },
                { value: 'chat', label: 'Chat' },
              ]}
            />
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="soc-label mr-1">Load sample threat</span>
          {SAMPLE_SCAM_MESSAGES.map((s) => (
            <button
              key={s.id}
              title={s.snippet}
              onClick={() => handleSelectSample(s)}
              data-active={selectedSampleId === s.id}
              className="soc-chip hover:border-soc-forest-2 hover:text-soc-text data-[active=true]:border-soc-forest-2 data-[active=true]:bg-soc-forest/60 data-[active=true]:text-soc-text"
            >
              {s.title}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Input */}
        <Panel
          title="Message payload & header input"
          actions={<span className="font-mono text-[11px] tabular-nums text-soc-muted">{customText.length} chars</span>}
        >
          <textarea
            rows={16}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            aria-label="Message to analyze"
            placeholder="Paste suspicious raw email headers, body text, SMS smishing string, or chat logs here..."
            className="soc-input resize-y leading-relaxed"
          />
          <div className="mt-3 flex items-center justify-between gap-2">
            <button onClick={() => setCustomText('')} className="soc-btn soc-btn-ghost">
              Clear input
            </button>
            <div className="flex items-center gap-2">
              <DataTag kind="local" label="POST /api/scam-analysis" />
              <button onClick={handleRunAnalysis} disabled={!customText.trim() || isScanning} className="soc-btn soc-btn-primary">
                {isScanning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {isScanning ? 'Parsing indicators…' : 'Evaluate scam signatures'}
              </button>
            </div>
          </div>
          {isScanning && (
            <div className="mt-3">
              <div className="relative h-1 w-full overflow-hidden rounded-sm bg-soc-line">
                <div className="soc-indeterminate absolute inset-y-0 w-1/4 rounded-sm bg-soc-accent" />
              </div>
              <p className="mt-1.5 text-[11px] text-soc-muted">
                Waiting for the local model. Large models can take several minutes to respond.
              </p>
            </div>
          )}
          {error && (
            <Notice tone="danger" icon={XCircle} title="Analysis error" className="mt-3">
              {error}
            </Notice>
          )}
        </Panel>

        {/* Results */}
        <div className="space-y-4">
          <Panel
            title="Threat classification"
            accent={analysisResult ? urgencySev : undefined}
            actions={
              analysisResult ? (
                <DataTag kind="live" label={modelUsed ? `Backend · ${modelUsed}` : 'Backend analysis'} />
              ) : (
                <DataTag kind="local" label="Awaiting analysis" />
              )
            }
          >
            {!analysisResult ? (
              <EmptyState icon={Brain} title="No analysis yet">
                Select a sample or paste a message, then run “Evaluate scam signatures”. Results come only from the backend
                model; nothing is pre-filled.
              </EmptyState>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="soc-label">Urgency level</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[11px] font-semibold uppercase ${urgencyStyle.bg} ${urgencyStyle.border} ${urgencyStyle.text}`}>
                        {analysisResult.urgencyLevel || 'Unknown'}
                      </span>
                      <h4 className="text-sm font-semibold text-soc-text">{classificationTitle}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="soc-label">Model confidence</div>
                    <div className="font-mono text-2xl font-semibold tabular-nums text-soc-text">
                      {analysisResult.confidenceScore !== undefined ? `${analysisResult.confidenceScore}%` : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <UserX className="h-3.5 w-3.5 text-soc-muted" />
                  <span className="text-soc-muted">Impersonated entity</span>
                  <span className="font-medium text-soc-text">{analysisResult.impersonatedEntity || 'Unknown'}</span>
                </div>
                <div className="soc-well p-3 text-xs leading-relaxed text-soc-text-2">
                  <div className="soc-label mb-1">Analyst summary</div>
                  {analysisResult.analystSummary || 'No summary returned.'}
                </div>
              </div>
            )}
          </Panel>

          <Panel title="Behavioral & psychological triggers" flush>
            <ul className="divide-y divide-soc-line text-xs">
              {triggerRows.map((row) => (
                <li key={row.title} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div>
                    <div className="font-medium text-soc-text">{row.title}</div>
                    <p className="mt-0.5 text-[11px] text-soc-text-2">{row.detail}</p>
                  </div>
                  {row.state === 'bad' ? (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-sev-critical" />
                  ) : row.state === 'ok' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sev-clean" />
                  ) : (
                    <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-soc-muted" />
                  )}
                </li>
              ))}
            </ul>
            <div className="border-t border-soc-line px-4 py-3">
              <div className="soc-label mb-1.5">Identified manipulation tactics ({tactics.length})</div>
              {tactics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {tactics.map((t, i) => (
                    <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-[3px] border border-sev-high/30 bg-sev-high/[0.07] px-1.5 py-[1px] text-[11px] text-soc-text-2">
                      <AlertTriangle className="h-3 w-3 text-sev-high" />
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-soc-muted">{analysisResult ? 'None identified.' : 'Awaiting analysis.'}</p>
              )}
            </div>
          </Panel>

          <Panel title="Extracted URLs & status" icon={LinkIcon} flush>
            {analysisResult && analysisResult.extractedLinks.length > 0 ? (
              <table className="soc-table">
                <thead>
                  <tr>
                    <th>URL</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisResult.extractedLinks.map((link, index) => (
                    <tr key={index}>
                      <td className="max-w-[360px] truncate font-mono text-[11px] text-soc-text" title={link.url}>
                        {link.url}
                      </td>
                      <td className="text-right">
                        <span className={`whitespace-nowrap rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase ${linkTone(link.status)}`}>
                          {link.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-4 py-3 font-mono text-[11px] text-soc-muted">No link found</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};
