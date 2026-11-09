import React, { useState } from 'react';
import { History, Search, Download, ChevronRight } from 'lucide-react';
import { SAMPLE_INVESTIGATIONS } from '../data/mockData';
import { PageId, InvestigationRecord } from '../types';
import { StatusBadge, SeverityBadge } from '../components/common/StatusBadge';
import { PageHeader, Panel, DataTag, EmptyState, Segmented, SeverityMeter, TrustScore } from '../components/ui/Soc';

interface InvestigationHistoryPageProps {
  onSelectTarget: (target: string) => void;
  onNavigate: (page: PageId) => void;
}

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export const InvestigationHistoryPage: React.FC<InvestigationHistoryPageProps> = ({ onSelectTarget, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [verdictFilter, setVerdictFilter] = useState<string>('all');
  const [records] = useState<InvestigationRecord[]>(SAMPLE_INVESTIGATIONS);

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
      .map((r) =>
        [r.id, r.target, r.verdict, r.severity].map(csvCell).join(',') +
        `,${r.trustScore},` +
        [r.ipAddress, r.country, r.timestamp].map(csvCell).join(',')
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

  const countFor = (v: string) =>
    v === 'all' ? records.length : records.filter((r) => r.verdict.toLowerCase() === v).length;

  return (
    <div className="soc-page">
      <PageHeader
        icon={History}
        title="Investigation history & forensics archive"
        description="Audit trail of automated and manual URL investigations, threat classifications and digital trust scores."
        actions={
          <>
            <DataTag kind="demo" label="Demo data archive" />
            <button onClick={handleExportCSV} className="soc-btn h-7 text-[11px]">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-soc-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search history"
              placeholder="Search history by Case ID, domain name, or ASN..."
              className="soc-input h-9 pl-8"
            />
          </div>
          <Segmented
            ariaLabel="Verdict filter"
            value={verdictFilter}
            onChange={setVerdictFilter}
            options={['all', 'malicious', 'suspicious', 'clean'].map((v) => ({
              value: v,
              label: (
                <span>
                  {v.toUpperCase()} <span className="text-soc-muted">{countFor(v)}</span>
                </span>
              ),
            }))}
          />
        </div>
      </PageHeader>

      <Panel
        title={`Archived audit cases (${filteredRecords.length})`}
        subtitle="Select a row to re-open the dossier"
        flush
      >
        {filteredRecords.length === 0 ? (
          <EmptyState icon={History} title="No matching investigations found">
            <p>
              No cases matched the search term "{searchTerm}" with verdict filter "{verdictFilter}".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setVerdictFilter('all');
              }}
              className="soc-btn mt-3"
            >
              Reset filters
            </button>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="soc-table">
              <thead>
                <tr>
                  <th className="w-8">Sev</th>
                  <th>Case ID</th>
                  <th>Target domain</th>
                  <th>Verdict</th>
                  <th>Severity</th>
                  <th>Trust score</th>
                  <th>Resolved IP &amp; geo</th>
                  <th>TLS</th>
                  <th>Investigator</th>
                  <th>Timestamp</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="group cursor-pointer"
                    onClick={() => {
                      onSelectTarget(r.target);
                      onNavigate('website-investigation');
                    }}
                  >
                    <td>
                      <SeverityMeter level={r.severity} />
                    </td>
                    <td className="whitespace-nowrap font-mono text-soc-muted">{r.id}</td>
                    <td className="max-w-[240px] truncate font-mono font-medium text-soc-text">{r.target}</td>
                    <td className="whitespace-nowrap">
                      <StatusBadge verdict={r.verdict} size="sm" />
                    </td>
                    <td className="whitespace-nowrap">
                      <SeverityBadge level={r.severity} />
                    </td>
                    <td className="whitespace-nowrap">
                      <TrustScore score={r.trustScore} />
                    </td>
                    <td className="whitespace-nowrap font-mono text-[11px]">
                      {r.ipAddress} <span className="text-soc-muted">· {r.countryCode}</span>
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusBadge verdict={r.tlsStatus} size="sm" />
                    </td>
                    <td className="whitespace-nowrap text-[11px]">{r.investigator}</td>
                    <td className="whitespace-nowrap font-mono text-[11px] text-soc-muted">{r.timestamp}</td>
                    <td className="whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-soc-accent group-hover:text-soc-accent-hi">
                        Open dossier
                        <ChevronRight className="h-3.5 w-3.5" />
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
