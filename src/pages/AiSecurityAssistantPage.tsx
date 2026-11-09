import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, Copy, Check, Loader2, Info } from 'lucide-react';
import { PageHeader, DataTag } from '../components/ui/Soc';
import { utcTime } from '../lib/severity';

/** Minimal, safe formatter for **bold**, `code` and ### headings in scripted replies. */
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-soc-text">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-${i}`} className="rounded bg-soc-well px-1 py-px font-mono text-[11px] text-soc-text">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });

const FormattedMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="space-y-1.5">
    {content.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1" />;
      if (line.startsWith('### ')) {
        return (
          <div key={i} className="soc-title pt-1 text-[11px]">
            {renderInline(line.slice(4), `h${i}`)}
          </div>
        );
      }
      return <p key={i}>{renderInline(line, `p${i}`)}</p>;
    })}
  </div>
);

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeSnippet?: string;
}

export const AiSecurityAssistantPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      timestamp: utcTime(),
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
          timestamp: utcTime(),
          codeSnippet: snippet,
        },
      ]);
      setIsGenerating(false);
    }, 600);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isGenerating]);

  const copySnippet = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="soc-page h-[calc(100vh-6rem)] min-h-[560px] lg:h-[calc(100vh-6.5rem)]">
      <PageHeader
        icon={Bot}
        title="SENTINEL AI security copilot"
        description="Interactive threat-analysis assistant. Responses in this build are scripted locally; no language model is connected."
        actions={<DataTag kind="local" label="Scripted responses · no model connected" />}
      />

      <section className="soc-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-soc-forest-2 bg-soc-forest text-soc-accent-hi">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-3xl rounded border px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser ? 'border-soc-forest-2 bg-soc-forest/50 text-soc-text' : 'border-soc-line bg-soc-raised text-soc-text-2'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-6 font-mono text-[10px] uppercase tracking-wider text-soc-muted">
                    <span>{isUser ? 'Analyst' : 'Sentinel AI assistant'}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  {isUser ? <div className="whitespace-pre-line">{m.content}</div> : <FormattedMessage content={m.content} />}
                  {m.codeSnippet && (
                    <div className="soc-well mt-2.5 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-soc-line px-2.5 py-1">
                        <span className="soc-label">Snippet</span>
                        <button
                          onClick={() => copySnippet(m.id, m.codeSnippet || '')}
                          className="flex items-center gap-1 font-mono text-[10px] text-soc-muted hover:text-soc-text"
                        >
                          {copiedId === m.id ? <Check className="h-3 w-3 text-soc-accent" /> : <Copy className="h-3 w-3" />}
                          {copiedId === m.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto p-2.5 font-mono text-[11px] text-soc-text-2">{m.codeSnippet}</pre>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-soc-line-strong bg-soc-raised font-mono text-[9px] font-semibold text-soc-text-2">
                    SOC
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex w-fit items-center gap-2 rounded border border-soc-line bg-soc-raised px-3 py-2 font-mono text-[11px] text-soc-text-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-soc-accent" />
              Sentinel AI reasoning over threat context…
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-soc-line bg-soc-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="soc-label mr-1">Quick queries</span>
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isGenerating}
                className="soc-chip hover:border-soc-forest-2 hover:text-soc-text disabled:opacity-50"
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
              aria-label="Message the assistant"
              placeholder="Ask about threat mitigation, cipher suites or forensic analysis…"
              className="soc-input h-9 flex-1 font-sans text-[13px]"
            />
            <button onClick={() => handleSend()} disabled={!inputVal.trim() || isGenerating} className="soc-btn soc-btn-primary h-9">
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-[10.5px] text-soc-muted">
            <Info className="h-3 w-3" />
            Guidance is illustrative. Validate rules and remediation steps before production use.
          </p>
        </div>
      </section>
    </div>
  );
};
