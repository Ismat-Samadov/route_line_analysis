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
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-3 px-2">
                  <button
                    onClick={() => handleSort("number")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Route <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="pb-3 px-2">
                  <button
                    onClick={() => handleSort("carrier")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Carrier <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="pb-3 px-2">
                  <button
                    onClick={() => handleSort("avgSpeed")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Speed <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="pb-3 px-2">
                  <button
                    onClick={() => handleSort("routLength")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Length <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="pb-3 px-2">
                  <button
                    onClick={() => handleSort("stopCount")}
                    className="flex items-center gap-1 font-semibold text-gray-900 hover:text-blue-600"
                  >
                    Stops <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="pb-3 px-2 text-gray-900 font-semibold">Destination</th>
                <th className="pb-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRouteSelect(route)}
                >
                  <td className="py-3 px-2 font-semibold text-gray-900">Bus {route.number}</td>
                  <td className="py-3 px-2 text-gray-900 text-xs">{route.carrier.substring(0, 20)}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      route.avgSpeed >= 37 ? "bg-green-100 text-green-800" :
                      route.avgSpeed >= 36.5 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {route.avgSpeed.toFixed(1)} km/h
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-900">{route.routLength} km</td>
                  <td className="py-3 px-2 text-gray-900">{route.stopCount}</td>
                  <td className="py-3 px-2 text-gray-900 text-xs">
                    {route.firstPoint} → {route.lastPoint}
                  </td>
                  <td className="py-3 px-2">
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-900">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, routes.length)} of {routes.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
