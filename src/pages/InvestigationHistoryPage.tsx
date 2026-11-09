import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  ChevronRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { SAMPLE_INVESTIGATIONS } from '../data/mockData';
import { PageId, InvestigationRecord } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';

interface InvestigationHistoryPageProps {
  onSelectTarget: (target: string) => void;
  onNavigate: (page: PageId) => void;
}

export const InvestigationHistoryPage: React.FC<InvestigationHistoryPageProps> = ({
  onSelectTarget,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [records, setRecords] = useState<InvestigationRecord[]>(SAMPLE_INVESTIGATIONS);

  const filteredRecords = records.filter((r) => {
    const matchesVerdict = verdictFilter === 'all' || r.verdict.toLowerCase() === verdictFilter.toLowerCase();
    const matchesSearch =
      r.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.asn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesVerdict && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Target,Verdict,Severity,TrustScore,IP,Country,Timestamp\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.id}","${r.target}","${r.verdict}","${r.severity}",${r.trustScore},"${r.ipAddress}","${r.country}","${r.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sentinel-investigation-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Investigation History &amp; Forensics Archive
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Complete audit trail of all automated and manual URL investigations, threat classifications, and digital trust scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              DEMO DATA ARCHIVE
            </span>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history by Case ID, domain name, or IP address..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[#050811] border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#050811] rounded-lg border border-slate-800 text-xs font-mono self-stretch sm:self-auto overflow-x-auto">
            {['all', 'malicious', 'suspicious', 'clean'].map((v) => (
              <button
                key={v}
                onClick={() => setVerdictFilter(v)}
                className={`px-3 py-1.5 rounded uppercase font-semibold transition-colors ${
                  verdictFilter === v
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table & Empty State */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Archived Audit Cases ({filteredRecords.length})
          </h3>
          <span className="text-xs font-mono text-slate-400">Click any row to re-open dossier</span>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Matching Investigations Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No cases matched the search term "{searchTerm}" with verdict filter "{verdictFilter}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setVerdictFilter('all');
              }}
              className="px-3 py-1.5 rounded bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-mono">
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-3">Target Domain</th>
                  <th className="py-3 px-3">Verdict</th>
                  <th className="py-3 px-3">Trust Score</th>
                  <th className="py-3 px-3">Resolved IP &amp; Geolocation</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelectTarget(r.target);
                      onNavigate('website-investigation');
                    }}
                  >
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {r.id}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-white max-w-[240px] truncate group-hover:text-cyan-300">
                      {r.target}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge verdict={r.verdict} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          r.trustScore < 30
                            ? 'text-rose-400'
                            : r.trustScore < 70
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {r.trustScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {r.ipAddress} · {r.countryCode}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {r.timestamp.split(' ')[0]}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="text-cyan-400 font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Open Dossier
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
