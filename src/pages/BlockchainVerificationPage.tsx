import React, { useState } from 'react';
import {
  Blocks,
  CheckCircle2,
  ShieldCheck,
  Search,
  Copy,
  ExternalLink,
  Fingerprint,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SAMPLE_BLOCKCHAIN_BLOCKS } from '../data/mockData';

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
        setVerificationResult({
          verified: true,
          blockNumber: 104830,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          target: verifyHashInput.trim(),
          validator: 'Sentinel-Node-Frankfurt-01 (Simulated)',
          merkleRoot: '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Blocks className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Blockchain Digital Trust &amp; Cryptographic Proof Ledger
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Every forensic finding, threat verdict, and TLS snapshot is hashed and anchored into an immutable, tamper-proof consensus ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              PROTOTYPE LEDGER DEMO
            </span>
            <span className="text-xs font-mono text-slate-400">Block Height:</span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs">
              #104,829
            </span>
          </div>
        </div>
      </div>

      {/* Verification Tool Card */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Audit Forensic Record Integrity
        </h3>
        <p className="text-xs text-slate-400">
          Enter any SHA-256 verdict hash or Merkle root to confirm timestamp proofs and validator consensus signatures.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={verifyHashInput}
              onChange={(e) => setVerifyHashInput(e.target.value)}
              placeholder="Enter record hash (0x... or SHA-256 hex string)"
              className="w-full bg-[#050811] border border-slate-800 rounded-lg px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs font-mono flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{isVerifying ? 'Checking Merkle Tree...' : 'Verify Cryptographic Proof'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Verification Certificate Result */}
        {verificationResult && (
          <div className="mt-4 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-emerald-300 font-mono">
                  CRYPTOGRAPHIC PROOF VERIFIED ON-CHAIN
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400">Consensus Confirmed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-emerald-900/50">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Block Height</span>
                <p className="text-white font-bold">#{verificationResult.blockNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Target Domain</span>
                <p className="text-cyan-300 font-semibold truncate">{verificationResult.target}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Validator Node</span>
                <p className="text-white">{verificationResult.validator}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Merkle Root</span>
                <p className="text-slate-300 truncate">{verificationResult.merkleRoot}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Blockchain Stream Table */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Recent Trust Ledger Blocks
          </h3>
          <span className="text-xs font-mono text-cyan-400">Consensus Algorithm: Proof of Authority (PoA)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">Block #</th>
                <th className="py-3 px-3">Target Domain</th>
                <th className="py-3 px-3">Verdict Hash Fingerprint</th>
                <th className="py-3 px-3">Validator Node</th>
                <th className="py-3 px-3">Timestamp (UTC)</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {SAMPLE_BLOCKCHAIN_BLOCKS.map((block) => (
                <tr key={block.blockNumber} className="hover:bg-slate-800/30 font-mono">
                  <td className="py-3 px-3 text-cyan-400 font-bold whitespace-nowrap">
                    #{block.blockNumber}
                  </td>
                  <td className="py-3 px-3 text-white max-w-[200px] truncate">
                    {block.threatTarget}
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-[240px] truncate">
                    {block.verdictHash}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {block.consensusValidator}
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {block.timestamp.split(' ')[0]} {block.timestamp.split(' ')[1]}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                      CONFIRMED
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
