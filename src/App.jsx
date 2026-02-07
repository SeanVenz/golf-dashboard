import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import OverviewPage from './pages/OverviewPage';
import AgentPerformancePage from './pages/AgentPerformancePage';
import SalesAnalyticsPage from './pages/SalesAnalyticsPage';
import AttendancePage from './pages/AttendancePage';
import ProductivityPage from './pages/ProductivityPage';
import useFilterStore from './stores/useFilterStore';
import useUrlSync from './hooks/useUrlSync';
import agentsDailyRaw from './data/agents-daily.json';

export default function App() {
  const initializeFromData = useFilterStore((s) => s.initializeFromData);
  useUrlSync();

  useEffect(() => {
    initializeFromData(agentsDailyRaw);
  }, [initializeFromData]);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/agents" element={<AgentPerformancePage />} />
        <Route path="/sales" element={<SalesAnalyticsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/productivity" element={<ProductivityPage />} />
      </Routes>
    </AppShell>
  );
}
