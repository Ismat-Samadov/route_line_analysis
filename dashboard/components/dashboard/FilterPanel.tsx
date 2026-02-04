"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { X, Filter } from "lucide-react";
import type { DashboardFilters } from "@/lib/types";

interface FilterPanelProps {
  carriers: string[];
  regions: string[];
  paymentTypes: string[];
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  onReset: () => void;
}

export default function FilterPanel({
  carriers,
  regions,
  paymentTypes,
  onFilterChange,
  onReset,
}: FilterPanelProps) {
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [minSpeed, setMinSpeed] = useState<string>("36.0");
  const [maxSpeed, setMaxSpeed] = useState<string>("38.0");
  const [minLength, setMinLength] = useState<string>("10");
  const [maxLength, setMaxLength] = useState<string>("60");

  const handleApply = () => {
    onFilterChange({
      carriers: selectedCarriers.length > 0 ? selectedCarriers : undefined,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      minSpeed: minSpeed ? parseFloat(minSpeed) : undefined,
      maxSpeed: maxSpeed ? parseFloat(maxSpeed) : undefined,
      minLength: minLength ? parseFloat(minLength) : undefined,
      maxLength: maxLength ? parseFloat(maxLength) : undefined,
    });
  };

  const handleReset = () => {
    setSelectedCarriers([]);
    setSelectedRegions([]);
    setMinSpeed("");
    setMaxSpeed("");
    setMinLength("");
    setMaxLength("");
    onReset();
  };

  const toggleCarrier = (carrier: string) => {
    setSelectedCarriers((prev) =>
      prev.includes(carrier)
        ? prev.filter((c) => c !== carrier)
        : [...prev, carrier]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const applyQuickFilter = (type: string) => {
    switch (type) {
      case "fast":
        setMinSpeed("37");
        setMaxSpeed("40");
        break;
      case "slow":
        setMinSpeed("35");
        setMaxSpeed("36.5");
        break;
      case "long":
        setMinLength("40");
        setMaxLength("100");
        break;
      case "short":
        setMinLength("0");
        setMaxLength("20");
        break;
    }
  };

  return (
    <Card className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter size={20} />
          Filters
        </CardTitle>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold hover:underline transition"
        >
          <X size={16} />
          Reset All
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <label className="text-xs sm:text-sm font-semibold block mb-3 text-blue-900">Quick View</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { applyQuickFilter("fast"); handleApply(); }}
                className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-xs font-medium hover:bg-green-200 active:bg-green-300 transition"
              >
                Fast Routes
              </button>
              <button
                onClick={() => { applyQuickFilter("slow"); handleApply(); }}
                className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-xs font-medium hover:bg-red-200 active:bg-red-300 transition"
              >
                Slow Routes
              </button>
              <button
                onClick={() => { applyQuickFilter("long"); handleApply(); }}
                className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium hover:bg-purple-200 active:bg-purple-300 transition"
              >
                Long Distance
              </button>
              <button
                onClick={() => { applyQuickFilter("short"); handleApply(); }}
                className="px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium hover:bg-yellow-200 active:bg-yellow-300 transition"
              >
                Short Routes
              </button>
            </div>
          </div>

          <div className="border-t pt-3 space-y-4">
          {/* Carrier Filter */}
          <div>
            <label className="text-sm font-semibold block mb-2 text-gray-900">Top Carriers</label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {carriers.slice(0, 10).map((carrier) => (
                <label key={carrier} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCarriers.includes(carrier)}
                    onChange={() => toggleCarrier(carrier)}
                    className="rounded border-gray-300"
                  />
                  <span className="truncate">{carrier}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div>
            <label className="text-sm font-semibold block mb-2 text-gray-900">Region</label>
            <div className="space-y-1">
              {regions.map((region) => (
                <label key={region} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region)}
                    onChange={() => toggleRegion(region)}
                    className="rounded border-gray-300"
                  />
                  <span>{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Speed Range */}
          <div>
            <label className="text-sm font-semibold block mb-1 text-gray-900">Speed Range (km/h)</label>
            <p className="text-xs text-gray-500 mb-2">Target: 37+ km/h for optimal performance</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minSpeed}
                onChange={(e) => setMinSpeed(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxSpeed}
                onChange={(e) => setMaxSpeed(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
                step="0.1"
              />
            </div>
          </div>

          {/* Length Range */}
          <div>
            <label className="text-sm font-semibold block mb-1 text-gray-900">Route Length (km)</label>
            <p className="text-xs text-gray-500 mb-2">Average route: 37 km | Range: 10-95 km</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minLength}
                onChange={(e) => setMinLength(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-semibold shadow-md hover:shadow-lg text-sm"
          >
            Apply Filters
          </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
