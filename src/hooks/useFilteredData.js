import { useMemo } from 'react';
import useFilterStore from '../stores/useFilterStore';
import agentsDailyRaw from '../data/agents-daily.json';
import { sum, avg, groupBy } from '../lib/metrics';

export default function useFilteredData() {
  const { dateRange, selectedTeams, selectedAgent, selectedLobs, selectedRoles, includeUnknownTeam } =
    useFilterStore();

  const agentsDaily = useMemo(() => {
    let data = agentsDailyRaw;

    if (dateRange.start) data = data.filter((r) => r.date >= dateRange.start);
    if (dateRange.end) data = data.filter((r) => r.date <= dateRange.end);
    if (selectedTeams.length > 0) data = data.filter((r) => selectedTeams.includes(r.team));
    if (!includeUnknownTeam && selectedTeams.length === 0) data = data.filter((r) => r.team && r.team !== '');
    if (selectedAgent) data = data.filter((r) => r.name === selectedAgent);
    if (selectedLobs.length > 0) data = data.filter((r) => selectedLobs.includes(r.lob));
    if (selectedRoles.length > 0) data = data.filter((r) => selectedRoles.includes(r.role));

    return data;
  }, [dateRange, selectedTeams, selectedAgent, selectedLobs, selectedRoles, includeUnknownTeam]);

  const agentsSummary = useMemo(() => {
    const grouped = groupBy(agentsDaily, 'name');
    return Object.entries(grouped)
      .map(([name, recs]) => ({
        name,
        team: recs[0]?.team || '',
        role: recs[0]?.role || '',
        lob: recs[0]?.lob || '',
        hireDate: recs[0]?.hireDate || null,
        daysWorked: recs.filter((r) => !r.status).length,
        totalCalls: sum(recs, 'totalCalls'),
        avgCph: Math.round(avg(recs, 'cph') * 100) / 100,
        avgAht: Math.round(avg(recs, 'aht') * 100) / 100,
        totalSales: sum(recs, 'totalSales'),
        salesProduct: sum(recs, 'salesProduct'),
        salesVip: sum(recs, 'salesVip'),
        salesCp: sum(recs, 'salesCp'),
        salesSc: sum(recs, 'salesSc'),
        salesGs: sum(recs, 'salesGs'),
        totalLobSales: sum(recs, 'lobSale'),
        avgDailyLobSale:
          Math.round(
            (recs.reduce((s, r) => s + r.lobSale, 0) / Math.max(recs.length, 1)) * 100
          ) / 100,
        avgWorkHrsCompliance: Math.round(avg(recs, 'workHrsCompliance') * 100) / 100,
        avgHubActivity: Math.round(avg(recs, 'hubActivity') * 100) / 100,
        totalRegularHours: Math.round(sum(recs, 'regularHours') * 100) / 100,
        avgPhoneTHub: Math.round(avg(recs, 'phoneTHub') * 100) / 100,
        ibCalls: sum(recs, 'ibCalls'),
        obCalls: sum(recs, 'obCalls'),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agentsDaily]);

  const teamsSummary = useMemo(() => {
    const grouped = groupBy(agentsDaily, 'team');
    return Object.entries(grouped)
      .filter(([team]) => team && team !== 'Unknown')
      .map(([team, recs]) => ({
        team,
        agentCount: new Set(recs.map((r) => r.name)).size,
        totalCalls: sum(recs, 'totalCalls'),
        avgCph: Math.round(avg(recs, 'cph') * 100) / 100,
        avgAht: Math.round(avg(recs, 'aht') * 100) / 100,
        totalSales: sum(recs, 'totalSales'),
        avgWorkHrsCompliance: Math.round(avg(recs, 'workHrsCompliance') * 100) / 100,
        avgHubActivity: Math.round(avg(recs, 'hubActivity') * 100) / 100,
      }))
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }, [agentsDaily]);

  const dailyTotals = useMemo(() => {
    const grouped = groupBy(agentsDaily, 'date');
    return Object.entries(grouped)
      .map(([date, recs]) => ({
        date,
        agentCount: new Set(recs.map((r) => r.name)).size,
        totalCalls: sum(recs, 'totalCalls'),
        ibCalls: sum(recs, 'ibCalls'),
        obCalls: sum(recs, 'obCalls'),
        totalSecDuration: sum(recs, 'totalSecDuration'),
        avgCph: Math.round(avg(recs, 'cph') * 100) / 100,
        avgAht: Math.round(avg(recs, 'aht') * 100) / 100,
        totalSales: sum(recs, 'totalSales'),
        salesProduct: sum(recs, 'salesProduct'),
        salesVip: sum(recs, 'salesVip'),
        salesCp: sum(recs, 'salesCp'),
        salesSc: sum(recs, 'salesSc'),
        salesGs: sum(recs, 'salesGs'),
        avgWorkHrsCompliance: Math.round(avg(recs, 'workHrsCompliance') * 100) / 100,
        avgHubActivity: Math.round(avg(recs, 'hubActivity') * 100) / 100,
        totalRegularHours: Math.round(sum(recs, 'regularHours') * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [agentsDaily]);

  return { agentsDaily, agentsSummary, teamsSummary, dailyTotals };
}
