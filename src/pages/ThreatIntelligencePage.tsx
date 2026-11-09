import React, { useState } from 'react';
import {
  Globe2,
  Filter,
  Search,
  Download,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Database,
  Radio,
} from 'lucide-react';
import { SAMPLE_THREAT_FEED } from '../data/mockData';
import { ThreatIntelligenceFeedItem } from '../types';

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
    const content = JSON.stringify(filteredFeed, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel-threat-intel-export.${format === 'csv' ? 'csv' : 'json'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Globe2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Global Threat Intelligence &amp; IOC Feed
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Real-time indicators of compromise (IOCs), emerging phishing campaigns, and MITRE ATT&amp;CK mapping aggregated across collaborative SOC nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              DEMO IOC FEED
            </span>
            <button
              onClick={() => handleExportFeed('stix')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>STIX 2.1 Export</span>
            </button>
            <button
              onClick={() => handleExportFeed('json')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IOC by indicator IP, domain, hash, actor or campaign..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#050811] border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#050811] rounded-lg border border-slate-800 text-xs font-mono self-stretch sm:self-auto overflow-x-auto">
            {['all', 'domain', 'ip', 'campaign', 'hash'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded uppercase font-semibold transition-colors ${
                  filterType === type
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MITRE ATT&CK Matrix Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">MITRE TACTIC</span>
            <span className="text-cyan-400">T1566.002</span>
          </div>
          <h4 className="text-sm font-bold text-white">Spearphishing Link Distribution</h4>
          <p className="text-xs text-slate-400">
            Adversaries sending targeted links leading to credential harvesting clones and MFA proxy servers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">MITRE TACTIC</span>
            <span className="text-cyan-400">T1584.001</span>
          </div>
          <h4 className="text-sm font-bold text-white">Domains &amp; DNS Compromise</h4>
          <p className="text-xs text-slate-400">
            High turnover of freshly minted top-level domains (.top, .xyz, .info) under privacy proxy shields.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">MITRE TACTIC</span>
            <span className="text-cyan-400">T1090.003</span>
          </div>
          <h4 className="text-sm font-bold text-white">Multi-hop Bulletproof Proxies</h4>
          <p className="text-xs text-slate-400">
            C2 networks utilizing autonomous systems with non-responsive abuse enforcement.
          </p>
        </div>
      </div>

      {/* IOC Feed Table */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Live Indicators of Compromise (IOCs)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredFeed.length} records (Demo Data)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Indicator / Target</th>
                <th className="py-3 px-3">Attributed Threat Group</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">MITRE Tactics</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredFeed.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold">
                      {ioc.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-white max-w-[240px] truncate">
                    {ioc.indicator}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {ioc.threatActor || 'Unclassified'}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-400 whitespace-nowrap">
                    {ioc.confidence}%
                  </td>
                  <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate">
                    {ioc.mitreTactics.join(' · ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {ioc.lastActive}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/40 text-rose-300 border border-rose-500/30">
                      {ioc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
