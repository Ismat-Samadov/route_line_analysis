"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import type { ProcessedRoute } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";

interface RouteTableProps {
  routes: ProcessedRoute[];
  onRouteSelect: (route: ProcessedRoute) => void;
}

type SortField = "number" | "avgSpeed" | "routLength" | "stopCount" | "carrier";
type SortDirection = "asc" | "desc";

export default function RouteTable({ routes, onRouteSelect }: RouteTableProps) {
  const [sortField, setSortField] = useState<SortField>("number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRoutes = [...routes].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    const comparison = typeof aVal === "string"
      ? aVal.localeCompare(bVal as string)
      : (aVal as number) - (bVal as number);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoutes = sortedRoutes.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Details ({routes.length} routes)</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Click on any route to view it on the map
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-3 px-3 sm:px-4">
                  <button
                    onClick={() => handleSort("number")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600 transition"
                  >
                    Route <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <button
                    onClick={() => handleSort("carrier")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600 transition"
                  >
                    Carrier <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <button
                    onClick={() => handleSort("avgSpeed")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600 transition"
                  >
                    Speed <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <button
                    onClick={() => handleSort("routLength")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600 transition"
                  >
                    Length <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-3 sm:px-4">
                  <button
                    onClick={() => handleSort("stopCount")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600 transition"
                  >
                    Stops <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-3 sm:px-4 text-gray-900 font-semibold">Destination</th>
                <th className="py-3 px-3 sm:px-4"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => onRouteSelect(route)}
                >
                  <td className="py-4 px-3 sm:px-4 font-semibold text-gray-900 whitespace-nowrap">
                    Bus {route.number}
                  </td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 text-xs">
                    <span className="block truncate max-w-[150px] sm:max-w-none">
                      {route.carrier.substring(0, 20)}
                    </span>
                  </td>
                  <td className="py-4 px-3 sm:px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      route.avgSpeed >= 37 ? "bg-green-100 text-green-800" :
                      route.avgSpeed >= 36.5 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {route.avgSpeed.toFixed(1)} km/h
                    </span>
                  </td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">
                    {route.routLength} km
                  </td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">
                    {route.stopCount}
                  </td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 text-xs max-w-[200px]">
                    <span className="block truncate">
                      {route.firstPoint} → {route.lastPoint}
                    </span>
                  </td>
                  <td className="py-4 px-3 sm:px-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
          <div className="text-sm text-gray-900">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, routes.length)} of {routes.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-900 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 active:bg-gray-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
