import React, { useState } from 'react';
import { Settings, Bell, Key, Sliders, CheckCircle2, Save, Blocks, FlaskConical } from 'lucide-react';
import { PageHeader, Panel, DataTag, Notice } from '../components/ui/Soc';

interface SettingsPageProps {
  onOpenDemoNotice: () => void;
}

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-[18px] w-8 shrink-0 rounded-full border transition-colors ${
      checked ? 'border-soc-accent bg-soc-accent/80' : 'border-soc-line-strong bg-soc-well'
    }`}
  >
    <span
      className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all ${
        checked ? 'left-[15px] bg-soc-accent-ink' : 'left-[2px] bg-soc-muted'
      }`}
    />
  </button>
);

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenDemoNotice }) => {
  const [sensitivity, setSensitivity] = useState<'Standard' | 'Strict' | 'Paranoid'>('Strict');
  const [autoSinkhole, setAutoSinkhole] = useState<boolean>(true);
  const [slackAlerts, setSlackAlerts] = useState<boolean>(true);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const levels: Array<{ id: 'Standard' | 'Strict' | 'Paranoid'; desc: string }> = [
    { id: 'Standard', desc: 'Standard commercial heuristics. Avoids false-positives on high-churn CDNs.' },
    { id: 'Strict', desc: 'Strict mode (Recommended). Flags newly registered domains (<7 days) and untrusted TLS CAs.' },
    { id: 'Paranoid', desc: 'Zero-tolerance posture. Flags any non-EV certificate and unverified reverse DNS.' },
  ];

  return (
    <div className="soc-page">
      <PageHeader
        icon={Settings}
        title="SENTINEL AI system settings"
        description="Configure detection thresholds, external API connectors, SIEM webhooks and consensus validator preferences."
        actions={
          <button onClick={handleSave} className="soc-btn soc-btn-primary">
            <Save className="h-3.5 w-3.5" />
            Save configuration
          </button>
        }
      >
        {savedNotification ? (
          <Notice tone="ok" icon={CheckCircle2}>
            Configuration changes applied to the local SOC state for this session (not persisted to a server).
          </Notice>
        ) : (
          <p className="text-[11px] text-soc-muted">Settings are held in browser memory for the current session.</p>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Heuristic sensitivity & triage level" icon={Sliders}>
          <div className="space-y-2" role="radiogroup" aria-label="Heuristic sensitivity">
            {levels.map((lvl) => {
              const active = sensitivity === lvl.id;
              return (
                <label
                  key={lvl.id}
                  className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 transition-colors ${
                    active ? 'border-soc-forest-2 bg-soc-forest/40' : 'border-soc-line bg-soc-well hover:border-soc-line-strong'
                  }`}
                >
                  <input
                    type="radio"
                    name="sensitivity"
                    checked={active}
                    onChange={() => setSensitivity(lvl.id)}
                    className="mt-0.5 accent-[var(--color-soc-accent)]"
                  />
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase text-soc-text">{lvl.id} level</span>
                    <p className="mt-0.5 text-[11px] text-soc-text-2">{lvl.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </Panel>

        <Panel title="Alerts & automated dispatch" icon={Bell} flush>
          <ul className="divide-y divide-soc-line text-xs">
            <li className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="font-medium text-soc-text">Slack / Discord SOC webhook</div>
                <p className="text-[11px] text-soc-text-2">Dispatch critical verdicts to incident response channel</p>
              </div>
              <Switch checked={slackAlerts} onChange={setSlackAlerts} label="Slack / Discord SOC webhook" />
            </li>
            <li className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="font-medium text-soc-text">Automated DNS sinkhole broadcast</div>
                <p className="text-[11px] text-soc-text-2">Sync high-risk indicators directly with BGP / Pi-hole / CoreDNS</p>
              </div>
              <Switch checked={autoSinkhole} onChange={setAutoSinkhole} label="Automated DNS sinkhole broadcast" />
            </li>
            <li className="px-4 py-3">
              <label className="soc-label" htmlFor="siem-forwarder">
                SIEM syslog forwarder
              </label>
              <input id="siem-forwarder" type="text" defaultValue="syslog.internal.sentinel:514 (TLS)" className="soc-input mt-1 h-8" />
            </li>
          </ul>
        </Panel>

        <Panel title="Threat intelligence connectors" icon={Key} flush actions={<DataTag kind="demo" />}>
          <table className="soc-table">
            <tbody>
              {[
                { name: 'Google Safe Browsing API', status: 'Connected (Demo Key)' },
                { name: 'VirusTotal Enterprise v3', status: 'Connected (Demo Key)' },
                { name: 'AlienVault OTX Community', status: 'Enabled' },
                { name: 'Shodan Reconnaissance API', status: 'Ready for Key' },
              ].map((feed) => (
                <tr key={feed.name}>
                  <td className="font-mono text-soc-text">{feed.name}</td>
                  <td className="text-right">
                    <span className="soc-chip">{feed.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-soc-line px-4 py-2 text-[11px] text-soc-muted">
            Connector statuses are illustrative; API keys are configured on the server, not in this interface.
          </p>
        </Panel>

        <Panel title="Consensus network validators" icon={Blocks} flush actions={<DataTag kind="simulated" />}>
          <table className="soc-table font-mono">
            <thead>
              <tr>
                <th>Node</th>
                <th>Latency</th>
                <th>Role</th>
                <th className="text-right">State</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sentinel-Node-Frankfurt-01', latency: '18ms', status: 'Active Validator' },
                { name: 'Sentinel-Node-Singapore-03', latency: '42ms', status: 'Active Validator' },
                { name: 'Sentinel-Node-Virginia-02', latency: '24ms', status: 'Active Validator' },
                { name: 'Sentinel-Node-Tokyo-01', latency: '65ms', status: 'Active Validator' },
              ].map((node) => (
                <tr key={node.name}>
                  <td className="text-soc-text">{node.name}</td>
                  <td className="tabular-nums">{node.latency}</td>
                  <td className="text-[11px]">{node.status}</td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-sev-clean">
                      <span className="h-1.5 w-1.5 rounded-full bg-sev-clean" />
                      ONLINE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-soc-line px-4 py-3">
            <button onClick={onOpenDemoNotice} className="soc-btn w-full border-sev-medium/35 text-sev-medium hover:text-sev-medium">
              <FlaskConical className="h-3.5 w-3.5" />
              View hackathon demo disclaimer &amp; compliance notes
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
};
