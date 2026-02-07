export function sum(records, field) {
  return records.reduce((s, r) => s + (r[field] || 0), 0);
}

export function avg(records, field) {
  const vals = records.map(r => r[field]).filter(v => v != null && v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

export function groupBy(records, field) {
  const groups = {};
  for (const r of records) {
    const key = r[field] || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function rankBy(records, field, direction = 'desc') {
  const sorted = [...records].sort((a, b) =>
    direction === 'desc' ? (b[field] || 0) - (a[field] || 0) : (a[field] || 0) - (b[field] || 0)
  );
  return sorted.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function movingAverage(data, field, window = 7) {
  return data.map((item, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((s, r) => s + (r[field] || 0), 0) / slice.length;
    return { ...item, [`${field}MA`]: Math.round(avg * 100) / 100 };
  });
}
