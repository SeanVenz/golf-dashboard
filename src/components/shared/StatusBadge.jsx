const statusStyles = {
  VL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LOA: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  Hol: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  default: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${style}`}>
      {status || 'Active'}
    </span>
  );
}
