import { create } from "zustand";
import type { ProcessedRoute, DashboardFilters, BusRoute } from "./types";

interface DashboardState {
  rawRoutes: BusRoute[];
  routes: ProcessedRoute[];
  filteredRoutes: ProcessedRoute[];
  filters: Partial<DashboardFilters>;
  selectedRoute: ProcessedRoute | null;
  loading: boolean;
  error: string | null;

  setRawRoutes: (routes: BusRoute[]) => void;
  setRoutes: (routes: ProcessedRoute[]) => void;
  setFilteredRoutes: (routes: ProcessedRoute[]) => void;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setSelectedRoute: (route: ProcessedRoute | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  rawRoutes: [],
  routes: [],
  filteredRoutes: [],
  filters: {},
  selectedRoute: null,
  loading: false,
  error: null,

  setRawRoutes: (rawRoutes) => set({ rawRoutes }),
  setRoutes: (routes) => set({ routes, filteredRoutes: routes }),
  setFilteredRoutes: (filteredRoutes) => set({ filteredRoutes }),
  setFilters: (filters) => set({ filters }),
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetFilters: () => set({ filters: {}, filteredRoutes: [] }),
}));
