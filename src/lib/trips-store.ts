import type { SavedTrip } from "./trip-types";

const KEY = "safar-saathi:trips";

export function loadTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrip(trip: SavedTrip) {
  const all = loadTrips();
  const existing = all.findIndex((t) => t.id === trip.id);
  if (existing >= 0) all[existing] = trip;
  else all.unshift(trip);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function getTrip(id: string): SavedTrip | undefined {
  return loadTrips().find((t) => t.id === id);
}

export function deleteTrip(id: string) {
  const all = loadTrips().filter((t) => t.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}