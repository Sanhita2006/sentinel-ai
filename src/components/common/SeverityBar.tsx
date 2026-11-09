import React from 'react';

interface SeverityBarProps {
  score: number; // 0 - 100 (where 100 is cleanest/safest, or vice-versa with invertRisk)
  invertRisk?: boolean; // If true, higher = higher danger
  label?: string;
  showNumeric?: boolean;
}

export const SeverityBar: React.FC<SeverityBarProps> = ({
  score,
  invertRisk = false,
  label = 'Digital Trust Score',
  showNumeric = true,
}) => {
  const safe = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;
  // Normalized safety score: 0 = dangerous, 100 = safe
  const safetyScore = invertRisk ? 100 - safe : safe;

  const band =
    safetyScore >= 80
      ? { bar: 'bg-sev-clean', text: 'text-sev-clean', label: 'SECURE' }
      : safetyScore >= 60
      ? { bar: 'bg-sev-low', text: 'text-sev-low', label: 'ADEQUATE' }
      : safetyScore >= 40
      ? { bar: 'bg-sev-medium', text: 'text-sev-medium', label: 'SUSPICIOUS' }
      : safetyScore >= 20
      ? { bar: 'bg-sev-high', text: 'text-sev-high', label: 'HIGH RISK' }
      : { bar: 'bg-sev-critical', text: 'text-sev-critical', label: 'CRITICAL THREAT' };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="soc-label truncate">{label}</span>
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap font-mono">
          <span className={`text-[10px] font-semibold tracking-wider ${band.text}`}>{band.label}</span>
          {showNumeric && (
            <span className="text-sm font-semibold tabular-nums text-soc-text">
              {safe}
              <span className="text-soc-muted">/100</span>
            </span>
          )}
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-sm bg-soc-line">
        <div
          className={`h-full rounded-sm transition-all duration-500 ease-out ${band.bar}`}
          style={{ width: `${Math.max(3, safe)}%` }}
        />
        {/* band ticks at 20 / 40 / 60 / 80 */}
        {[20, 40, 60, 80].map((t) => (
          <span key={t} className="absolute inset-y-0 w-px bg-soc-bg/70" style={{ left: `${t}%` }} />
        ))}
      </div>
    </div>
  );
};
