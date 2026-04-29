import { useCallback, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import type { GisMapAsset } from "./types";
import type { MapLayerToggles } from "./types";
import {
  FLOOD_GEOJSON,
  PUNJAB_CENTER,
  PUNJAB_ZOOM,
  SEISMIC_FILL_GEOJSON,
  SEISMIC_GRID_GEOJSON,
  URBAN_GEOJSON,
} from "./mapUtils";
import { markerClassName, markerHtmlForAsset } from "./AssetMarker";

type Props = {
  assets: GisMapAsset[];
  layers: MapLayerToggles;
  selectedId: string | null;
  highlightDistrictsLower: string[];
  /** Increment after each API load to zoom bounds to filtered results. */
  fitTick: number;
  onSelect: (asset: GisMapAsset | null) => void;
};

function isValidCoord(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

export function MapCanvas({
  assets,
  layers,
  selectedId,
  highlightDistrictsLower,
  fitTick,
  onSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.LayerGroup | null>(null);
  const lastFitTickRef = useRef(0);
  const overlayRef = useRef<{
    flood: L.GeoJSON;
    seismicFill: L.GeoJSON;
    seismicGrid: L.GeoJSON;
    urban: L.GeoJSON;
  } | null>(null);

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const buildMarkers = useCallback(
    (map: L.Map, cluster: L.LayerGroup): L.LatLngExpression[] => {
      cluster.clearLayers();
      const setHi = new Set(highlightDistrictsLower);
      const pts: L.LatLngExpression[] = [];
      for (const asset of assets) {
        if (!isValidCoord(asset.lat, asset.lng)) continue;
        pts.push([asset.lat, asset.lng]);
        const district = (asset.district || "").toLowerCase();
        const pulse = district && setHi.has(district);
        const selected = asset.id === selectedId;
        const icon = L.divIcon({
          className: markerClassName(),
          html: markerHtmlForAsset(asset, { selected, pulse }),
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        const m = L.marker([asset.lat, asset.lng], { icon });
        m.bindTooltip(
          `<div class="text-xs font-medium">${escapeHtml(asset.name)}</div>`,
          {
            direction: "top",
            sticky: true,
            opacity: 0.95,
            className:
              "rounded-md border border-border bg-card px-2 py-1 shadow-sm",
          },
        );
        m.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectRef.current(asset);
        });
        cluster.addLayer(m);
      }
      return pts;
    },
    [assets, highlightDistrictsLower, selectedId],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: true,
      preferCanvas: true,
    }).setView(PUNJAB_CENTER, PUNJAB_ZOOM);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const cluster = (
      L as unknown as {
        markerClusterGroup: (o?: object) => L.LayerGroup;
      }
    ).markerClusterGroup({
      maxClusterRadius: 56,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      animate: true,
      animateAddingMarkers: false,
    });
    map.addLayer(cluster);

    const gj = (data: object, style: L.PathOptions) =>
      L.geoJSON(data as L.GeoJsonObject, { style });

    const flood = gj(FLOOD_GEOJSON, {
      color: "#2563eb",
      weight: 1,
      fillColor: "#3b82f6",
      fillOpacity: 0.2,
    });
    const seismicFill = gj(SEISMIC_FILL_GEOJSON, {
      color: "#dc2626",
      weight: 1,
      fillColor: "#ef4444",
      fillOpacity: 0.08,
    });
    const seismicGrid = gj(SEISMIC_GRID_GEOJSON, {
      color: "rgba(220,38,38,0.55)",
      weight: 0.8,
      fillOpacity: 0,
    });
    const urban = gj(URBAN_GEOJSON, {
      color: "#ea580c",
      weight: 1,
      fillColor: "#fb923c",
      fillOpacity: 0.22,
    });

    overlayRef.current = { flood, seismicFill, seismicGrid, urban };

    map.on("click", () => onSelectRef.current(null));

    mapRef.current = map;
    clusterRef.current = cluster;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      clusterRef.current = null;
      overlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !cluster) return;
    const pts = buildMarkers(map, cluster);
    if (fitTick > lastFitTickRef.current) {
      lastFitTickRef.current = fitTick;
      if (pts.length > 0) {
        const b = L.latLngBounds(pts).pad(0.08);
        if (b.isValid()) map.fitBounds(b, { maxZoom: 11, animate: false });
      } else {
        map.setView(PUNJAB_CENTER, PUNJAB_ZOOM, { animate: false });
      }
    }
  }, [buildMarkers, fitTick]);

  useEffect(() => {
    const map = mapRef.current;
    const o = overlayRef.current;
    if (!map || !o) return;
    const toggle = (layer: L.Layer, on: boolean) => {
      if (on && !map.hasLayer(layer)) map.addLayer(layer);
      if (!on && map.hasLayer(layer)) map.removeLayer(layer);
    };
    toggle(o.flood, layers.flood);
    toggle(o.seismicFill, layers.seismic);
    toggle(o.seismicGrid, layers.seismic);
    toggle(o.urban, layers.urban);
  }, [layers]);

  return (
    <div
      ref={containerRef}
      className="relative z-0 h-full min-h-[280px] w-full rounded-xl border border-border bg-muted/30 [&_.leaflet-container]:isolate [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl [&_.leaflet-container]:font-sans"
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
