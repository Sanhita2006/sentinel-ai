import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, CheckCircle } from 'lucide-react';
import { ThreatLevel } from '../../types';

interface StatusBadgeProps {
  verdict: 'Malicious' | 'Suspicious' | 'Clean' | 'Inconclusive' | 'Valid' | 'Expired' | 'Untrusted' | 'Self-Signed';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ verdict, size = 'md' }) => {
  const getStyle = () => {
    switch (verdict) {
      case 'Malicious':
      case 'Untrusted':
      case 'Expired':
        return {
          bg: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
        };
      case 'Suspicious':
      case 'Self-Signed':
        return {
          bg: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
        };
      case 'Clean':
      case 'Valid':
        return {
          bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
        };
      case 'Inconclusive':
      default:
        return {
          bg: 'bg-slate-800/60 text-slate-300 border-slate-700',
          icon: <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
        };
    }
  };

  const { bg, icon } = getStyle();
  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${bg} ${paddingClass} tabular-nums`}
    >
      {icon}
      <span>{verdict}</span>
    </span>
  );
};

export const SeverityBadge: React.FC<{ level: ThreatLevel }> = ({ level }) => {
  const config: Record<ThreatLevel, { label: string; style: string }> = {
    critical: { label: 'CRITICAL', style: 'text-rose-400 bg-rose-950/50 border-rose-500/40' },
    high: { label: 'HIGH RISK', style: 'text-orange-400 bg-orange-950/50 border-orange-500/40' },
    medium: { label: 'MEDIUM', style: 'text-amber-400 bg-amber-950/50 border-amber-500/40' },
    low: { label: 'LOW RISK', style: 'text-blue-400 bg-blue-950/50 border-blue-500/40' },
    clean: { label: 'VERIFIED SAFE', style: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/40' },
  };

  const item = config[level] || config.clean;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold font-mono tracking-wider rounded border ${item.style}`}>
      {item.label}
    </span>
  );
};
