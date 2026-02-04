"use client";

import { Card, CardContent } from "../ui/Card";
import { Bus, MapPin, TrendingUp, Users, DollarSign, Route } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  change?: string;
}

function KPICard({ label, value, icon, trend, change }: KPICardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm mt-2 ${
                trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KPICardsProps {
  kpis: {
    totalRoutes: number;
    totalDistance: string;
    avgSpeed: string;
    totalStops: number;
    avgLength: string;
    totalHubs: number;
    carriers: number;
    avgStopsPerRoute: string;
  };
}

export default function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Total Routes"
        value={kpis.totalRoutes}
        icon={<Bus size={24} />}
      />
      <KPICard
        label="Network Coverage"
        value={`${kpis.totalDistance} km`}
        icon={<Route size={24} />}
      />
      <KPICard
        label="Average Speed"
        value={`${kpis.avgSpeed} km/h`}
        icon={<TrendingUp size={24} />}
      />
      <KPICard
        label="Total Stops"
        value={kpis.totalStops}
        icon={<MapPin size={24} />}
      />
      <KPICard
        label="Average Route Length"
        value={`${kpis.avgLength} km`}
        icon={<Route size={24} />}
      />
      <KPICard
        label="Transport Hubs"
        value={kpis.totalHubs}
        icon={<MapPin size={24} />}
      />
      <KPICard
        label="Carriers"
        value={kpis.carriers}
        icon={<Users size={24} />}
      />
      <KPICard
        label="Avg Stops/Route"
        value={kpis.avgStopsPerRoute}
        icon={<MapPin size={24} />}
      />
    </div>
  );
}
