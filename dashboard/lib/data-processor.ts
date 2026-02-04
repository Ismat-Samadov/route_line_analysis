import type { BusRoute, ProcessedRoute, DashboardFilters } from "./types";

export function processRouteData(routes: BusRoute[]): ProcessedRoute[] {
  return routes
    .filter((route) => route.routLength && route.durationMinuts)
    .map((route) => ({
      ...route,
      avgSpeed: (route.routLength / route.durationMinuts) * 60,
      stopCount: route.stops?.length || 0,
      stopDensity: route.routLength ? (route.stops?.length || 0) / route.routLength : 0,
      avgDistanceBetweenStops:
        route.stops?.length ? route.routLength / route.stops.length : 0,
      transportHubs: route.stops?.filter((s) => s.stop?.isTransportHub).length || 0,
      tariffAzn: route.tariff / 100,
    }));
}

export function applyFilters(
  routes: ProcessedRoute[],
  filters: Partial<DashboardFilters>
): ProcessedRoute[] {
  let filtered = [...routes];

  if (filters.carriers?.length) {
    filtered = filtered.filter((r) => filters.carriers!.includes(r.carrier));
  }

  if (filters.regions?.length) {
    filtered = filtered.filter((r) => filters.regions!.includes(r.region?.name));
  }

  if (filters.minSpeed !== undefined) {
    filtered = filtered.filter((r) => r.avgSpeed >= filters.minSpeed!);
  }

  if (filters.maxSpeed !== undefined) {
    filtered = filtered.filter((r) => r.avgSpeed <= filters.maxSpeed!);
  }

  if (filters.minLength !== undefined) {
    filtered = filtered.filter((r) => r.routLength >= filters.minLength!);
  }

  if (filters.maxLength !== undefined) {
    filtered = filtered.filter((r) => r.routLength <= filters.maxLength!);
  }

  if (filters.routeNumbers?.length) {
    filtered = filtered.filter((r) => filters.routeNumbers!.includes(r.number));
  }

  if (filters.paymentTypes?.length) {
    filtered = filtered.filter((r) => filters.paymentTypes!.includes(r.paymentType?.name));
  }

  return filtered;
}

export function getUniqueValues(routes: ProcessedRoute[], field: keyof ProcessedRoute): string[] {
  const values = new Set<string>();
  routes.forEach((route) => {
    const value = route[field];
    if (typeof value === "string") {
      values.add(value);
    } else if (value && typeof value === "object" && "name" in value) {
      values.add((value as any).name);
    }
  });
  return Array.from(values).sort();
}

export function calculateKPIs(routes: ProcessedRoute[]) {
  if (routes.length === 0) return null;

  const totalRoutes = routes.length;
  const totalDistance = routes.reduce((sum, r) => sum + r.routLength, 0);
  const totalStops = routes.reduce((sum, r) => sum + r.stopCount, 0);
  const avgSpeed = routes.reduce((sum, r) => sum + r.avgSpeed, 0) / totalRoutes;
  const avgLength = totalDistance / totalRoutes;
  const totalHubs = routes.reduce((sum, r) => sum + r.transportHubs, 0);
  const carriers = new Set(routes.map((r) => r.carrier)).size;

  return {
    totalRoutes,
    totalDistance: totalDistance.toFixed(1),
    avgSpeed: avgSpeed.toFixed(1),
    totalStops,
    avgLength: avgLength.toFixed(1),
    totalHubs,
    carriers,
    avgStopsPerRoute: (totalStops / totalRoutes).toFixed(1),
  };
}

export function getTopRoutes(routes: ProcessedRoute[], field: keyof ProcessedRoute, limit: number = 10) {
  return [...routes].sort((a, b) => {
    const aVal = typeof a[field] === "number" ? a[field] as number : 0;
    const bVal = typeof b[field] === "number" ? b[field] as number : 0;
    return bVal - aVal;
  }).slice(0, limit);
}

export function getCarrierStats(routes: ProcessedRoute[]) {
  const carrierMap = new Map<string, {
    routes: number;
    distance: number;
    avgSpeed: number;
  }>();

  routes.forEach((route) => {
    const carrier = route.carrier;
    const existing = carrierMap.get(carrier) || { routes: 0, distance: 0, avgSpeed: 0 };
    carrierMap.set(carrier, {
      routes: existing.routes + 1,
      distance: existing.distance + route.routLength,
      avgSpeed: existing.avgSpeed + route.avgSpeed,
    });
  });

  return Array.from(carrierMap.entries())
    .map(([name, stats]) => ({
      name,
      routes: stats.routes,
      distance: stats.distance,
      avgSpeed: stats.avgSpeed / stats.routes,
    }))
    .sort((a, b) => b.routes - a.routes);
}
