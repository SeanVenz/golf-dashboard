import { useMemo } from 'react';
import { Phone, DollarSign, Clock, Activity, CheckCircle, Headphones } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import KpiCard from '../components/shared/KpiCard';
import ChartCard from '../components/shared/ChartCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import StackedAreaChart from '../components/charts/StackedAreaChart';
import TeamComparisonChart from '../components/charts/TeamComparisonChart';
import useFilteredData from '../hooks/useFilteredData';
import { formatNumber, formatDuration, formatPercent, formatCompact } from '../lib/formatters';
import { sum, avg, movingAverage } from '../lib/metrics';
import { SALE_COLORS, CALL_COLORS } from '../lib/constants';

export default function OverviewPage() {
  const { agentsDaily, dailyTotals, teamsSummary } = useFilteredData();

  const kpis = useMemo(() => {
    const totalCalls = sum(agentsDaily, 'totalCalls');
    const totalSales = sum(agentsDaily, 'totalSales');
    const avgCph = avg(agentsDaily, 'cph');
    const avgAht = avg(agentsDaily, 'aht');
    const avgCompliance = avg(agentsDaily, 'workHrsCompliance');
    const avgActivity = avg(agentsDaily, 'hubActivity');
    return { totalCalls, totalSales, avgCph, avgAht, avgCompliance, avgActivity };
  }, [agentsDaily]);

  const callsTrend = useMemo(() => {
    return movingAverage(dailyTotals, 'totalCalls', 7);
  }, [dailyTotals]);

  return (
    <div>
      <PageHeader title="Executive Overview" subtitle="Key performance metrics across all agents" />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KpiCard
          title="Total Calls"
          value={formatCompact(kpis.totalCalls)}
          icon={Phone}
          subtitle={`${formatNumber(kpis.totalCalls)} total`}
        />
        <KpiCard
          title="Total Sales"
          value={formatCompact(kpis.totalSales)}
          icon={DollarSign}
        />
        <KpiCard
          title="Avg CPH"
          value={formatNumber(kpis.avgCph, 1)}
          icon={Headphones}
          subtitle="Calls per hour"
        />
        <KpiCard
          title="Avg AHT"
          value={formatDuration(kpis.avgAht)}
          icon={Clock}
          subtitle="Handle time"
        />
        <KpiCard
          title="Work Compliance"
          value={formatPercent(kpis.avgCompliance)}
          icon={CheckCircle}
        />
        <KpiCard
          title="Hub Activity"
          value={formatPercent(kpis.avgActivity)}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Daily Calls Trend" subtitle="Total calls with 7-day moving average">
          <TrendLineChart
            data={callsTrend}
            lines={[
              { dataKey: 'totalCalls', label: 'Total Calls', color: CALL_COLORS.inbound },
              { dataKey: 'totalCallsMA', label: '7-Day Avg', color: '#f59e0b', dashed: true },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Sales Breakdown" subtitle="Daily sales by type">
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
      </div>

      <ChartCard title="Team Performance Comparison" subtitle="Average metrics across teams">
        <TeamComparisonChart
          data={teamsSummary}
          bars={[
            { dataKey: 'avgCph', label: 'Avg CPH', color: '#6366f1' },
            { dataKey: 'avgAht', label: 'Avg AHT (÷10)', color: '#f59e0b' },
          ]}
          height={Math.max(200, teamsSummary.length * 50)}
        />
      </ChartCard>
    </div>
  );
}
