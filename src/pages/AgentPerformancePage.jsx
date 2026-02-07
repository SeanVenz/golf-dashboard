import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { X } from 'lucide-react';
import PageHeader from '../components/shared/PageHeader';
import DataTable from '../components/shared/DataTable';
import ChartCard from '../components/shared/ChartCard';
import KpiCard from '../components/shared/KpiCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import DonutChart from '../components/charts/DonutChart';
import useFilteredData from '../hooks/useFilteredData';
import { formatNumber, formatDuration, formatPercent } from '../lib/formatters';
import { CALL_COLORS, SALE_COLORS } from '../lib/constants';

const col = createColumnHelper();

const columns = [
  col.accessor('name', { header: 'Name', cell: (info) => <span className="font-medium text-slate-200">{info.getValue()}</span> }),
  col.accessor('team', { header: 'Team' }),
  col.accessor('lob', { header: 'LOB' }),
  col.accessor('totalCalls', { header: 'Calls', cell: (info) => formatNumber(info.getValue()) }),
  col.accessor('avgCph', { header: 'CPH', cell: (info) => formatNumber(info.getValue(), 1) }),
  col.accessor('avgAht', { header: 'AHT', cell: (info) => formatDuration(info.getValue()) }),
  col.accessor('totalSales', { header: 'Sales', cell: (info) => formatNumber(info.getValue()) }),
  col.accessor('totalLobSales', { header: 'LOB Sales', cell: (info) => formatNumber(info.getValue()) }),
  col.accessor('avgWorkHrsCompliance', { header: 'Compliance', cell: (info) => formatPercent(info.getValue()) }),
  col.accessor('avgHubActivity', { header: 'Activity', cell: (info) => formatPercent(info.getValue()) }),
  col.accessor('daysWorked', { header: 'Days' }),
];

export default function AgentPerformancePage() {
  const { agentsSummary, agentsDaily } = useFilteredData();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const agentDetail = useMemo(() => {
    if (!selectedAgent) return null;
    const daily = agentsDaily
      .filter((r) => r.name === selectedAgent.name)
      .sort((a, b) => a.date.localeCompare(b.date));
    const summary = selectedAgent;
    return { daily, summary };
  }, [selectedAgent, agentsDaily]);

  const callSplit = useMemo(() => {
    if (!selectedAgent) return [];
    return [
      { name: 'Inbound', value: selectedAgent.ibCalls },
      { name: 'Outbound', value: selectedAgent.obCalls },
    ];
  }, [selectedAgent]);

  const salesSplit = useMemo(() => {
    if (!selectedAgent) return [];
    return [
      { name: 'CP', value: selectedAgent.salesCp },
      { name: 'VIP', value: selectedAgent.salesVip },
      { name: 'Product', value: selectedAgent.salesProduct },
      { name: 'SC', value: selectedAgent.salesSc },
      { name: 'GS', value: selectedAgent.salesGs },
    ].filter((s) => s.value > 0);
  }, [selectedAgent]);

  return (
    <div>
      <PageHeader title="Agent Performance" subtitle="Individual agent metrics and rankings" />

      <div className={`grid gap-4 ${selectedAgent ? 'grid-cols-1 xl:grid-cols-3' : 'grid-cols-1'}`}>
        <div className={selectedAgent ? 'xl:col-span-2' : ''}>
          <DataTable columns={columns} data={agentsSummary} onRowClick={setSelectedAgent} pageSize={20} />
        </div>

        {selectedAgent && agentDetail && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">
                    {selectedAgent.team} &middot; {selectedAgent.role} &middot; {selectedAgent.lob}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <KpiCard title="Total Calls" value={formatNumber(selectedAgent.totalCalls)} />
                <KpiCard title="Avg CPH" value={formatNumber(selectedAgent.avgCph, 1)} />
                <KpiCard title="Avg AHT" value={formatDuration(selectedAgent.avgAht)} />
                <KpiCard title="Total Sales" value={formatNumber(selectedAgent.totalSales)} />
              </div>
            </div>

            <ChartCard title="Daily Trends">
              <TrendLineChart
                data={agentDetail.daily}
                lines={[
                  { dataKey: 'cph', label: 'CPH', color: '#6366f1' },
                  { dataKey: 'totalCalls', label: 'Calls', color: '#3b82f6' },
                ]}
                height={200}
              />
            </ChartCard>

            <div className="grid grid-cols-2 gap-4">
              {callSplit.some((s) => s.value > 0) && (
                <ChartCard title="IB/OB Split">
                  <DonutChart
                    data={callSplit}
                    colors={[CALL_COLORS.inbound, CALL_COLORS.outbound]}
                    height={180}
                  />
                </ChartCard>
              )}
              {salesSplit.length > 0 && (
                <ChartCard title="Sales Split">
                  <DonutChart
                    data={salesSplit}
                    colors={[SALE_COLORS.cp, SALE_COLORS.vip, SALE_COLORS.product, SALE_COLORS.sc, SALE_COLORS.gs]}
                    height={180}
                  />
                </ChartCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
