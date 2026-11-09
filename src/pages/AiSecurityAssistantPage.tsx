import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  Terminal,
  CheckCircle2,
  Copy,
  RefreshCw,
  Info,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeSnippet?: string;
}

export const AiSecurityAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content:
        'Hello Analyst. I am SENTINEL AI Copilot, your specialized threat intelligence assistant. I can assist with reversing obfuscated payloads, explaining punycode vectors, writing YARA / Snort detection rules, and crafting registrar takedown dossiers.',
      timestamp: '18:10 UTC',
    },
    {
      id: 'msg-2',
      sender: 'user',
      content: 'Explain why Cyrillic homoglyph attacks are particularly dangerous and how our SOC can mitigate them.',
      timestamp: '18:11 UTC',
    },
    {
      id: 'msg-3',
      sender: 'assistant',
      content: `Homoglyph attacks exploit the Internationalized Domain Name (IDN) standard. In Latin script, the lowercase letter "a" (U+0061) looks identical on screen to the Cyrillic small letter "а" (U+0430). 

When an attacker registers **xn--pyp-6cd.com**, most web browsers and mobile clients render it visually as **pаypаl.com**, completely deceiving human visual inspection.

### Recommended SOC Mitigation Architecture:
1. **Punycode Enforcement:** Convert all inbound email and web traffic URLs to ASCII Punycode form (\`xn--\`) before performing lexical checks.
2. **Confusable Character Mapping:** Run Unicode UTS #39 Confusables detection on all newly registered domain feeds.
3. **Strict Web Proxy Filtering:** Block or flag any domain containing mixed-script Unicode in commercial brands.`,
      timestamp: '18:11 UTC',
      codeSnippet: `# Python sample for punycode conversion
import idna

def inspect_domain(domain: str):
    punycode = idna.encode(domain).decode('ascii')
    has_mixed_script = punycode.startswith('xn--')
    return {'raw': domain, 'punycode': punycode, 'suspicious_idn': has_mixed_script}`,
    },
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const promptSuggestions = [
    'How do I remediate DMARC p=none policy?',
    'Write a registrar abuse takedown letter',
    'Generate Suricata rule for banking phish',
    'Explain difference between DV and EV certificates',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);

    setTimeout(() => {
      let botResponse = `Analysis complete for: "${text}". Here is the recommended SOC technical response:\n\n1. Verify the authoritative DNS records and check whether DNSSEC is signed.\n2. Query the IP address against active threat intelligence feeds.\n3. Implement immediate sinkhole or firewall rule block at the border gateway.`;
      let snippet: string | undefined = undefined;

      if (text.toLowerCase().includes('dmarc')) {
        botResponse = `To remediate a permissive **DMARC policy (p=none)**, migrate systematically through a phased enforcement roll-out:\n\n1. **Audit Phase (p=none):** Collect aggregate XML reports (rua) for 30 days.\n2. **Quarantine Phase (p=quarantine; pct=25 to 100):** Unaligned emails are sent to spam.\n3. **Full Rejection (p=reject):** Completely drop unauthorized spoofed emails at the gateway.`;
        snippet = `v=DMARC1; p=reject; sp=reject; rua=mailto:dmarc-reports@yourcompany.com; pct=100; aspf=s; adkim=s;`;
      } else if (text.toLowerCase().includes('takedown')) {
        botResponse = `Here is a formal registrar abuse notice template for immediate escalation:`;
        snippet = `Subject: URGENT: Abuse Notification - Active Credential Harvesting Site [Ref: SENTINEL-INV]
To: abuse@registrar-domain.com

Dear Abuse Team,
Please be advised that domain [TARGET_DOMAIN] (IP: [IP_ADDRESS]) is currently hosting an active phishing site impersonating [BRAND]. 
Attached are the forensic HTTP headers and SHA-256 integrity proofs. 
We request immediate suspension pursuant to your Terms of Service regarding malicious cyber activities.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          content: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          codeSnippet: snippet,
        },
      ]);
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="p-4 md:p-6 rounded-xl bg-[#090e1c] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                SENTINEL AI Security Copilot
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Interactive cyber threat analysis engine · Designed for Gemini 2.5 Flash LLM integration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              Gemini API Connector Ready
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 rounded-xl bg-[#070b16] border border-slate-800 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 text-black">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-4 rounded-xl text-xs leading-relaxed space-y-3 ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white font-medium'
                  : 'bg-[#0b1122] border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 pb-1 border-b border-white/10 text-[10px] text-slate-400 font-mono">
                <span>{m.sender === 'user' ? 'Analyst' : 'Sentinel AI Assistant'}</span>
                <span>{m.timestamp}</span>
              </div>

              <div className="whitespace-pre-line">{m.content}</div>

              {m.codeSnippet && (
                <div className="p-3 rounded-lg bg-[#050811] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <pre>{m.codeSnippet}</pre>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-mono text-xs font-bold">
                SOC
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 p-3 rounded-lg bg-[#090e1c] w-fit">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Sentinel AI reasoning over threat context...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompts & Input Bar */}
      <div className="shrink-0 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Quick Queries:</span>
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded bg-[#090e1c] hover:bg-[#121c38] border border-slate-800 text-slate-300 hover:text-cyan-300 text-[11px] transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Sentinel AI Copilot regarding threat mitigation, cipher suites, or forensic analysis..."
            className="flex-1 bg-[#090e1c] border border-slate-800 rounded-lg px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isGenerating}
            className="px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs md:text-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
