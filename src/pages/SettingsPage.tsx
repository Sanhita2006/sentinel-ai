import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Key,
  Shield,
  Sliders,
  CheckCircle2,
  Save,
  Blocks,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SettingsPageProps {
  onOpenDemoNotice: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenDemoNotice }) => {
  const [sensitivity, setSensitivity] = useState<'Standard' | 'Strict' | 'Paranoid'>('Strict');
  const [autoSinkhole, setAutoSinkhole] = useState<boolean>(true);
  const [slackAlerts, setSlackAlerts] = useState<boolean>(true);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                SENTINEL AI System Settings
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
              Configure detection thresholds, external API connectors, SIEM webhooks, and consensus validator preferences.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

        {savedNotification && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Configuration changes successfully committed to local SOC state.</span>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detection Sensitivity */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              Heuristic Sensitivity &amp; Triage Level
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'Standard',
                desc: 'Standard commercial heuristics. Avoids false-positives on high-churn CDNs.',
              },
              {
                id: 'Strict',
                desc: 'Strict mode (Recommended). Flags newly registered domains (<7 days) and untrusted TLS CAs.',
              },
              {
                id: 'Paranoid',
                desc: 'Zero-tolerance posture. Flags any non-EV certificate and unverified reverse DNS.',
              },
            ].map((lvl) => (
              <label
                key={lvl.id}
                onClick={() => setSensitivity(lvl.id as any)}
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  sensitivity === lvl.id
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : 'bg-[#060a14] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="sensitivity"
                  checked={sensitivity === lvl.id}
                  onChange={() => {}}
                  className="mt-1 accent-cyan-400"
                />
                <div>
                  <span className="font-bold text-xs uppercase font-mono">{lvl.id} Level</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{lvl.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Threat Alert Dispatchers */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              Alerts &amp; Automated Dispatch
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Slack / Discord SOC Webhook</span>
                <p className="text-slate-400 text-[11px]">Dispatch critical verdicts to incident response channel</p>
              </div>
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Automated DNS Sinkhole Broadcast</span>
                <p className="text-slate-400 text-[11px]">Sync high-risk indicators directly with BGP / Pi-hole / CoreDNS</p>
              </div>
              <input
                type="checkbox"
                checked={autoSinkhole}
                onChange={(e) => setAutoSinkhole(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#060a14] border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400">SIEM Syslog Forwarder</span>
              <input
                type="text"
                defaultValue="syslog.internal.sentinel:514 (TLS)"
                className="mt-1 w-full p-2 rounded bg-black/60 border border-slate-800 font-mono text-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* External Threat Feeds Connectors */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              Threat Intelligence Connectors
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: 'Google Safe Browsing API', status: 'Connected (Demo Key)' },
              { name: 'VirusTotal Enterprise v3', status: 'Connected (Demo Key)' },
              { name: 'AlienVault OTX Community', status: 'Enabled' },
              { name: 'Shodan Reconnaissance API', status: 'Ready for Key' },
            ].map((feed) => (
              <div
                key={feed.name}
                className="p-3 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between"
              >
                <span className="font-mono text-slate-200">{feed.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  {feed.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Node Telemetry */}
        <div className="p-6 rounded-xl bg-[#090e1c] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Blocks className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              Consensus Network Validators
            </h3>
          </div>

          <div className="space-y-2 text-xs font-mono">
            {[
              { name: 'Sentinel-Node-Frankfurt-01', latency: '18ms', status: 'Active Validator' },
              { name: 'Sentinel-Node-Singapore-03', latency: '42ms', status: 'Active Validator' },
              { name: 'Sentinel-Node-Virginia-02', latency: '24ms', status: 'Active Validator' },
              { name: 'Sentinel-Node-Tokyo-01', latency: '65ms', status: 'Active Validator' },
            ].map((node) => (
              <div
                key={node.name}
                className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-white font-bold">{node.name}</span>
                  <span className="text-slate-400 text-[10px] ml-2">({node.latency})</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">ONLINE</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDemoNotice}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-950/60 transition-colors text-center"
            >
              View Hackathon Demo Disclaimer &amp; Compliance Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
