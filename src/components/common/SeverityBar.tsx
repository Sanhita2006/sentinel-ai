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
  // Normalized safety score: 0 = dangerous, 100 = safe
  const safetyScore = invertRisk ? 100 - score : score;

  const getColor = () => {
    if (safetyScore >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400', label: 'SECURE' };
    if (safetyScore >= 60) return { bar: 'bg-cyan-500', text: 'text-cyan-400', label: 'ADEQUATE' };
    if (safetyScore >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', label: 'SUSPICIOUS' };
    if (safetyScore >= 20) return { bar: 'bg-orange-500', text: 'text-orange-400', label: 'HIGH RISK' };
    return { bar: 'bg-rose-500', text: 'text-rose-400', label: 'CRITICAL THREAT' };
  };

  const { bar, text, label: scoreLabel } = getColor();

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${text}`}>{scoreLabel}</span>
          {showNumeric && (
            <span className="font-mono tabular-nums text-slate-300 font-semibold">
              {score}/100
            </span>
          )}
        </div>
      </div>
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${bar}`}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
};
