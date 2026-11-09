import React from 'react';
import { FlaskConical, Radio, Cpu, Info } from 'lucide-react';
import { SEVERITY_STYLES, SeverityKey, normalizeSeverity } from '../../lib/severity';

type IconType = React.ComponentType<{ className?: string }>;

/* ------------------------------------------------------------------ */
/* Page header: compact title row with optional actions and meta row   */
/* ------------------------------------------------------------------ */
export const PageHeader: React.FC<{
  icon?: IconType;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ icon: Icon, title, description, actions, children }) => (
  <section className="soc-panel">
    <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border border-soc-forest-2 bg-soc-forest/60 text-soc-accent-hi">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-5 tracking-tight text-soc-text">{title}</h2>
          {description && (
            <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-soc-text-2">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children && <div className="border-t border-soc-line px-4 py-3">{children}</div>}
  </section>
);

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */
export const Panel: React.FC<{
  title?: React.ReactNode;
  icon?: IconType;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
  accent?: SeverityKey;
}> = ({ title, icon: Icon, subtitle, actions, children, className = '', bodyClassName = '', flush = false, accent }) => {
  const accentBar = accent ? SEVERITY_STYLES[accent].bar : '';
  return (
    <section className={`soc-panel relative overflow-hidden ${className}`}>
      {accent && <span className={`absolute inset-y-0 left-0 w-[3px] ${accentBar}`} aria-hidden />}
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-line px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-soc-accent" />}
            <div className="min-w-0">
              {title && <h3 className="soc-title truncate">{title}</h3>}
              {subtitle && <p className="mt-0.5 truncate text-[11px] text-soc-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? bodyClassName : `p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* KPI tile                                                            */
/* ------------------------------------------------------------------ */
export const KpiTile: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: IconType;
  tone?: SeverityKey | 'accent';
}> = ({ label, value, hint, icon: Icon, tone = 'accent' }) => {
  const toneText = tone === 'accent' ? 'text-soc-accent' : SEVERITY_STYLES[tone].text;
  const toneBar = tone === 'accent' ? 'bg-soc-accent' : SEVERITY_STYLES[tone].bar;
  return (
    <div className="soc-panel relative overflow-hidden px-4 py-3">
      <span className={`absolute inset-x-0 top-0 h-[2px] opacity-70 ${toneBar}`} aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <span className="soc-label">{label}</span>
        {Icon && <Icon className={`h-3.5 w-3.5 ${toneText}`} />}
      </div>
      <div className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-soc-text">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-soc-muted">{hint}</div>}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Data provenance tag                                                 */
/* ------------------------------------------------------------------ */
export type ProvenanceKind = 'demo' | 'live' | 'simulated' | 'local' | 'sample';

const PROVENANCE: Record<ProvenanceKind, { label: string; cls: string; icon: IconType }> = {
  demo: { label: 'Demo data', cls: 'border-sev-medium/40 bg-sev-medium/10 text-sev-medium', icon: FlaskConical },
  sample: { label: 'Sample', cls: 'border-sev-medium/40 bg-sev-medium/10 text-sev-medium', icon: FlaskConical },
  simulated: { label: 'Simulated', cls: 'border-sev-medium/40 bg-sev-medium/10 text-sev-medium', icon: FlaskConical },
  live: { label: 'Live result', cls: 'border-soc-accent/45 bg-soc-accent/10 text-soc-accent-hi', icon: Radio },
  local: { label: 'Local engine', cls: 'border-soc-line-strong bg-soc-raised text-soc-text-2', icon: Cpu },
};

export const DataTag: React.FC<{ kind: ProvenanceKind; label?: string; title?: string }> = ({ kind, label, title }) => {
  const p = PROVENANCE[kind];
  const Icon = p.icon;
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[3px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${p.cls}`}
    >
      <Icon className="h-3 w-3" />
      {label || p.label}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Severity indicators                                                 */
/* ------------------------------------------------------------------ */
export const SeverityDot: React.FC<{ level: unknown; className?: string }> = ({ level, className = '' }) => (
  <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${SEVERITY_STYLES[normalizeSeverity(level)].dot} ${className}`} />
);

/** Compact five-segment severity meter used in table rows. */
export const SeverityMeter: React.FC<{ level: unknown }> = ({ level }) => {
  const key = normalizeSeverity(level);
  const filled = { critical: 5, high: 4, medium: 3, low: 2, clean: 1, unknown: 0 }[key];
  const s = SEVERITY_STYLES[key];
  return (
    <span className="inline-flex items-center gap-[2px]" title={s.label} aria-label={`Severity ${s.label}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-2.5 w-1 rounded-[1px] ${i <= filled ? s.bar : 'bg-soc-line-strong'}`} />
      ))}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */
export const KV: React.FC<{ k: React.ReactNode; v: React.ReactNode; vClassName?: string }> = ({ k, v, vClassName = '' }) => (
  <div className="soc-kv">
    <span className="shrink-0 text-soc-muted">{k}</span>
    <span className={`min-w-0 text-right font-mono text-soc-text ${vClassName}`}>{v}</span>
  </div>
);

export const Notice: React.FC<{
  tone?: 'info' | 'warn' | 'danger' | 'ok';
  icon?: IconType;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}> = ({ tone = 'info', icon, title, children, className = '' }) => {
  const toneCls = {
    info: 'border-soc-line-strong bg-soc-raised text-soc-text-2',
    warn: 'border-sev-medium/35 bg-sev-medium/[0.07] text-soc-text-2',
    danger: 'border-sev-critical/35 bg-sev-critical/[0.07] text-soc-text-2',
    ok: 'border-sev-clean/35 bg-sev-clean/[0.07] text-soc-text-2',
  }[tone];
  const iconCls = {
    info: 'text-soc-muted',
    warn: 'text-sev-medium',
    danger: 'text-sev-critical',
    ok: 'text-sev-clean',
  }[tone];
  const Icon = icon || Info;
  return (
    <div className={`flex items-start gap-2.5 rounded border px-3 py-2.5 text-xs leading-relaxed ${toneCls} ${className}`}>
      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconCls}`} />
      <div className="min-w-0 flex-1">
        {title && <div className="mb-0.5 font-semibold text-soc-text">{title}</div>}
        {children}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ icon?: IconType; title: string; children?: React.ReactNode }> = ({
  icon: Icon = Info,
  title,
  children,
}) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
    <Icon className="h-6 w-6 text-soc-muted" />
    <div className="text-sm font-medium text-soc-text">{title}</div>
    {children && <div className="max-w-sm text-xs text-soc-muted">{children}</div>}
  </div>
);

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: React.ReactNode }>;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) => (
  <div className="soc-seg overflow-x-auto" role="tablist" aria-label={ariaLabel}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        role="tab"
        aria-selected={value === o.value}
        data-active={value === o.value}
        onClick={() => onChange(o.value)}
        className="soc-seg-item"
      >
        {o.label}
      </button>
    ))}
  </div>
);

/** Trust score rendered as "NN / 100" coloured by band. */
export const TrustScore: React.FC<{ score: number; className?: string }> = ({ score, className = '' }) => {
  const color =
    score >= 80 ? 'text-sev-clean' : score >= 60 ? 'text-sev-low' : score >= 40 ? 'text-sev-medium' : score >= 20 ? 'text-sev-high' : 'text-sev-critical';
  return (
    <span className={`font-mono font-semibold tabular-nums ${color} ${className}`}>
      {score}
      <span className="text-soc-muted">/100</span>
    </span>
  );
};
