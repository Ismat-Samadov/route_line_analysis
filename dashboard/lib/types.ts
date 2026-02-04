export interface BusRoute {
  id: number;
  number: string;
  carrier: string;
  firstPoint: string;
  lastPoint: string;
  routLength: number;
  durationMinuts: number;
  tariff: number;
  tariffStr: string;
  region: {
    id: number;
    name: string;
  };
  paymentType: {
    id: number;
    name: string;
  };
  workingZoneType: {
    id: number;
    name: string;
  };
  stops: Stop[];
  routes: RouteVariant[];
}

export interface Stop {
  id: number;
  stopCode: string;
  stopName: string;
  totalDistance: number;
  intermediateDistance: number;
  directionTypeId: number;
  busId: number;
  stopId: number;
  stop: {
    id: number;
    code: string;
    name: string;
    nameMonitor: string;
    utmCoordX: string;
    utmCoordY: string;
    longitude: string;
    latitude: string;
    isTransportHub: boolean;
  };
}

export interface RouteVariant {
  id: number;
  code: string;
  customerName: string;
  type: number;
  name: string;
  destination: string;
  variant: number;
  operator: string;
  busId: number;
  directionTypeId: number;
  flowCoordinates: FlowCoordinate[];
}

export interface FlowCoordinate {
  lat: number;
  lon: number;
  sequence: number;
}

export interface ProcessedRoute extends BusRoute {
  avgSpeed: number;
  stopCount: number;
  stopDensity: number;
  avgDistanceBetweenStops: number;
  transportHubs: number;
  tariffAzn: number;
}

export interface DashboardFilters {
  carriers: string[];
  regions: string[];
  minSpeed?: number;
  maxSpeed?: number;
  minLength?: number;
  maxLength?: number;
  routeNumbers: string[];
  paymentTypes: string[];
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: string;
}
