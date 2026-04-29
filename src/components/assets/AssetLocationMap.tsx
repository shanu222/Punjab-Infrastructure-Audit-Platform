import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

type Props = {
  lat?: number | null;
  lng?: number | null;
  label?: string;
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

export function AssetLocationMap({ lat, lng, label }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!coordsOk(lat, lng) || !ref.current || mapRef.current) return;

    const map = L.map(ref.current, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

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
    };
  }, [lat, lng, label]);

  if (!coordsOk(lat, lng)) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        <MapPin className="mr-2 size-5 opacity-50" />
        No coordinates on file
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/20 [&_.leaflet-container]:h-[220px] [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl">
      <div ref={ref} className="h-[220px] w-full" />
    </div>
  );
}
