import { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PUNJAB_CENTER, PUNJAB_ZOOM } from "@/components/map/mapUtils";
import {
  MAP_ATTRIBUTION_DARK,
  MAP_ATTRIBUTION_LIGHT,
  MAP_TILE_DARK,
  MAP_TILE_LIGHT,
} from "@/utils/mapTiles";

export type NearbyPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  risk_score?: number | null;
};

type Props = {
  lat: number | null;
  lng: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  nearbyAssets?: NearbyPin[];
  className?: string;
  readOnly?: boolean;
  mapTheme?: "light" | "dark";
};

export function MapSelector({
  lat,
  lng,
  onLocationChange,
  nearbyAssets = [],
  className = "",
  readOnly = false,
  mapTheme = "light",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const appliedBasemapRef = useRef<"light" | "dark" | null>(null);
  const pinRef = useRef<L.Marker | null>(null);
  const nearbyLayerRef = useRef<L.LayerGroup | null>(null);
  const onLocRef = useRef(onLocationChange);
  const readOnlyRef = useRef(readOnly);
  onLocRef.current = onLocationChange;
  readOnlyRef.current = readOnly;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, { zoomControl: true, preferCanvas: true }).setView(PUNJAB_CENTER, PUNJAB_ZOOM);
    const isDark = mapTheme === "dark";
    const tl = L.tileLayer(isDark ? MAP_TILE_DARK : MAP_TILE_LIGHT, {
      attribution: isDark ? MAP_ATTRIBUTION_DARK : MAP_ATTRIBUTION_LIGHT,
      maxZoom: 19,
    }).addTo(map);
    tileRef.current = tl;
    appliedBasemapRef.current = isDark ? "dark" : "light";

    const nearbyLayer = L.layerGroup().addTo(map);
    nearbyLayerRef.current = nearbyLayer;

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (readOnlyRef.current) return;
      const { lat: la, lng: ln } = e.latlng;
      onLocRef.current(la, ln);
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      pinRef.current = null;
      nearbyLayerRef.current = null;
      tileRef.current = null;
      appliedBasemapRef.current = null;
    };
  }, []);

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

  const setPin = useCallback((la: number, ln: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (pinRef.current) {
      map.removeLayer(pinRef.current);
    }
    const border = mapTheme === "dark" ? "#1e293b" : "#ffffff";
    const icon = L.divIcon({
      className: "future-proposal-pin",
      html: `<div style="width:22px;height:22px;border-radius:50%;background:#2563eb;border:3px solid ${border};box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    const ro = readOnlyRef.current;
    pinRef.current = L.marker([la, ln], { icon, draggable: !ro }).addTo(map);
    if (ro) pinRef.current.dragging?.disable();
    pinRef.current.on("dragend", (ev) => {
      if (readOnlyRef.current) return;
      const p = ev.target.getLatLng();
      onLocRef.current(p.lat, p.lng);
    });
    map.setView([la, ln], Math.max(map.getZoom(), 11), { animate: true });
  }, [mapTheme]);

  useEffect(() => {
    if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      setPin(lat, lng);
    }
  }, [lat, lng, setPin, readOnly]);

  useEffect(() => {
    const layer = nearbyLayerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    for (const a of nearbyAssets) {
      if (typeof a.lat !== "number" || typeof a.lng !== "number") continue;
      const c =
        a.risk_score != null && a.risk_score >= 75
          ? "#ef4444"
          : a.risk_score != null && a.risk_score >= 50
            ? "#f97316"
            : "#64748b";
      const m = L.circleMarker([a.lat, a.lng], { radius: 5, color: c, fillColor: c, fillOpacity: 0.85, weight: 1 });
      m.bindTooltip(a.label, { sticky: true, direction: "top" });
      layer.addLayer(m);
    }
  }, [nearbyAssets]);

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-xs text-muted-foreground">
        {readOnly ? "Proposal location (read-only) with nearby registered assets." : "Click the map to drop the proposal pin. Drag the pin to adjust."}
      </p>
      <div
        ref={wrapRef}
        className="relative z-0 h-[min(55vh,420px)] w-full min-h-[240px] rounded-xl border border-border bg-muted/30 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl"
      />
    </div>
  );
}
