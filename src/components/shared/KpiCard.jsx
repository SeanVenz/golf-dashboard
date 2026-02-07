import { ArrowUp, ArrowDown } from 'lucide-react';

export default function KpiCard({ title, value, subtitle, delta, icon: Icon }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && <Icon size={16} className="text-slate-500" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-slate-100">{value}</span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              delta.positive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {delta.positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {delta.label}
          </span>
        )}
      </div>
      {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
    </div>
  );
}
