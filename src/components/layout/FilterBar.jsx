import { X, RotateCcw, Search } from 'lucide-react';
import useFilterStore from '../../stores/useFilterStore';
import { useState, useRef, useEffect } from 'react';

function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:border-slate-600 transition-colors"
      >
        {label}
        {selected.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
            {selected.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 w-48 max-h-60 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                selected.includes(opt)
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentSearch({ agents, selected, onChange }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query
    ? agents.filter((a) => a.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm">
        <Search size={14} className="text-slate-500" />
        <input
          type="text"
          placeholder={selected || 'Search agent...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="bg-transparent outline-none text-slate-300 placeholder-slate-500 w-36"
        />
        {selected && (
          <button onClick={() => { onChange(null); setQuery(''); }} className="text-slate-500 hover:text-slate-300">
            <X size={14} />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute top-full mt-1 left-0 w-64 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1">
          {filtered.map((name) => (
            <button
              key={name}
              onClick={() => {
                onChange(name);
                setQuery('');
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterBar() {
  const {
    dateRange, selectedTeams, selectedAgent, selectedLobs,
    availableTeams, availableLobs, availableAgents, dateExtent,
    setDateRange, setSelectedTeams, setSelectedAgent, setSelectedLobs, resetFilters,
  } = useFilterStore();

  const hasFilters =
    selectedTeams.length > 0 || selectedAgent || selectedLobs.length > 0 ||
    dateRange.start !== dateExtent.min || dateRange.end !== dateExtent.max;

  return (
    <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 px-4 py-2.5">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateRange.start || ''}
            onChange={(e) => setDateRange(e.target.value, dateRange.end)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 outline-none focus:border-indigo-500"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="date"
            value={dateRange.end || ''}
            onChange={(e) => setDateRange(dateRange.start, e.target.value)}
            className="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="w-px h-6 bg-slate-700" />

        <MultiSelect label="Team" options={availableTeams} selected={selectedTeams} onChange={setSelectedTeams} />
        <MultiSelect label="LOB" options={availableLobs} selected={selectedLobs} onChange={setSelectedLobs} />
        <AgentSearch agents={availableAgents} selected={selectedAgent} onChange={setSelectedAgent} />

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {selectedAgent && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
            Viewing: {selectedAgent}
            <button onClick={() => setSelectedAgent(null)} className="hover:text-indigo-300">
              <X size={12} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
