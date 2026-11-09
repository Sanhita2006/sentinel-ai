import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { ThreatLevel } from '../../types';
import { SEVERITY_STYLES, SeverityKey, normalizeSeverity } from '../../lib/severity';

type KnownVerdict =
  | 'Malicious'
  | 'Suspicious'
  | 'Clean'
  | 'Inconclusive'
  | 'Valid'
  | 'Expired'
  | 'Untrusted'
  | 'Self-Signed';

interface StatusBadgeProps {
  /** Accepts the known verdict / TLS values in any letter case. */
  verdict: KnownVerdict | (string & {});
  size?: 'sm' | 'md';
}

const VERDICT_MAP: Record<string, { label: string; sev: SeverityKey }> = {
  malicious: { label: 'Malicious', sev: 'critical' },
  untrusted: { label: 'Untrusted', sev: 'critical' },
  expired: { label: 'Expired', sev: 'critical' },
  suspicious: { label: 'Suspicious', sev: 'medium' },
  'self-signed': { label: 'Self-Signed', sev: 'medium' },
  'self signed': { label: 'Self-Signed', sev: 'medium' },
  clean: { label: 'Clean', sev: 'clean' },
  valid: { label: 'Valid', sev: 'clean' },
  inconclusive: { label: 'Inconclusive', sev: 'unknown' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ verdict, size = 'md' }) => {
  const key = String(verdict ?? '').trim().toLowerCase();
  const entry = VERDICT_MAP[key] || { label: String(verdict || 'Unknown'), sev: 'unknown' as SeverityKey };
  const s = SEVERITY_STYLES[entry.sev];
  const Icon =
    entry.sev === 'critical' ? XCircle : entry.sev === 'medium' ? AlertTriangle : entry.sev === 'clean' ? ShieldCheck : HelpCircle;
  const pad = size === 'sm' ? 'px-1.5 py-[1px] text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[3px] border font-medium ${s.bg} ${s.border} ${s.text} ${pad}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span>{entry.label}</span>
    </span>
  );
};

const SEVERITY_LABELS: Record<SeverityKey, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  clean: 'CLEAN',
  unknown: 'UNKNOWN',
};

/** Severity pill. Case-insensitive; unrecognised values render as UNKNOWN, never as safe. */
export const SeverityBadge: React.FC<{ level: ThreatLevel | (string & {}) }> = ({ level }) => {
  const key = normalizeSeverity(level);
  const s = SEVERITY_STYLES[key];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold tracking-wider ${s.bg} ${s.border} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {SEVERITY_LABELS[key]}
    </span>
  );
};
