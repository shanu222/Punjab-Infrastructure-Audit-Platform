import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import {
  MAP_ATTRIBUTION_DARK,
  MAP_ATTRIBUTION_LIGHT,
  MAP_TILE_DARK,
  MAP_TILE_LIGHT,
} from "@/utils/mapTiles";

type Props = {
  lat?: number | null;
  lng?: number | null;
  label?: string;
  mapTheme?: "light" | "dark";
};

function coordsOk(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function AssetLocationMap({ lat, lng, label, mapTheme = "light" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const appliedBasemapRef = useRef<"light" | "dark" | null>(null);

  useEffect(() => {
    if (!coordsOk(lat, lng) || !ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 14);

    const isDark = mapTheme === "dark";
    const tl = L.tileLayer(isDark ? MAP_TILE_DARK : MAP_TILE_LIGHT, {
      attribution: isDark ? MAP_ATTRIBUTION_DARK : MAP_ATTRIBUTION_LIGHT,
      maxZoom: 19,
    }).addTo(map);
    tileRef.current = tl;
    appliedBasemapRef.current = isDark ? "dark" : "light";

    const marker = L.circleMarker([lat, lng], {
      radius: 12,
      color: "#1d4ed8",
      weight: 2,
      fillColor: "#3b82f6",
      fillOpacity: 0.9,
    }).addTo(map);

    if (label) marker.bindTooltip(label, { direction: "top" });

    mapRef.current = map;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      tileRef.current = null;
      appliedBasemapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map created once per coordinate mount
  }, [lat, lng, label]);

  useEffect(() => {
    const map = mapRef.current;
    const current = tileRef.current;
    if (!map || !current) return;
    const next = mapTheme === "dark" ? "dark" : "light";
    if (appliedBasemapRef.current === next) return;
    appliedBasemapRef.current = next;
    const isDark = mapTheme === "dark";
    map.removeLayer(current);
    const layer = L.tileLayer(isDark ? MAP_TILE_DARK : MAP_TILE_LIGHT, {
      attribution: isDark ? MAP_ATTRIBUTION_DARK : MAP_ATTRIBUTION_LIGHT,
      maxZoom: 19,
    }).addTo(map);
    tileRef.current = layer;
  }, [mapTheme]);

  if (!coordsOk(lat, lng)) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors duration-300">
        <MapPin className="mr-2 size-5 opacity-50" />
        No coordinates on file
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20 transition-colors duration-300 [&_.leaflet-container]:h-[220px] [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl">
      <div ref={ref} className="h-[220px] w-full" />
    </div>
  );
}
