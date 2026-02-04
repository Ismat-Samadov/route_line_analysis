"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { getCarrierStats } from "@/lib/data-processor";
import type { ProcessedRoute } from "@/lib/types";

interface TopCarriersChartProps {
  routes: ProcessedRoute[];
}

export default function TopCarriersChart({ routes }: TopCarriersChartProps) {
  const carrierStats = getCarrierStats(routes).slice(0, 10);

  const data = carrierStats.map((carrier) => ({
    name: carrier.name.length > 15 ? carrier.name.substring(0, 15) + "..." : carrier.name,
    routes: carrier.routes,
    coverage: parseFloat(carrier.distance.toFixed(0)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Carriers</CardTitle>
        <CardDescription>Routes operated and network coverage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="routes" fill="#3b82f6" name="Routes" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
