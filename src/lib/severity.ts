/**
 * Case-insensitive normalisation for severity, verdict and urgency values.
 * Backend / model output may arrive as "CRITICAL", "Critical", "critical", "crit", etc.
 * Unknown values never silently fall through to a "safe" classification.
 */
import { ThreatLevel } from '../types';

export type SeverityKey = ThreatLevel | 'unknown';
export type VerdictKey = 'Malicious' | 'Suspicious' | 'Clean' | 'Inconclusive';
export type UrgencyKey = 'critical' | 'high' | 'moderate' | 'low' | 'unknown';

const clean = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().toLowerCase().replace(/[\s_-]+/g, ' ')
    : '';

export function normalizeSeverity(value: unknown): SeverityKey {
  const v = clean(value);
  if (!v) return 'unknown';
  if (['critical', 'crit', 'severe', 'p1', 'sev1', 'sev 1'].includes(v)) return 'critical';
  if (['high', 'high risk', 'major', 'p2', 'sev2', 'sev 2'].includes(v)) return 'high';
  if (['medium', 'med', 'moderate', 'suspicious', 'warning', 'warn', 'p3', 'sev3', 'sev 3'].includes(v)) return 'medium';
  if (['low', 'low risk', 'minor', 'info', 'informational', 'p4', 'sev4', 'sev 4'].includes(v)) return 'low';
  if (['clean', 'safe', 'none', 'benign', 'verified safe', 'ok', 'pass'].includes(v)) return 'clean';
  return 'unknown';
}

export function normalizeVerdict(value: unknown): VerdictKey {
  const v = clean(value);
  if (['malicious', 'malware', 'phishing', 'flagged', 'blocked', 'dangerous'].includes(v)) return 'Malicious';
  if (['suspicious', 'warning', 'risky', 'questionable'].includes(v)) return 'Suspicious';
  if (['clean', 'safe', 'benign', 'legitimate'].includes(v)) return 'Clean';
  return 'Inconclusive';
}

export function normalizeUrgency(value: unknown): UrgencyKey {
  const v = clean(value);
  if (['critical', 'crit', 'severe'].includes(v)) return 'critical';
  if (['high'].includes(v)) return 'high';
  if (['moderate', 'medium', 'med'].includes(v)) return 'moderate';
  if (['low', 'none', 'minimal'].includes(v)) return 'low';
  return 'unknown';
}

/** Numeric rank, higher = more severe. Useful for sorting. */
export const SEVERITY_RANK: Record<SeverityKey, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  clean: 1,
  unknown: 0,
};

export interface SeverityStyle {
  label: string;
  short: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  bar: string;
}

export const SEVERITY_STYLES: Record<SeverityKey, SeverityStyle> = {
  critical: {
    label: 'Critical',
    short: 'CRIT',
    text: 'text-sev-critical',
    bg: 'bg-sev-critical/10',
    border: 'border-sev-critical/35',
    dot: 'bg-sev-critical',
    bar: 'bg-sev-critical',
  },
  high: {
    label: 'High',
    short: 'HIGH',
    text: 'text-sev-high',
    bg: 'bg-sev-high/10',
    border: 'border-sev-high/35',
    dot: 'bg-sev-high',
    bar: 'bg-sev-high',
  },
  medium: {
    label: 'Medium',
    short: 'MED',
    text: 'text-sev-medium',
    bg: 'bg-sev-medium/10',
    border: 'border-sev-medium/35',
    dot: 'bg-sev-medium',
    bar: 'bg-sev-medium',
  },
  low: {
    label: 'Low',
    short: 'LOW',
    text: 'text-sev-low',
    bg: 'bg-sev-low/10',
    border: 'border-sev-low/35',
    dot: 'bg-sev-low',
    bar: 'bg-sev-low',
  },
  clean: {
    label: 'Clean',
    short: 'CLEAN',
    text: 'text-sev-clean',
    bg: 'bg-sev-clean/10',
    border: 'border-sev-clean/35',
    dot: 'bg-sev-clean',
    bar: 'bg-sev-clean',
  },
  unknown: {
    label: 'Unknown',
    short: 'N/A',
    text: 'text-sev-info',
    bg: 'bg-sev-info/10',
    border: 'border-sev-info/30',
    dot: 'bg-sev-info',
    bar: 'bg-sev-info',
  },
};

export const severityStyle = (value: unknown): SeverityStyle =>
  SEVERITY_STYLES[normalizeSeverity(value)];

/** Map a verdict to the severity palette used for colouring. */
export const verdictSeverity = (value: unknown): SeverityKey => {
  switch (normalizeVerdict(value)) {
    case 'Malicious':
      return 'critical';
    case 'Suspicious':
      return 'medium';
    case 'Clean':
      return 'clean';
    default:
      return 'unknown';
  }
};

export const urgencySeverity = (value: unknown): SeverityKey => {
  switch (normalizeUrgency(value)) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'moderate':
      return 'medium';
    case 'low':
      return 'low';
    default:
      return 'unknown';
  }
};

/** Trust score (0-100, 100 = safest) to severity band. */
export const trustScoreSeverity = (score: number): SeverityKey => {
  if (!Number.isFinite(score)) return 'unknown';
  if (score >= 80) return 'clean';
  if (score >= 60) return 'low';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'high';
  return 'critical';
};

/** Current UTC timestamp in "YYYY-MM-DD HH:MM:SS UTC" form. */
export const utcStamp = (d: Date = new Date()): string =>
  d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

export const utcTime = (d: Date = new Date()): string =>
  d.toISOString().substring(11, 16) + ' UTC';
