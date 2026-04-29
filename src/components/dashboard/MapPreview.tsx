import { Link } from "react-router";
import { MapPin } from "lucide-react";

export type MapAsset = {
  asset_id: string;
  lat: number;
  lng: number;
  type?: string;
  district?: string;
  risk_level?: string;
  risk_score?: number | null;
};

type Props = {
  assets: MapAsset[];
  loading: boolean;
};

const RISK_COLOR: Record<string, string> = {
  SAFE: "#10B981",
  MODERATE: "#f59e0b",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
  UNKNOWN: "#94a3b8",
};

function bounds(points: MapAsset[]) {
  if (!points.length) return { minLat: 30.5, maxLat: 32.2, minLng: 73.8, maxLng: 76.2 };
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  points.forEach((p) => {
    if (typeof p.lat !== "number" || typeof p.lng !== "number") return;
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  });
  const padLat = (maxLat - minLat) * 0.12 || 0.15;
  const padLng = (maxLng - minLng) * 0.12 || 0.15;
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
  };
}

function project(p: MapAsset, b: ReturnType<typeof bounds>) {
  const x = ((p.lng - b.minLng) / (b.maxLng - b.minLng || 1)) * 100;
  const y = (1 - (p.lat - b.minLat) / (b.maxLat - b.minLat || 1)) * 100;
  return { x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) };
}

export function MapPreview({ assets, loading }: Props) {
  const list = assets || [];
  const b = bounds(list);

  if (loading && !list.length) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border min-h-[220px] animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
        <div className="h-44 bg-muted/40 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="font-semibold text-foreground">Map preview</h3>
        <Link
          to="/app/map"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 min-h-[44px] sm:min-h-0"
        >
          <MapPin className="w-4 h-4" />
          Open full GIS map
        </Link>
      </div>
      <div className="relative rounded-lg border border-border bg-gradient-to-b from-muted/40 to-muted/20 aspect-[16/9] max-h-[220px] sm:max-h-[260px] overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_40%,hsl(var(--primary)/0.25),transparent_55%)]" />
        {list.slice(0, 80).map((p) => {
          const { x, y } = project(p, b);
          const rl = (p.risk_level || "UNKNOWN").toUpperCase();
          const fill = RISK_COLOR[rl] || RISK_COLOR.UNKNOWN;
          return (
            <Link
              key={String(p.asset_id)}
              to={`/app/assets/${p.asset_id}`}
              title={`${p.type || "Asset"} · ${p.district || ""} · ${rl}`}
              className="absolute block rounded-full border-2 border-white/80 shadow-sm hover:scale-125 transition-transform z-10"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: 10,
                height: 10,
                transform: "translate(-50%, -50%)",
                backgroundColor: fill,
              }}
            />
          );
        })}
        {list.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground px-4 text-center">
            No geo-tagged assets yet. Add assets to see the map preview.
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
        {Object.entries(RISK_COLOR).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v }} />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}
