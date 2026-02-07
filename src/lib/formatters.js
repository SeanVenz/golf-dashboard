import { format, parseISO } from 'date-fns';

export function formatNumber(val, precision = 0) {
  if (val == null || isNaN(val)) return '—';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatPercent(val) {
  if (val == null || isNaN(val)) return '—';
  return `${(val * 100).toFixed(1)}%`;
}

export function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds) || seconds === 0) return '—';
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  const mRem = m % 60;
  return `${h}h ${mRem}m`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatCompact(val) {
  if (val == null || isNaN(val)) return '—';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return formatNumber(val);
}

export function formatDelta(current, previous) {
  if (!previous || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  return {
    value: pct,
    label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`,
    positive: pct >= 0,
  };
}
