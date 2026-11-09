import React, { useMemo, useState } from 'react';
import { Globe2, Search, Download, Crosshair, Radar, Users, Gauge } from 'lucide-react';
import { SAMPLE_THREAT_FEED } from '../data/mockData';
import { ThreatIntelligenceFeedItem } from '../types';
import { PageHeader, Panel, DataTag, KpiTile, EmptyState, Segmented } from '../components/ui/Soc';

/* ---------- Export helpers (client-side, operate on the filtered sample feed) ---------- */

const uuid = (): string => {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

/** "2026-11-07 14:02 UTC" -> "2026-11-07T14:02:00.000Z" (falls back to now). */
const toIso = (stamp: string): string => {
  const m = stamp.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::(\d{2}))?/);
  if (!m) return new Date().toISOString();
  const d = new Date(`${m[1]}T${m[2]}:${m[3] || '00'}Z`);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

const stixPattern = (item: ThreatIntelligenceFeedItem): string | null => {
  const v = item.indicator.replace(/'/g, "\\'");
  const t = item.type.toLowerCase();
  if (t === 'hash') return `[file:hashes.'SHA-256' = '${v}']`;
  if (t === 'ip' || /^\d{1,3}(\.\d{1,3}){3}$/.test(item.indicator)) return `[ipv4-addr:value = '${v}']`;
  if (t === 'domain' || t === 'c2') return `[domain-name:value = '${v}']`;
  return null;
};

const buildStixBundle = (items: ThreatIntelligenceFeedItem[]) => {
  const now = new Date().toISOString();
  const objects = items.map((item) => {
    const pattern = stixPattern(item);
    const common = {
      spec_version: '2.1',
      id: '',
      created: now,
      modified: now,
      labels: item.tags,
      confidence: item.confidence,
      external_references: item.mitreTactics.map((t) => ({ source_name: 'mitre-attack', external_id: t.split(' ')[0], description: t })),
      x_sentinel_id: item.id,
      x_sentinel_status: item.status,
      x_sentinel_threat_actor: item.threatActor || null,
    };
    if (pattern) {
      return {
        ...common,
        type: 'indicator',
        id: `indicator--${uuid()}`,
        name: item.indicator,
        pattern,
        pattern_type: 'stix',
        valid_from: toIso(item.firstSeen),
      };
    }
    return { ...common, type: 'campaign', id: `campaign--${uuid()}`, name: item.indicator, first_seen: toIso(item.firstSeen) };
  });
  return { type: 'bundle', id: `bundle--${uuid()}`, objects };
};

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const buildCsv = (items: ThreatIntelligenceFeedItem[]) => {
  const header = ['id', 'type', 'indicator', 'threatActor', 'confidence', 'firstSeen', 'lastActive', 'mitreTactics', 'tags', 'status'];
  const rows = items.map((i) =>
    [i.id, i.type, i.indicator, i.threatActor || '', i.confidence, i.firstSeen, i.lastActive, i.mitreTactics.join('; '), i.tags.join('; '), i.status]
      .map(csvCell)
      .join(',')
  );
  return [header.join(','), ...rows].join('\n');
};

const STATUS_STYLE: Record<string, string> = {
  active: 'border-sev-critical/35 bg-sev-critical/10 text-sev-critical',
  dormant: 'border-sev-medium/35 bg-sev-medium/10 text-sev-medium',
  sinkholed: 'border-soc-line-strong bg-soc-raised text-soc-text-2',
};

export const ThreatIntelligencePage: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFeed = SAMPLE_THREAT_FEED.filter((item) => {
    const matchesFilter = filterType === 'all' || item.type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSearch =
      item.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.threatActor && item.threatActor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleExportFeed = (format: 'stix' | 'json' | 'csv') => {
    const content =
      format === 'csv'
        ? buildCsv(filteredFeed)
        : JSON.stringify(format === 'stix' ? buildStixBundle(filteredFeed) : filteredFeed, null, 2);
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      format === 'csv'
        ? 'sentinel-threat-intel-export.csv'
        : format === 'stix'
        ? 'sentinel-threat-intel-export.stix.json'
        : 'sentinel-threat-intel-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const active = SAMPLE_THREAT_FEED.filter((i) => i.status.toLowerCase() === 'active').length;
    const avg = Math.round(SAMPLE_THREAT_FEED.reduce((s, i) => s + i.confidence, 0) / Math.max(1, SAMPLE_THREAT_FEED.length));
    const actors = new Set(SAMPLE_THREAT_FEED.map((i) => i.threatActor).filter(Boolean)).size;
    return { total: SAMPLE_THREAT_FEED.length, active, avg, actors };
  }, []);

  const mitre = [
    { id: 'T1566.002', title: 'Spearphishing link distribution', desc: 'Targeted links leading to credential-harvesting clones and MFA proxy servers.' },
    { id: 'T1584.001', title: 'Domains & DNS compromise', desc: 'High turnover of freshly minted TLDs (.top, .xyz, .info) under privacy proxy shields.' },
    { id: 'T1090.003', title: 'Multi-hop bulletproof proxies', desc: 'C2 networks using autonomous systems with non-responsive abuse enforcement.' },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={Globe2}
        title="Global threat intelligence & IOC feed"
        description="Indicators of compromise, emerging phishing campaigns and MITRE ATT&CK mapping aggregated across collaborative SOC nodes."
        actions={
          <>
            <DataTag kind="demo" label="Demo IOC feed" />
            <button onClick={() => handleExportFeed('stix')} className="soc-btn h-7 text-[11px]">
              <Download className="h-3.5 w-3.5" />
              STIX 2.1
            </button>
            <button onClick={() => handleExportFeed('json')} className="soc-btn h-7 text-[11px]">
              JSON
            </button>
            <button onClick={() => handleExportFeed('csv')} className="soc-btn h-7 text-[11px]">
              CSV
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soc-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search indicators"
              placeholder="Search IOC by indicator IP, domain, hash, actor or campaign..."
              className="soc-input h-9 pl-8"
            />
          </div>
          <Segmented
            ariaLabel="Indicator type"
            value={filterType}
            onChange={setFilterType}
            options={['all', 'domain', 'ip', 'c2', 'campaign', 'hash'].map((t) => ({ value: t, label: t.toUpperCase() }))}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Indicators" value={stats.total} hint="In sample feed" icon={Radar} />
        <KpiTile label="Active" value={stats.active} hint="Status = Active" icon={Crosshair} tone="critical" />
        <KpiTile label="Avg confidence" value={`${stats.avg}%`} hint="Across all indicators" icon={Gauge} tone="medium" />
        <KpiTile label="Attributed actors" value={stats.actors} hint="Distinct threat groups" icon={Users} tone="low" />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {mitre.map((m) => (
          <div key={m.id} className="soc-panel px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="soc-label">MITRE ATT&amp;CK tactic</span>
              <span className="soc-chip text-soc-accent-hi">{m.id}</span>
            </div>
            <h4 className="mt-1.5 text-[13px] font-semibold text-soc-text">{m.title}</h4>
            <p className="mt-0.5 text-[11px] leading-relaxed text-soc-text-2">{m.desc}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Indicators of compromise"
        subtitle={`Showing ${filteredFeed.length} of ${SAMPLE_THREAT_FEED.length} records (demo data)`}
        flush
        actions={<DataTag kind="demo" />}
      >
        {filteredFeed.length === 0 ? (
          <EmptyState icon={Search} title="No indicators match">
            Adjust the search term or type filter.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Indicator / target</th>
                  <th>Attributed threat group</th>
                  <th>Confidence</th>
                  <th>MITRE tactics</th>
                  <th>Tags</th>
                  <th>Last active</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeed.map((ioc) => (
                  <tr key={ioc.id}>
                    <td className="whitespace-nowrap">
                      <span className="soc-chip font-semibold text-soc-text">{ioc.type}</span>
                    </td>
                    <td className="max-w-[260px]">
                      <div className="truncate font-mono font-medium text-soc-text" title={ioc.indicator}>
                        {ioc.indicator}
                      </div>
                      <div className="font-mono text-[10px] text-soc-muted">{ioc.id}</div>
                    </td>
                    <td className="whitespace-nowrap">{ioc.threatActor || 'Unclassified'}</td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-14 overflow-hidden rounded-sm bg-soc-line">
                          <div
                            className={`h-full ${ioc.confidence >= 90 ? 'bg-sev-critical' : ioc.confidence >= 75 ? 'bg-sev-high' : 'bg-sev-medium'}`}
                            style={{ width: `${ioc.confidence}%` }}
                          />
                        </div>
                        <span className="font-mono tabular-nums text-soc-text">{ioc.confidence}%</span>
                      </div>
                    </td>
                    <td className="max-w-[220px]">
                      <div className="truncate text-[11px]" title={ioc.mitreTactics.join(' · ')}>
                        {ioc.mitreTactics.join(' · ')}
                      </div>
                    </td>
                    <td className="max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {ioc.tags.slice(0, 2).map((t) => (
                          <span key={t} className="soc-chip">
                            {t}
                          </span>
                        ))}
                        {ioc.tags.length > 2 && <span className="soc-chip">+{ioc.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-mono text-[11px] text-soc-muted">{ioc.lastActive}</td>
                    <td className="whitespace-nowrap text-right">
                      <span
                        className={`rounded-[3px] border px-1.5 py-[1px] font-mono text-[10px] font-semibold uppercase ${
                          STATUS_STYLE[ioc.status.toLowerCase()] || STATUS_STYLE.sinkholed
                        }`}
                      >
                        {ioc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
