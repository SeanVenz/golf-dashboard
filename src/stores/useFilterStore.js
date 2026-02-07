import { create } from 'zustand';

const useFilterStore = create((set) => ({
  dateRange: { start: null, end: null },
  selectedTeams: [],
  selectedAgent: null,
  selectedLobs: [],
  selectedRoles: [],
  includeUnknownTeam: false,

  availableTeams: [],
  availableLobs: [],
  availableAgents: [],
  availableRoles: [],
  dateExtent: { min: null, max: null },

  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  setSelectedTeams: (teams) => set({ selectedTeams: teams }),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
  setSelectedLobs: (lobs) => set({ selectedLobs: lobs }),
  setSelectedRoles: (roles) => set({ selectedRoles: roles }),
  setIncludeUnknownTeam: (val) => set({ includeUnknownTeam: val }),

  resetFilters: () =>
    set((state) => ({
      dateRange: { start: state.dateExtent.min, end: state.dateExtent.max },
      selectedTeams: [],
      selectedAgent: null,
      selectedLobs: [],
      selectedRoles: [],
    })),

  initializeFromData: (agentsDaily) => {
    const teams = [...new Set(agentsDaily.map((r) => r.team).filter(Boolean))].sort();
    const lobs = [...new Set(agentsDaily.map((r) => r.lob).filter((l) => l && l !== '-'))].sort();
    const agents = [...new Set(agentsDaily.map((r) => r.name).filter(Boolean))].sort();
    const roles = [...new Set(agentsDaily.map((r) => r.role).filter(Boolean))].sort();
    const dates = agentsDaily.map((r) => r.date).filter(Boolean).sort();

    set({
      availableTeams: teams,
      availableLobs: lobs,
      availableAgents: agents,
      availableRoles: roles,
      dateExtent: { min: dates[0], max: dates[dates.length - 1] },
      dateRange: { start: dates[0], end: dates[dates.length - 1] },
    });
  },
}));

export default useFilterStore;
