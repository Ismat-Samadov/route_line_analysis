"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import type { ProcessedRoute } from "@/lib/types";

interface SpeedDistributionChartProps {
  routes: ProcessedRoute[];
}

export default function SpeedDistributionChart({ routes }: SpeedDistributionChartProps) {
  // Group routes by speed ranges
  const speedRanges = [
    { range: "36.0-36.5", min: 36.0, max: 36.5, count: 0 },
    { range: "36.5-37.0", min: 36.5, max: 37.0, count: 0 },
    { range: "37.0-37.5", min: 37.0, max: 37.5, count: 0 },
    { range: "37.5-38.0", min: 37.5, max: 38.0, count: 0 },
    { range: "38.0+", min: 38.0, max: 100, count: 0 },
  ];

  routes.forEach((route) => {
    const speed = route.avgSpeed;
    for (const range of speedRanges) {
      if (speed >= range.min && speed < range.max) {
        range.count++;
        break;
      }
    }
  });

  const data = speedRanges.map((r) => ({
    name: r.range + " km/h",
    routes: r.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speed Distribution</CardTitle>
        <CardDescription>Route count by average speed ranges</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="routes" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
