import { useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import KpiCard from '../components/shared/KpiCard';
import ChartCard from '../components/shared/ChartCard';
import BarRankChart from '../components/charts/BarRankChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import StackedAreaChart from '../components/charts/StackedAreaChart';
import DonutChart from '../components/charts/DonutChart';
import useFilteredData from '../hooks/useFilteredData';
import { formatNumber, formatCompact } from '../lib/formatters';
import { sum, avg } from '../lib/metrics';
import { SALE_COLORS } from '../lib/constants';
import { DollarSign, TrendingUp, Award, BarChart3 } from 'lucide-react';

export default function SalesAnalyticsPage() {
  const { agentsSummary, dailyTotals, teamsSummary, agentsDaily } = useFilteredData();

  const kpis = useMemo(() => {
    const totalSales = sum(agentsSummary, 'totalSales');
    const agentsWithSales = agentsSummary.filter((a) => a.totalSales > 0);
    const avgSales = agentsWithSales.length > 0
      ? totalSales / agentsWithSales.length
      : 0;
    const topSeller = [...agentsSummary].sort((a, b) => b.totalSales - a.totalSales)[0];
    const totalDays = dailyTotals.length;
    const avgDailySales = totalDays > 0 ? totalSales / totalDays : 0;
    return { totalSales, avgSales, topSeller, avgDailySales };
  }, [agentsSummary, dailyTotals]);

  const salesLeaderboard = useMemo(() => {
    return agentsSummary
      .filter((a) => a.totalSales > 0)
      .map((a) => ({ name: a.name, value: a.totalSales }));
  }, [agentsSummary]);

  const lobBreakdown = useMemo(() => {
    const cp = sum(agentsSummary, 'salesCp');
    const vip = sum(agentsSummary, 'salesVip');
    const product = sum(agentsSummary, 'salesProduct');
    const sc = sum(agentsSummary, 'salesSc');
    const gs = sum(agentsSummary, 'salesGs');
    return [
      { name: 'CP', value: cp },
      { name: 'VIP', value: vip },
      { name: 'Product', value: product },
      { name: 'SC', value: sc },
      { name: 'GS', value: gs },
    ].filter((d) => d.value > 0);
  }, [agentsSummary]);

  const teamSales = useMemo(() => {
    return teamsSummary
      .filter((t) => t.totalSales > 0)
      .map((t) => ({ name: t.team, value: t.totalSales }));
  }, [teamsSummary]);

  return (
    <div>
      <PageHeader title="Sales Analytics" subtitle="Sales performance and trends" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Sales" value={formatCompact(kpis.totalSales)} icon={DollarSign} />
        <KpiCard title="Avg Daily Sales" value={formatNumber(kpis.avgDailySales, 1)} icon={TrendingUp} />
        <KpiCard
          title="Top Seller"
          value={kpis.topSeller?.name || '—'}
          subtitle={kpis.topSeller ? `${formatNumber(kpis.topSeller.totalSales)} sales` : ''}
          icon={Award}
        />
        <KpiCard title="Avg Per Agent" value={formatNumber(kpis.avgSales, 1)} icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Sales Leaderboard" subtitle="Top agents by total sales">
          <BarRankChart data={salesLeaderboard} color="#22c55e" height={350} limit={15} />
        </ChartCard>

        <ChartCard title="Sales by LOB" subtitle="Overall breakdown by line of business">
          <DonutChart
            data={lobBreakdown}
            colors={[SALE_COLORS.cp, SALE_COLORS.vip, SALE_COLORS.product, SALE_COLORS.sc, SALE_COLORS.gs]}
            height={350}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Daily Sales Trend" subtitle="All sale types over time">
          <StackedAreaChart
            data={dailyTotals}
            areas={[
              { dataKey: 'salesCp', label: 'CP', color: SALE_COLORS.cp },
              { dataKey: 'salesVip', label: 'VIP', color: SALE_COLORS.vip },
              { dataKey: 'salesProduct', label: 'Product', color: SALE_COLORS.product },
              { dataKey: 'salesSc', label: 'SC', color: SALE_COLORS.sc },
              { dataKey: 'salesGs', label: 'GS', color: SALE_COLORS.gs },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Sales by Team" subtitle="Total sales per team">
          <BarRankChart data={teamSales} color="#a855f7" height={280} limit={10} />
        </ChartCard>
      </div>
    </div>
  );
}
