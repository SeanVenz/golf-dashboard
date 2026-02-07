import { useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import KpiCard from '../components/shared/KpiCard';
import ChartCard from '../components/shared/ChartCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import ScatterChart from '../components/charts/ScatterChart';
import BarRankChart from '../components/charts/BarRankChart';
import DataTable from '../components/shared/DataTable';
import useFilteredData from '../hooks/useFilteredData';
import { formatNumber, formatPercent } from '../lib/formatters';
import { avg, sum } from '../lib/metrics';
import { createColumnHelper } from '@tanstack/react-table';
import { Activity, Clock, Zap, AlertCircle } from 'lucide-react';

const col = createColumnHelper();

const lowActivityColumns = [
  col.accessor('name', { header: 'Agent', cell: (info) => <span className="font-medium text-slate-200">{info.getValue()}</span> }),
  col.accessor('team', { header: 'Team' }),
  col.accessor('avgHubActivity', { header: 'Avg Activity', cell: (info) => formatPercent(info.getValue()) }),
  col.accessor('totalRegularHours', { header: 'Total Hours', cell: (info) => formatNumber(info.getValue(), 1) }),
  col.accessor('avgCph', { header: 'Avg CPH', cell: (info) => formatNumber(info.getValue(), 1) }),
];

export default function ProductivityPage() {
  const { agentsDaily, agentsSummary, dailyTotals } = useFilteredData();

  const kpis = useMemo(() => {
    const avgActivity = avg(agentsDaily, 'hubActivity');
    const avgHours = avg(agentsDaily.filter(r => r.regularHours > 0), 'regularHours');
    const avgCompliance = avg(agentsDaily, 'workHrsCompliance');
    const avgPhoneTHub = avg(agentsDaily.filter(r => r.phoneTHub > 0), 'phoneTHub');
    return { avgActivity, avgHours, avgCompliance, avgPhoneTHub };
  }, [agentsDaily]);

  const scatterData = useMemo(() => {
    return agentsSummary
      .filter((a) => a.avgHubActivity > 0 && a.avgCph > 0)
      .map((a) => ({
        name: a.name,
        hubActivity: Math.round(a.avgHubActivity * 100),
        cph: a.avgCph,
      }));
  }, [agentsSummary]);

  const activityRank = useMemo(() => {
    return agentsSummary
      .filter((a) => a.avgHubActivity > 0)
      .map((a) => ({ name: a.name, value: Math.round(a.avgHubActivity * 100) }));
  }, [agentsSummary]);

  const lowActivityAgents = useMemo(() => {
    return agentsSummary
      .filter((a) => a.avgHubActivity > 0 && a.avgHubActivity < 0.5)
      .sort((a, b) => a.avgHubActivity - b.avgHubActivity);
  }, [agentsSummary]);

  const activityTrend = useMemo(() => {
    return dailyTotals.map((d) => ({
      ...d,
      avgActivityPct: Math.round(d.avgHubActivity * 100),
    }));
  }, [dailyTotals]);

  return (
    <div>
      <PageHeader title="Productivity / Hubstaff" subtitle="Activity tracking and time efficiency" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Avg Activity"
          value={formatPercent(kpis.avgActivity)}
          icon={Activity}
          subtitle="Mouse/keyboard activity"
        />
        <KpiCard
          title="Avg Login Hours"
          value={formatNumber(kpis.avgHours, 1)}
          icon={Clock}
          subtitle="Per agent per day"
        />
        <KpiCard
          title="Avg Compliance"
          value={formatPercent(kpis.avgCompliance)}
          icon={Zap}
        />
        <KpiCard
          title="Phone/Hub Ratio"
          value={formatPercent(kpis.avgPhoneTHub)}
          icon={AlertCircle}
          subtitle="Phone time vs logged time"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Activity vs CPH" subtitle="Each dot = one agent">
          <ScatterChart
            data={scatterData}
            xKey="hubActivity"
            yKey="cph"
            xLabel="Hub Activity %"
            yLabel="Calls Per Hour"
            color="#6366f1"
            height={300}
          />
        </ChartCard>

        <ChartCard title="Daily Avg Activity" subtitle="Average hub activity over time">
          <TrendLineChart
            data={activityTrend}
            lines={[{ dataKey: 'avgActivityPct', label: 'Activity %', color: '#10b981' }]}
            height={300}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Top Agents by Activity" subtitle="Highest hub activity percentage">
          <BarRankChart data={activityRank} color="#10b981" height={350} limit={15} />
        </ChartCard>

        <ChartCard title="Login Hours Trend" subtitle="Average daily login hours">
          <TrendLineChart
            data={dailyTotals}
            lines={[{ dataKey: 'totalRegularHours', label: 'Total Hours', color: '#3b82f6' }]}
            height={350}
          />
        </ChartCard>
      </div>

      {lowActivityAgents.length > 0 && (
        <ChartCard title="Low Activity Alerts" subtitle="Agents with avg activity below 50%">
          <DataTable columns={lowActivityColumns} data={lowActivityAgents} pageSize={10} />
        </ChartCard>
      )}
    </div>
  );
}
