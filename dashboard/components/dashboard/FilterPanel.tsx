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
  const [minSpeed, setMinSpeed] = useState<string>("");
  const [maxSpeed, setMaxSpeed] = useState<string>("");
  const [minLength, setMinLength] = useState<string>("");
  const [maxLength, setMaxLength] = useState<string>("");

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter size={20} />
          Filters
        </CardTitle>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <X size={16} />
          Reset
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
            <label className="text-sm font-semibold block mb-2 text-gray-900">Speed Range (km/h)</label>
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
            <label className="text-sm font-semibold block mb-2 text-gray-900">Route Length (km)</label>
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Apply Filters
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
