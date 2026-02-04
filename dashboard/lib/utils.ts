import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals: number = 1): string {
  return num.toFixed(decimals);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export function getColorForValue(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min);
  if (ratio > 0.66) return "#22c55e"; // green
  if (ratio > 0.33) return "#eab308"; // yellow
  return "#ef4444"; // red
}
