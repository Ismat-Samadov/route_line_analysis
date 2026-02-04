"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Target } from "lucide-react";
import type { ProcessedRoute } from "@/lib/types";

interface InsightCardsProps {
  routes: ProcessedRoute[];
  allRoutes: ProcessedRoute[];
}

export default function InsightCards({ routes, allRoutes }: InsightCardsProps) {
  // Calculate insights
  const fastRoutes = routes.filter(r => r.avgSpeed >= 37).length;
  const slowRoutes = routes.filter(r => r.avgSpeed < 36.5).length;
  const longRoutes = routes.filter(r => r.routLength > 40).length;
  const highDensityRoutes = routes.filter(r => r.stopDensity > 2).length;

  const avgLength = routes.reduce((sum, r) => sum + r.routLength, 0) / routes.length;

  const efficiency = ((fastRoutes / routes.length) * 100).toFixed(1);
  const networkUtilization = ((routes.length / allRoutes.length) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Performance Insights */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            High Performance Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{fastRoutes}</p>
            <p className="text-sm text-gray-600">
              Routes with speed ≥37 km/h ({((fastRoutes / routes.length) * 100).toFixed(1)}%)
            </p>
            <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
              <TrendingUp size={16} />
              <span>Above target speed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Efficiency Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="text-blue-600" size={20} />
            Network Efficiency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{efficiency}%</p>
            <p className="text-sm text-gray-600">
              Overall speed efficiency rating
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues to Address */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Improvement Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{slowRoutes}</p>
            <p className="text-sm text-gray-600">
              Routes below 36.5 km/h ({((slowRoutes / routes.length) * 100).toFixed(1)}%)
            </p>
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <TrendingDown size={16} />
              <span>Need optimization</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Length Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Long Distance Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{longRoutes}</p>
            <p className="text-sm text-gray-600">
              Routes over 40 km ({((longRoutes / routes.length) * 100).toFixed(1)}%)
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Avg length: {avgLength.toFixed(1)} km
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stop Density Insights */}
      <Card className="bg-gradient-to-br from-yellow-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">High Density Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{highDensityRoutes}</p>
            <p className="text-sm text-gray-600">
              Routes with &gt;2 stops/km ({((highDensityRoutes / routes.length) * 100).toFixed(1)}%)
            </p>
            <p className="text-xs text-gray-500 mt-2">
              More stops = better accessibility
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Filter Status */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Active Filter View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">{routes.length}</p>
            <p className="text-sm text-gray-600">
              of {allRoutes.length} total routes displayed
            </p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${networkUtilization}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{networkUtilization}% of network</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
