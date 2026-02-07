export const SALE_COLORS = {
  cp: '#22c55e',
  vip: '#a855f7',
  product: '#f97316',
  sc: '#06b6d4',
  gs: '#eab308',
};

export const CALL_COLORS = {
  inbound: '#3b82f6',
  outbound: '#8b5cf6',
};

export const TEAM_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e',
];

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#f43f5e', '#06b6d4',
];

export const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/agents', label: 'Agents', icon: 'Users' },
  { path: '/sales', label: 'Sales', icon: 'TrendingUp' },
  { path: '/attendance', label: 'Attendance', icon: 'CalendarDays' },
  { path: '/productivity', label: 'Productivity', icon: 'Activity' },
];

export const METRIC_DEFS = {
  cph: { label: 'Calls/Hour', format: 'decimal', precision: 1 },
  aht: { label: 'Avg Handle Time', format: 'duration' },
  totalSales: { label: 'Total Sales', format: 'integer' },
  workHrsCompliance: { label: 'Work Hrs Compliance', format: 'percent' },
  hubActivity: { label: 'Hub Activity', format: 'percent' },
  phoneTHub: { label: 'Phone/Hub', format: 'percent' },
  totalCalls: { label: 'Total Calls', format: 'integer' },
  regularHours: { label: 'Login Hours', format: 'decimal', precision: 1 },
};
