"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDashboardStore } from "@/lib/store";
import { processRouteData, applyFilters, calculateKPIs, getUniqueValues } from "@/lib/data-processor";
import KPICards from "@/components/dashboard/KPICards";
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
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bus Route Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Baku Public Transport Network Intelligence</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition lg:hidden"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
          <div className="lg:col-span-3 space-y-6">
            {/* KPIs */}
            {kpis && <KPICards kpis={kpis} />}

            {/* Selected Route Info */}
            {selectedRoute && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-blue-900">
                    Selected: Bus {selectedRoute.number}
                  </CardTitle>
                  <button
                    onClick={() => setSelectedRoute(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={20} />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-900">
                    <div>
                      <span className="font-semibold">Route:</span> {selectedRoute.firstPoint} → {selectedRoute.lastPoint}
                    </div>
                    <div>
                      <span className="font-semibold">Carrier:</span> {selectedRoute.carrier}
                    </div>
                    <div>
                      <span className="font-semibold">Speed:</span> {selectedRoute.avgSpeed.toFixed(1)} km/h
                    </div>
                    <div>
                      <span className="font-semibold">Length:</span> {selectedRoute.routLength} km
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Route Network Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] rounded-b-lg overflow-hidden">
                  <RouteMap
                    routes={filteredRoutes}
                    selectedRoute={selectedRoute}
                    onRouteClick={handleRouteSelect}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      <div className="bg-white border-t mt-12 py-6">
        <div className="max-w-full mx-auto px-6 text-center text-gray-600 text-sm">
          <p>Bus Route Analytics Dashboard | Data: 208 Routes, 11,786 Stops, 7,745 km Network</p>
          <p className="mt-1">Powered by Next.js, React, Leaflet & Recharts</p>
        </div>
      </div>
    </div>
  );
}
