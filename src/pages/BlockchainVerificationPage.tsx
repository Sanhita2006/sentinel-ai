import React, { useState } from 'react';
import { Blocks, CheckCircle2, ArrowRight, Fingerprint, SearchX, Loader2, Link2 } from 'lucide-react';
import { SAMPLE_BLOCKCHAIN_BLOCKS } from '../data/mockData';
import { PageHeader, Panel, DataTag, KpiTile } from '../components/ui/Soc';
import { utcStamp } from '../lib/severity';

export const BlockchainVerificationPage: React.FC = () => {
  const [verifyHashInput, setVerifyHashInput] = useState<string>('0x8f2a994cbe41982b6b5539201948ab1164919cb42e99f0101488c991a0b38421');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    blockNumber: number;
    timestamp: string;
    target: string;
    validator: string;
    merkleRoot: string;
  } | null>({
    verified: true,
    blockNumber: 104829,
    timestamp: '2026-11-07 17:42:25 UTC',
    target: 'secure-login-chase-update.info',
    validator: 'Sentinel-Node-Frankfurt-01',
    merkleRoot: '0x44ab9102948c00192a481944810283c4',
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const blockHeight = Math.max(...SAMPLE_BLOCKCHAIN_BLOCKS.map((b) => b.blockNumber));

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyHashInput.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      const query = verifyHashInput.trim().toLowerCase();
      const matched = SAMPLE_BLOCKCHAIN_BLOCKS.find(
        (b) =>
          b.verdictHash.toLowerCase().includes(query) ||
          b.threatTarget.toLowerCase().includes(query) ||
          query.includes(b.threatTarget.toLowerCase())
      );

      if (matched) {
        setVerificationResult({
          verified: true,
          blockNumber: matched.blockNumber,
          timestamp: matched.timestamp,
          target: matched.threatTarget,
          validator: matched.consensusValidator,
          merkleRoot: matched.merkleRoot,
        });
      } else {
        // No record in the (demo) ledger: report it as unverified instead of fabricating a proof.
        setVerificationResult({
          verified: false,
          blockNumber: 0,
          timestamp: utcStamp(),
          target: verifyHashInput.trim(),
          validator: '—',
          merkleRoot: '—',
        });
      }
    }, 500);
  };

  return (
    <div className="soc-page">
      <PageHeader
        icon={Blocks}
        title="Blockchain digital trust & cryptographic proof ledger"
        description="Forensic findings, threat verdicts and TLS snapshots are hashed and anchored into a tamper-evident consensus ledger."
        actions={<DataTag kind="simulated" label="Prototype ledger demo" />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Block height" value={`#${blockHeight.toLocaleString('en-US')}`} hint="Latest sample block" icon={Blocks} />
        <KpiTile label="Records in ledger" value={SAMPLE_BLOCKCHAIN_BLOCKS.length} hint="Sample anchored verdicts" icon={Fingerprint} tone="low" />
        <KpiTile
          label="Confirmed"
          value={SAMPLE_BLOCKCHAIN_BLOCKS.filter((b) => b.status.toLowerCase() === 'confirmed').length}
          hint="Consensus reached"
          icon={CheckCircle2}
          tone="clean"
        />
        <KpiTile label="Consensus" value="PoA" hint="Proof of Authority" icon={Link2} tone="medium" />
      </div>

      <Panel title="Audit forensic record integrity" subtitle="Enter a SHA-256 verdict hash or target domain to confirm timestamp proofs and validator consensus.">
        <form onSubmit={handleVerify} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={verifyHashInput}
            onChange={(e) => setVerifyHashInput(e.target.value)}
            aria-label="Record hash or target"
            placeholder="Enter record hash (0x... or SHA-256 hex string)"
            className="soc-input h-9 flex-1"
          />
          <button type="submit" disabled={isVerifying} className="soc-btn soc-btn-primary h-9">
            {isVerifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {isVerifying ? 'Checking Merkle tree…' : 'Verify cryptographic proof'}
            {!isVerifying && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        {verificationResult && (
          <div
            className={`mt-3 rounded border ${
              verificationResult.verified ? 'border-sev-clean/35 bg-sev-clean/[0.06]' : 'border-sev-medium/35 bg-sev-medium/[0.06]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-soc-line px-3 py-2">
              <div className="flex items-center gap-2">
                {verificationResult.verified ? (
                  <CheckCircle2 className="h-4 w-4 text-sev-clean" />
                ) : (
                  <SearchX className="h-4 w-4 text-sev-medium" />
                )}
                <span className={`font-mono text-xs font-semibold ${verificationResult.verified ? 'text-sev-clean' : 'text-sev-medium'}`}>
                  {verificationResult.verified ? 'CRYPTOGRAPHIC PROOF VERIFIED (DEMO LEDGER)' : 'NO MATCHING RECORD IN DEMO LEDGER'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-soc-muted">
                {verificationResult.verified ? 'Consensus confirmed' : `Checked ${verificationResult.timestamp}`}
              </span>
            </div>
            {verificationResult.verified ? (
              <div className="grid grid-cols-1 gap-3 px-3 py-2.5 font-mono text-xs sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <div className="soc-label">Block height</div>
                  <div className="font-semibold text-soc-text">#{verificationResult.blockNumber}</div>
                </div>
                <div className="min-w-0">
                  <div className="soc-label">Target domain</div>
                  <div className="truncate text-soc-text">{verificationResult.target}</div>
                </div>
                <div>
                  <div className="soc-label">Validator node</div>
                  <div className="text-soc-text-2">{verificationResult.validator}</div>
                </div>
                <div className="min-w-0">
                  <div className="soc-label">Merkle root</div>
                  <div className="truncate text-soc-text-2">{verificationResult.merkleRoot}</div>
                </div>
                <div>
                  <div className="soc-label">Anchored</div>
                  <div className="text-soc-text-2">{verificationResult.timestamp}</div>
                </div>
              </div>
            ) : (
              <p className="px-3 py-2.5 text-xs text-soc-text-2">
                <span className="font-mono text-soc-text">{verificationResult.target}</span> does not match any verdict hash or
                target in the sample ledger. No proof has been generated.
              </p>
            )}
          </div>
        )}
      </Panel>

      <Panel
        title="Recent trust ledger blocks"
        flush
        actions={
          <>
            <span className="soc-label">Proof of Authority (PoA)</span>
            <DataTag kind="simulated" />
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>Block #</th>
                <th>Target domain</th>
                <th>Verdict hash fingerprint</th>
                <th>Prev. block hash</th>
                <th>Validator node</th>
                <th>Timestamp (UTC)</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_BLOCKCHAIN_BLOCKS.map((block) => {
                const confirmed = block.status.toLowerCase() === 'confirmed';
                return (
                  <tr key={block.blockNumber}>
                    <td className="whitespace-nowrap font-semibold text-soc-accent-hi">#{block.blockNumber}</td>
                    <td className="max-w-[200px] truncate text-soc-text">{block.threatTarget}</td>
                    <td className="max-w-[220px] truncate" title={block.verdictHash}>
                      {block.verdictHash}
                    </td>
                    <td className="max-w-[160px] truncate text-soc-muted" title={block.previousBlockHash}>
                      {block.previousBlockHash}
                    </td>
                    <td className="whitespace-nowrap">{block.consensusValidator}</td>
                    <td className="whitespace-nowrap text-soc-muted">
                      {block.timestamp.split(' ')[0]} {block.timestamp.split(' ')[1]}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <span
                        className={`rounded-[3px] border px-1.5 py-[1px] text-[10px] font-semibold uppercase ${
                          confirmed ? 'border-sev-clean/35 bg-sev-clean/10 text-sev-clean' : 'border-sev-medium/35 bg-sev-medium/10 text-sev-medium'
                        }`}
                      >
                        {block.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};
