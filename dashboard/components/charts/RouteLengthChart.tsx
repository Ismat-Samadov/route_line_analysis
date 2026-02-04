"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import type { ProcessedRoute } from "@/lib/types";

interface RouteLengthChartProps {
  routes: ProcessedRoute[];
}

export default function RouteLengthChart({ routes }: RouteLengthChartProps) {
  const categories = [
    { range: "0-10 km", min: 0, max: 10, count: 0 },
    { range: "10-20 km", min: 10, max: 20, count: 0 },
    { range: "20-30 km", min: 20, max: 30, count: 0 },
    { range: "30-40 km", min: 30, max: 40, count: 0 },
    { range: "40+ km", min: 40, max: 1000, count: 0 },
  ];

  routes.forEach((route) => {
    const length = route.routLength;
    for (const cat of categories) {
      if (length >= cat.min && length < cat.max) {
        cat.count++;
        break;
      }
    }
  });

  const data = categories.map((c) => ({
    name: c.range,
    routes: c.count,
    percentage: ((c.count / routes.length) * 100).toFixed(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Length Distribution</CardTitle>
        <CardDescription>Network design by route distance categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded shadow">
                    <p className="font-semibold">{payload[0].payload.name}</p>
                    <p className="text-sm">Routes: {payload[0].value}</p>
                    <p className="text-sm text-gray-600">{payload[0].payload.percentage}%</p>
                  </div>
                );
              }
              return null;
            }} />
            <Legend />
            <Bar dataKey="routes" fill="#16a085" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
