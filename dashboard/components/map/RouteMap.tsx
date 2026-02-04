"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import type { ProcessedRoute } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const BAKU_CENTER: [number, number] = [40.4093, 49.8671];

interface RouteMapProps {
  routes: ProcessedRoute[];
  selectedRoute: ProcessedRoute | null;
  onRouteClick?: (route: ProcessedRoute) => void;
}

function MapUpdater({ routes }: { routes: ProcessedRoute[] }) {
  const map = useMap();

  useEffect(() => {
    if (routes.length > 0) {
      // Calculate bounds of all routes
      const bounds: [number, number][] = [];
      routes.forEach((route) => {
        route.stops?.forEach((stop) => {
          const lat = parseFloat(stop.stop?.latitude || "0");
          const lon = parseFloat(stop.stop?.longitude || "0");
          if (lat && lon && !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
            bounds.push([lat, lon]);
          }
        });

        // Also add flowCoordinates to bounds
        route.routes?.forEach((variant) => {
          variant.flowCoordinates?.forEach((coord) => {
            if (coord && coord.lat && coord.lon && !isNaN(coord.lat) && !isNaN(coord.lon)) {
              bounds.push([coord.lat, coord.lon]);
            }
          });
        });
      });

      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
      }
    }
  }, [routes, map]);

  return null;
}

export default function RouteMap({ routes, selectedRoute, onRouteClick }: RouteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  const displayRoutes = selectedRoute ? [selectedRoute] : routes;

  return (
    <MapContainer
      center={BAKU_CENTER}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater routes={displayRoutes} />

      {displayRoutes.map((route) => {
        // Draw route polylines from flowCoordinates
        const routeLines = route.routes?.map((variant, idx) => {
          if (!variant.flowCoordinates || variant.flowCoordinates.length === 0) return null;

          const coordinates: [number, number][] = variant.flowCoordinates
            .filter((coord) => coord && coord.lat && coord.lon && !isNaN(coord.lat) && !isNaN(coord.lon))
            .map((coord) => [coord.lat, coord.lon]);

          // Skip if no valid coordinates
          if (coordinates.length === 0) return null;

          const color = selectedRoute ? "#3b82f6" : getColorBySpeed(route.avgSpeed);

          return (
            <Polyline
              key={`${route.id}-${idx}`}
              positions={coordinates}
              pathOptions={{
                color,
                weight: selectedRoute ? 5 : 3,
                opacity: selectedRoute ? 0.9 : 0.6,
              }}
              eventHandlers={{
                click: () => onRouteClick?.(route),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-lg">Bus {route.number}</h3>
                  <p className="text-sm text-gray-600">{route.firstPoint} → {route.lastPoint}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="font-semibold">Speed:</span> {route.avgSpeed.toFixed(1)} km/h</p>
                    <p><span className="font-semibold">Length:</span> {route.routLength} km</p>
                    <p><span className="font-semibold">Stops:</span> {route.stopCount}</p>
                    <p><span className="font-semibold">Carrier:</span> {route.carrier}</p>
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        });

        // Draw stops as markers (only for selected route to avoid clutter)
        const stopMarkers = selectedRoute && route.stops?.map((stop) => {
          const lat = parseFloat(stop.stop?.latitude || "0");
          const lon = parseFloat(stop.stop?.longitude || "0");

          if (!lat || !lon || isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) return null;

          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${stop.stop?.isTransportHub ? "#ef4444" : "#3b82f6"}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          return (
            <Marker key={stop.id} position={[lat, lon]} icon={icon}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-semibold">{stop.stop?.name}</h4>
                  <p className="text-xs text-gray-600">
                    {stop.totalDistance.toFixed(1)} km from start
                  </p>
                  {stop.stop?.isTransportHub && (
                    <p className="text-xs text-red-600 font-semibold mt-1">Transport Hub</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        });

        return (
          <div key={route.id}>
            {routeLines}
            {stopMarkers}
          </div>
        );
      })}
    </MapContainer>
  );
}

function getColorBySpeed(speed: number): string {
  if (speed >= 37) return "#22c55e"; // Green - fast
  if (speed >= 36.5) return "#eab308"; // Yellow - medium
  return "#ef4444"; // Red - slow
}
