"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/lib/store";
import { processRouteData, applyFilters, calculateKPIs, getUniqueValues } from "@/lib/data-processor";
import KPICards from "@/components/dashboard/KPICards";
import InsightCards from "@/components/dashboard/InsightCards";
import FilterPanel from "@/components/dashboard/FilterPanel";
import RouteTable from "@/components/dashboard/RouteTable";
import SpeedDistributionChart from "@/components/charts/SpeedDistributionChart";
import TopCarriersChart from "@/components/charts/TopCarriersChart";
import RouteLengthChart from "@/components/charts/RouteLengthChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, X } from "lucide-react";
import type { ProcessedRoute } from "@/lib/types";

// Dynamic import for map to avoid SSR issues
const RouteMap = dynamic(() => import("@/components/map/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="animate-spin" size={40} />
    </div>
  ),
});

export default function Dashboard() {
  const {
    routes,
    filteredRoutes,
    filters,
    selectedRoute,
    loading,
    error,
    setRoutes,
    setFilteredRoutes,
    setFilters,
    setSelectedRoute,
    setLoading,
    setError,
    resetFilters,
  } = useDashboardStore();

  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await fetch("/data/bus_data.json");
        if (!response.ok) throw new Error("Failed to load data");

        const rawData = await response.json();
        const processed = processRouteData(rawData);
        setRoutes(processed);
        setFilteredRoutes(processed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setRoutes, setFilteredRoutes, setLoading, setError]);

  useEffect(() => {
    if (routes.length > 0) {
      const filtered = applyFilters(routes, filters);
      setFilteredRoutes(filtered);
    }
  }, [filters, routes, setFilteredRoutes]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    resetFilters();
    setFilteredRoutes(routes);
  };

  const handleRouteSelect = (route: ProcessedRoute) => {
    setSelectedRoute(selectedRoute?.id === route.id ? null : route);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Error loading data</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const kpis = calculateKPIs(filteredRoutes);
  const carriers = getUniqueValues(routes, "carrier");
  const regions = getUniqueValues(routes, "region");
  const paymentTypes = getUniqueValues(routes, "paymentType");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Bus Route Analytics
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                Baku Public Transport Network Intelligence
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 px-3 py-2 sm:px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition lg:hidden shadow-md"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <FilterPanel
              carriers={carriers}
              regions={regions}
              paymentTypes={paymentTypes}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* KPIs */}
            {kpis && <KPICards kpis={kpis} />}

            {/* Insights */}
            <InsightCards routes={filteredRoutes} allRoutes={routes} />

            {/* Selected Route Info */}
            {selectedRoute && (
              <Card className="bg-blue-50 border-blue-200 shadow-lg">
                <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2">
                  <CardTitle className="text-blue-900 text-lg sm:text-2xl">
                    Bus {selectedRoute.number}
                  </CardTitle>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition"
                    aria-label="Close selected route"
                  >
                    <X size={20} />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 text-xs mb-1">Route</span>
                      <span className="text-gray-900">{selectedRoute.firstPoint} → {selectedRoute.lastPoint}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 text-xs mb-1">Carrier</span>
                      <span className="text-gray-900 truncate">{selectedRoute.carrier}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 text-xs mb-1">Speed</span>
                      <span className="text-gray-900">{selectedRoute.avgSpeed.toFixed(1)} km/h</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-700 text-xs mb-1">Length</span>
                      <span className="text-gray-900">{selectedRoute.routLength} km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Route Network Map</CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {selectedRoute
                    ? `Showing route ${selectedRoute.number}. Click the route to deselect.`
                    : `Showing ${Math.min(filteredRoutes.length, 30)} routes. Click a route for details.`}
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] rounded-b-lg overflow-hidden">
                  <RouteMap
                    routes={filteredRoutes}
                    selectedRoute={selectedRoute}
                    onRouteClick={handleRouteSelect}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <SpeedDistributionChart routes={filteredRoutes} />
              <RouteLengthChart routes={filteredRoutes} />
            </div>

            <TopCarriersChart routes={filteredRoutes} />

            {/* Route Table */}
            <RouteTable routes={filteredRoutes} onRouteSelect={handleRouteSelect} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-8 sm:mt-12 py-4 sm:py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 text-center text-gray-600 text-xs sm:text-sm">
          <p className="font-semibold text-gray-900">Bus Route Analytics Dashboard</p>
          <p className="mt-2">208 Routes • 11,786 Stops • 7,745 km Network</p>
          <p className="mt-1 text-gray-500">Powered by Next.js, React, Leaflet & Recharts</p>
        </div>
      </div>
    </div>
  );
}
