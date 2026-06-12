import type { Place } from "@/types";
import { mockPlaces } from "@/mock";

// ---- Mapbox Geocoding ----

export interface MapboxCandidate {
  mapboxId: string;
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  category: string;
}

interface MapboxGeocodingResponse {
  features: Array<{
    id: string;
    text: string;
    place_name: string;
    geometry: { coordinates: [number, number] };
    properties?: { category?: string };
  }>;
}

export async function searchMapboxPlaces(
  query: string,
  proximity?: { lat: number; lng: number }
): Promise<MapboxCandidate[]> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  if (!token) {
    console.warn("[Mapbox] VITE_MAPBOX_TOKEN is not set — geocoding disabled.");
    return [];
  }
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    access_token: token,
    types: "poi",
    limit: "8",
    country: "us",
    language: "en",
  });
  if (proximity) {
    params.set("proximity", `${proximity.lng},${proximity.lat}`);
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?${params}`;
  console.debug("[Mapbox] GET", url.replace(token, "pk.***"));

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error("[Mapbox] Network error:", err);
    return [];
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[Mapbox] ${res.status} ${res.statusText}:`, body);
    return [];
  }

  const data = (await res.json()) as MapboxGeocodingResponse;
  console.debug(`[Mapbox] ${data.features.length} result(s) for "${query}"`);

  return data.features.map((f) => ({
    mapboxId: f.id,
    name: f.text,
    fullAddress: f.place_name,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    category: f.properties?.category?.split(",")[0]?.trim() ?? "Place",
  }));
}

let places = [...mockPlaces];

export async function getPlaces(): Promise<Place[]> {
  await delay();
  return places;
}

export async function getPlace(id: string): Promise<Place | undefined> {
  await delay();
  return places.find((p) => p.id === id);
}

export async function searchPlaces(query: string): Promise<Place[]> {
  await delay();
  const q = query.toLowerCase();
  return places.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

export async function createPlace(
  data: Omit<Place, "id" | "createdAt" | "updatedAt">
): Promise<Place> {
  await delay();
  const place: Place = {
    ...data,
    id: `place-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  places = [...places, place];
  return place;
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
