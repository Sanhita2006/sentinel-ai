import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, ArrowRight, CornerDownLeft, Sparkles, Filter } from 'lucide-react';
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
    <div className={`w-full ${isCompact ? '' : 'space-y-3'}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-xl bg-[#090e1c] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)] focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all">
          <button
            type="button"
            onClick={toggleProtocol}
            title="Click to toggle protocol (https:// or http://)"
            className="hidden sm:flex items-center pl-3.5 pr-2 py-3 border-r border-slate-800 text-xs font-mono text-cyan-400 font-semibold select-none hover:bg-slate-800/40 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            <span>{protocol}</span>
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter URL, domain, or IP (e.g. login-verify-bank.com, 194.26.29.114)"
            className="w-full bg-transparent px-4 py-3.5 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
          />

          <div className="flex items-center gap-2 pr-2.5">
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="text-xs text-slate-500 hover:text-slate-300 px-1 py-0.5 rounded"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs md:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-950/60"
            >
              <span>Investigate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {!isCompact && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick Demo Presets:
          </span>
          {DEMO_PRESET_TARGETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelectPreset(preset.value)}
              className="px-2.5 py-1 rounded bg-[#0e162a] hover:bg-[#15203c] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors font-mono text-[11px]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
