import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFilterStore from '../stores/useFilterStore';

export default function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialized = useRef(false);

  const dateRange = useFilterStore((s) => s.dateRange);
  const selectedTeams = useFilterStore((s) => s.selectedTeams);
  const selectedAgent = useFilterStore((s) => s.selectedAgent);
  const selectedLobs = useFilterStore((s) => s.selectedLobs);
  const setDateRange = useFilterStore((s) => s.setDateRange);
  const setSelectedTeams = useFilterStore((s) => s.setSelectedTeams);
  const setSelectedAgent = useFilterStore((s) => s.setSelectedAgent);
  const setSelectedLobs = useFilterStore((s) => s.setSelectedLobs);

  // On mount: read URL params → store
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const teams = searchParams.get('teams');
    const agent = searchParams.get('agent');
    const lobs = searchParams.get('lobs');

    if (from && to) setDateRange(from, to);
    if (teams) setSelectedTeams(teams.split(','));
    if (agent) setSelectedAgent(agent);
    if (lobs) setSelectedLobs(lobs.split(','));
  }, [searchParams, setDateRange, setSelectedTeams, setSelectedAgent, setSelectedLobs]);

  // On store change: write store → URL params
  useEffect(() => {
    if (!initialized.current) return;

    const params = new URLSearchParams();
    if (dateRange.start) params.set('from', dateRange.start);
    if (dateRange.end) params.set('to', dateRange.end);
    if (selectedTeams.length > 0) params.set('teams', selectedTeams.join(','));
    if (selectedAgent) params.set('agent', selectedAgent);
    if (selectedLobs.length > 0) params.set('lobs', selectedLobs.join(','));

    setSearchParams(params, { replace: true });
  }, [dateRange, selectedTeams, selectedAgent, selectedLobs, setSearchParams]);
}
