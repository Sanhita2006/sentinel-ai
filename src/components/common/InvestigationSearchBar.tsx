import React, { useState, useEffect } from 'react';
import { Search, Globe, ArrowRight, X } from 'lucide-react';
import { DEMO_PRESET_TARGETS } from '../../data/mockData';

interface InvestigationSearchBarProps {
  onInvestigate: (target: string) => void;
  initialValue?: string;
  isCompact?: boolean;
}

export const InvestigationSearchBar: React.FC<InvestigationSearchBarProps> = ({
  onInvestigate,
  initialValue = '',
  isCompact = false,
}) => {
  const [inputVal, setInputVal] = useState(initialValue);
  const [protocol, setProtocol] = useState<'https://' | 'http://'>('https://');

  useEffect(() => {
    if (initialValue) {
      setInputVal(initialValue.replace(/^https?:\/\//i, ''));
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const cleanTarget = inputVal.trim().replace(/^https?:\/\//i, '');
    onInvestigate(cleanTarget);
  };

  const handleSelectPreset = (presetValue: string) => {
    const cleanTarget = presetValue.trim().replace(/^https?:\/\//i, '');
    setInputVal(cleanTarget);
    onInvestigate(cleanTarget);
  };

  const toggleProtocol = () => {
    setProtocol((prev) => (prev === 'https://' ? 'http://' : 'https://'));
  };

  return (
    <div className={`w-full ${isCompact ? '' : 'space-y-2.5'}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-stretch overflow-hidden rounded border border-soc-line-strong bg-soc-well transition-colors focus-within:border-soc-accent">
          <button
            type="button"
            onClick={toggleProtocol}
            title="Toggle protocol display (https:// or http://)"
            className="hidden items-center gap-1.5 border-r border-soc-line px-3 font-mono text-[11px] text-soc-text-2 hover:bg-soc-raised hover:text-soc-text sm:flex"
          >
            <Globe className="h-3.5 w-3.5 text-soc-accent" />
            <span>{protocol}</span>
          </button>

          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-soc-muted sm:hidden" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="URL, domain or IP — e.g. login-verify-bank.com, 194.26.29.114"
              aria-label="Investigation target"
              className="h-10 w-full bg-transparent font-mono text-[13px] text-soc-text placeholder:text-soc-muted focus:outline-none"
            />
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="rounded p-1 text-soc-muted hover:bg-soc-raised hover:text-soc-text"
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="flex items-center gap-1.5 bg-soc-accent px-4 text-xs font-semibold text-soc-accent-ink transition-colors hover:bg-soc-accent-hi disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Investigate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {!isCompact && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="soc-label mr-1">Demo presets</span>
          {DEMO_PRESET_TARGETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelectPreset(preset.value)}
              className="soc-chip hover:border-soc-forest-2 hover:text-soc-text"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
