/**
 * SENTINEL AI - Transparent Risk Scoring Engine
 * Computes Digital Trust Score (0-100) with mathematical attribution
 * showing exactly which findings caused deductions.
 */

import { ThreatFinding } from './heuristics';

export interface ScoreDeductionItem {
  id: string;
  source: string;
  title: string;
  pointsDeducted: number;
  reason: string;
}

export interface ScoreAssessment {
  trustScore: number; // 0 - 100 (100 = completely secure)
  verdict: 'Malicious' | 'Suspicious' | 'Clean';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'clean';
  totalDeductions: number;
  deductionBreakdown: ScoreDeductionItem[];
  scoringSummary: string;
}

/**
 * Calculates a transparent trust score based on aggregated findings.
 */
export function calculateTrustScore(findings: ThreatFinding[]): ScoreAssessment {
  let score = 100;
  const deductionBreakdown: ScoreDeductionItem[] = [];

  for (const finding of findings) {
    if (finding.deductionPoints > 0) {
      score -= finding.deductionPoints;
      deductionBreakdown.push({
        id: finding.id,
        source: finding.source,
        title: finding.title,
        pointsDeducted: finding.deductionPoints,
        reason: finding.description,
      });
    }
  }

  // Clamp score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine overall verdict
  let verdict: 'Malicious' | 'Suspicious' | 'Clean' = 'Clean';
  let severity: 'critical' | 'high' | 'medium' | 'low' | 'clean' = 'clean';

  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasHigh = findings.some((f) => f.severity === 'high');

  if (hasCritical || score < 35) {
    verdict = 'Malicious';
    severity = 'critical';
  } else if (hasHigh || score < 70) {
    verdict = 'Suspicious';
    severity = hasHigh ? 'high' : 'medium';
  } else {
    verdict = 'Clean';
    severity = score === 100 ? 'clean' : 'low';
  }

  const scoringSummary =
    deductionBreakdown.length === 0
      ? 'No risk vectors detected. Target maintains maximum baseline trust (100/100).'
      : `Trust score evaluated at ${score}/100 with ${deductionBreakdown.length} negative indicators totaling -${100 - score} deduction points.`;

  return {
    trustScore: score,
    verdict,
    severity,
    totalDeductions: 100 - score,
    deductionBreakdown,
    scoringSummary,
  };
}
