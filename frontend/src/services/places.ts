import type { Place } from "@/types";
import { mockPlaces } from "@/mock";

// ---- Mapbox Search Box API ----

export interface MapboxSuggestion {
  mapboxId: string;
  name: string;
  fullAddress: string;
  placeFormatted: string;
  poiCategory: string[];
}

export interface MapboxRetrieved {
  name: string;
  fullAddress: string;
  lat: number;
  lng: number;
  category: string;
}

interface SuggestResponse {
  suggestions: Array<{
    name: string;
    mapbox_id: string;
    full_address?: string;
    place_formatted: string;
    poi_category?: string[];
  }>;
}

interface RetrieveResponse {
  features: Array<{
    properties: {
      name: string;
      full_address?: string;
      place_formatted?: string;
      coordinates: { latitude: number; longitude: number };
      poi_category?: string[];
    };
  }>;
}

function getToken(): string | null {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    console.warn("[Mapbox] VITE_MAPBOX_TOKEN is not set.");
    return null;
  }
  return token;
}

async function mapboxFetch(url: string, label: string): Promise<unknown | null> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error(`[Mapbox] Network error (${label}):`, err);
    return null;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable)");
    console.error(`[Mapbox] ${res.status} ${res.statusText} (${label}):`, body);
    return null;
  }
  return res.json();
}

export async function suggestMapboxPlaces(
  query: string,
  sessionToken: string,
  proximity?: { lat: number; lng: number }
): Promise<MapboxSuggestion[]> {
  const token = getToken();
  if (!token || !query.trim()) return [];

  const params = new URLSearchParams({
    q: query.trim(),
    session_token: sessionToken,
    access_token: token,
    limit: "8",
    country: "us",
    language: "en",
  });
  if (proximity) {
    params.set("proximity", `${proximity.lng},${proximity.lat}`);
  }

  console.debug(`[Mapbox] suggest "${query}"`);
  const data = await mapboxFetch(
    `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`,
    "suggest"
  ) as SuggestResponse | null;
  if (!data) return [];

  console.debug(`[Mapbox] ${data.suggestions.length} suggestion(s)`);
  return data.suggestions.map((s) => ({
    mapboxId: s.mapbox_id,
    name: s.name,
    fullAddress: s.full_address ?? s.place_formatted,
    placeFormatted: s.place_formatted,
    poiCategory: s.poi_category ?? [],
  }));
}

export async function retrieveMapboxPlace(
  mapboxId: string,
  sessionToken: string
): Promise<MapboxRetrieved | null> {
  const token = getToken();
  if (!token) return null;

  const params = new URLSearchParams({
    session_token: sessionToken,
    access_token: token,
  });

  console.debug(`[Mapbox] retrieve ${mapboxId}`);
  const data = await mapboxFetch(
    `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params}`,
    "retrieve"
  ) as RetrieveResponse | null;
  if (!data) return null;

  const feature = data.features[0];
  if (!feature) {
    console.warn("[Mapbox] retrieve returned no features");
    return null;
  }

  const p = feature.properties;
  return {
    name: p.name,
    fullAddress: p.full_address ?? p.place_formatted ?? "",
    lat: p.coordinates.latitude,
    lng: p.coordinates.longitude,
    category: p.poi_category?.[0] ?? "Place",
  };
}

let places = [...mockPlaces];

export async function getPlaces(): Promise<Place[]> {
  await delay();
  return places;
}

export function getPlaceById(id: string): Place | undefined {
  return places.find((p) => p.id === id);
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
