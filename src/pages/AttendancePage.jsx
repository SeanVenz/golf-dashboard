import { useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import KpiCard from '../components/shared/KpiCard';
import ChartCard from '../components/shared/ChartCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import DonutChart from '../components/charts/DonutChart';
import StackedAreaChart from '../components/charts/StackedAreaChart';
import DataTable from '../components/shared/DataTable';
import useFilteredData from '../hooks/useFilteredData';
import { formatNumber, formatPercent, formatShortDate } from '../lib/formatters';
import { groupBy } from '../lib/metrics';
import { createColumnHelper } from '@tanstack/react-table';
import { CalendarDays, Users, Clock, AlertTriangle } from 'lucide-react';

const col = createColumnHelper();

export default function AttendancePage() {
  const { agentsDaily, dailyTotals } = useFilteredData();

  const statusCounts = useMemo(() => {
    let working = 0, vl = 0, loa = 0, hol = 0;
    for (const r of agentsDaily) {
      if (!r.status) working++;
      else if (r.status === 'VL') vl++;
      else if (r.status === 'LOA') loa++;
      else if (r.status === 'Hol') hol++;
    }
    return { working, vl, loa, hol, total: working + vl + loa + hol };
  }, [agentsDaily]);

  const statusDonut = useMemo(() => [
    { name: 'Working', value: statusCounts.working },
    { name: 'Vacation (VL)', value: statusCounts.vl },
    { name: 'Leave (LOA)', value: statusCounts.loa },
    { name: 'Holiday', value: statusCounts.hol },
  ].filter(d => d.value > 0), [statusCounts]);

  const dailyAgentCounts = useMemo(() => {
    return dailyTotals.map((d) => ({ ...d, agents: d.agentCount }));
  }, [dailyTotals]);

  const teamDaily = useMemo(() => {
    const byDate = groupBy(agentsDaily.filter(r => r.team), 'date');
    return Object.entries(byDate)
      .map(([date, recs]) => {
        const teams = groupBy(recs, 'team');
        const row = { date };
        for (const [team, teamRecs] of Object.entries(teams)) {
          row[team] = new Set(teamRecs.map(r => r.name)).size;
        }
        return row;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [agentsDaily]);

  const allTeams = useMemo(() => {
    return [...new Set(agentsDaily.map(r => r.team).filter(Boolean))].sort();
  }, [agentsDaily]);

  const teamColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];

  const shiftData = useMemo(() => {
    const shifts = {};
    for (const r of agentsDaily) {
      if (r.scheduledHrs > 0) {
        const hrs = r.scheduledHrs;
        const bucket = hrs <= 4 ? '0-4h' : hrs <= 6 ? '4-6h' : hrs <= 8 ? '6-8h' : '8h+';
        shifts[bucket] = (shifts[bucket] || 0) + 1;
      }
    }
    return Object.entries(shifts).map(([name, value]) => ({ name, value }));
  }, [agentsDaily]);

  const columns = [
    col.accessor('date', { header: 'Date', cell: (info) => formatShortDate(info.getValue()) }),
    col.accessor('agentCount', { header: 'Agents' }),
    col.accessor('totalCalls', { header: 'Total Calls', cell: (info) => formatNumber(info.getValue()) }),
    col.accessor('totalRegularHours', { header: 'Total Hours', cell: (info) => formatNumber(info.getValue(), 1) }),
    col.accessor('avgWorkHrsCompliance', { header: 'Avg Compliance', cell: (info) => formatPercent(info.getValue()) }),
  ];

  return (
    <div>
      <PageHeader title="Attendance & Scheduling" subtitle="Workforce management and coverage" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Total Agent-Days"
          value={formatNumber(statusCounts.total)}
          icon={CalendarDays}
        />
        <KpiCard
          title="Working Days"
          value={formatPercent(statusCounts.total > 0 ? statusCounts.working / statusCounts.total : 0)}
          icon={Users}
          subtitle={`${formatNumber(statusCounts.working)} days`}
        />
        <KpiCard
          title="Avg Compliance"
          value={formatPercent(dailyTotals.length > 0 ? dailyTotals.reduce((s, d) => s + d.avgWorkHrsCompliance, 0) / dailyTotals.length : 0)}
          icon={Clock}
        />
        <KpiCard
          title="Leave Days"
          value={formatNumber(statusCounts.vl + statusCounts.loa)}
          icon={AlertTriangle}
          subtitle={`VL: ${statusCounts.vl} | LOA: ${statusCounts.loa}`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Status Breakdown" subtitle="Agent-day distribution by status">
          <DonutChart
            data={statusDonut}
            colors={['#22c55e', '#f59e0b', '#ef4444', '#3b82f6']}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Daily Agent Count" subtitle="Active agents per day">
          <TrendLineChart
            data={dailyAgentCounts}
            lines={[{ dataKey: 'agents', label: 'Active Agents', color: '#6366f1' }]}
            height={280}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Team Headcount Over Time" subtitle="Agents per team per day">
          <StackedAreaChart
            data={teamDaily}
            areas={allTeams.map((team, i) => ({
              dataKey: team,
              label: team,
              color: teamColors[i % teamColors.length],
            }))}
            height={280}
          />
        </ChartCard>

        <ChartCard title="Shift Distribution" subtitle="Scheduled hours breakdown">
          <DonutChart
            data={shiftData}
            colors={['#6366f1', '#3b82f6', '#10b981', '#f59e0b']}
            height={280}
          />
        </ChartCard>
      </div>

      <ChartCard title="Daily Attendance Details">
        <DataTable columns={columns} data={dailyTotals} pageSize={10} />
      </ChartCard>
    </div>
  );
}
