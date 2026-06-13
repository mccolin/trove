import { useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveTarget } from "@/services/listItems";
import { getPlaceById } from "@/services/places";
import type { ListItem, Place, Occurrence } from "@/types";

interface Pin {
  id: string;
  lat: number;
  lng: number;
  item: ListItem;
}

interface ListMapProps {
  items: ListItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  mapCenter: { lat: number; lng: number };
  defaultZoom: number;
}

function getItemCoords(item: ListItem): { lat: number; lng: number } | null {
  if (item.targetType === "place") {
    const place = resolveTarget(item) as Place | undefined;
    if (place) return { lat: place.lat, lng: place.lng };
  }
  if (item.targetType === "occurrence") {
    const occ = resolveTarget(item) as Occurrence | undefined;
    if (occ) {
      const place = getPlaceById(occ.placeId);
      if (place) return { lat: place.lat, lng: place.lng };
    }
  }
  return null;
}

const MAPBOX_TOKEN: string | undefined = import.meta.env.VITE_MAPBOX_TOKEN || undefined;

export function ListMap({
  items,
  selectedItemId,
  onSelectItem,
  mapCenter,
  defaultZoom,
}: ListMapProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    mapRef.current?.flyTo({
      center: [mapCenter.lng, mapCenter.lat],
      zoom: defaultZoom,
      duration: 1200,
    });
  }, [mapCenter.lat, mapCenter.lng, defaultZoom]);

  const pins: Pin[] = items
    .map((item) => {
      const coords = getItemCoords(item);
      if (!coords) return null;
      return { id: item.id, ...coords, item };
    })
    .filter((p): p is Pin => p !== null);

  useEffect(() => {
    if (!selectedItemId) return;
    const pin = pins.find((p) => p.id === selectedItemId);
    if (!pin) return;
    mapRef.current?.easeTo({
      center: [pin.lng, pin.lat],
      duration: 500,
    });
  }, [selectedItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm p-4 text-center">
        <div>
          <PinOff className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p>Map not correctly configured.</p>
          <p className="text-xs mt-1">MapBox requires an active account/token.</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        latitude: mapCenter.lat,
        longitude: mapCenter.lng,
        zoom: defaultZoom,
      }}
      style={{ width: "100%", height: "100%" }}
      //mapStyle="mapbox://styles/mapbox/streets-v12"
      mapStyle="mapbox://styles/mccolin/cmqbbodj6003101qq64a33rf4"
    >
      <NavigationControl position="top-right" />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          latitude={pin.lat}
          longitude={pin.lng}
          anchor="bottom"
          onClick={() => onSelectItem(pin.id)}
        >
          <div
            className={cn(
              "cursor-pointer transition-transform hover:scale-110",
              selectedItemId === pin.id ? "scale-125" : ""
            )}
          >
            <MapPin fill="--foreground" color="white" strokeWidth={1} size={36} />
          </div>
        </Marker>
      ))}
    </Map>
  );
}
