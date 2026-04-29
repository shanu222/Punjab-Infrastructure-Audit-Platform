import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Menu, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/app/components/ui/drawer";
import { fetchAiInsights, fetchMapAssets } from "@/services/mapService.js";
import { assetMatchesDisasterFilter } from "@/components/map/mapUtils";
import { MapCanvas } from "@/components/map/MapCanvas";
import { FilterPanel } from "@/components/map/FilterPanel";
import { LayerToggle } from "@/components/map/LayerToggle";
import { AssetDetailsPanel } from "@/components/map/AssetDetailsPanel";
import type {
  AiInsightsPayload,
  GisMapAsset,
  MapAssetFilters,
  MapLayerToggles,
} from "@/components/map/types";

const DEFAULT_FILTERS: MapAssetFilters = {
  type: "all",
  risk: "all",
  district: "all",
  disaster: "all",
};

const DEFAULT_LAYERS: MapLayerToggles = {
  flood: true,
  seismic: true,
  urban: false,
};

function useDebounced<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setD(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return d;
}

function useIsMobile(breakpoint = 768): boolean {
  const [m, setM] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const fn = () => setM(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [breakpoint]);
  return m;
}

function normalizeAssets(raw: unknown): GisMapAsset[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row: Record<string, unknown>) => {
      const id = String(row.id ?? row._id ?? "");
      if (!id) return null;
      const lat = Number(row.lat ?? row.latitude);
      const lng = Number(row.lng ?? row.longitude ?? row.lon);
      return {
        id,
        asset_id: row.asset_id != null ? String(row.asset_id) : id,
        name: String(row.name || `Asset ${id.slice(-6)}`),
        type: String(row.type || ""),
        district: row.district != null ? String(row.district) : "",
        lat,
        lng,
        risk_level: String(row.risk_level || "UNKNOWN").toUpperCase(),
        risk_score:
          row.risk_score === null || row.risk_score === undefined
            ? null
            : Number(row.risk_score),
        last_audit_at:
          row.last_audit_at != null ? String(row.last_audit_at) : null,
      } as GisMapAsset;
    })
    .filter(Boolean) as GisMapAsset[];
}

function buildInsightBanners(insights: AiInsightsPayload | null): string[] {
  if (!insights) return [];
  const lines: string[] = [];
  const zones = insights.high_risk_zones || [];
  if (zones[0]?.district) {
    lines.push(
      `Elevated audit activity in ${zones[0].district} (${zones[0].high_risk_audit_count} high / critical reviews).`,
    );
  }
  const pred = insights.predictions?.[0]?.summary;
  if (pred) lines.push(pred);
  return lines.slice(0, 3);
}

export function MapGisPage() {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<MapAssetFilters>(DEFAULT_FILTERS);
  const [layers, setLayers] = useState<MapLayerToggles>(DEFAULT_LAYERS);
  const [selectedAsset, setSelectedAsset] = useState<GisMapAsset | null>(null);
  const [rawAssets, setRawAssets] = useState<GisMapAsset[]>([]);
  const [insights, setInsights] = useState<AiInsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fitTick, setFitTick] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const apiQuery = useMemo(
    () => ({
      type: filters.type,
      risk: filters.risk,
      district: filters.district,
    }),
    [filters.type, filters.risk, filters.district],
  );

  const debouncedApi = useDebounced(apiQuery, 380);

  const loadMap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mapRes, aiRes] = await Promise.all([
        fetchMapAssets(debouncedApi),
        fetchAiInsights(),
      ]);
      const list = normalizeAssets(mapRes?.data?.assets);
      setRawAssets(list);
      setInsights((aiRes?.data as AiInsightsPayload) || null);
      setFitTick((n) => n + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load map data";
      setError(msg);
      setRawAssets([]);
      toast.error("Map data failed", { description: msg });
    } finally {
      setLoading(false);
    }
  }, [debouncedApi]);

  useEffect(() => {
    void loadMap();
  }, [loadMap]);

  const displayedAssets = useMemo(() => {
    return rawAssets.filter((a) =>
      assetMatchesDisasterFilter(a, filters.disaster),
    );
  }, [rawAssets, filters.disaster]);

  const districts = useMemo(() => {
    const s = new Set<string>();
    rawAssets.forEach((a) => {
      if (a.district?.trim()) s.add(a.district.trim());
    });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rawAssets]);

  const highlightDistrictsLower = useMemo(() => {
    const zones = insights?.high_risk_zones || [];
    return zones.slice(0, 8).map((z) => (z.district || "").toLowerCase());
  }, [insights]);

  useEffect(() => {
    if (!selectedAsset) return;
    if (!displayedAssets.some((a) => a.id === selectedAsset.id)) {
      setSelectedAsset(null);
    }
  }, [displayedAssets, selectedAsset]);

  const banners = useMemo(() => buildInsightBanners(insights), [insights]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-0 bg-background">
      <header className="shrink-0 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
              Punjab Infrastructure Audit — GIS intelligence
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Live assets, hazard overlays, and AI-assisted risk context
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Syncing…
            </div>
          )}
        </div>
        {banners.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {banners.map((text, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100"
              >
                {i === 0 ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                ) : (
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-600" />
                )}
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {!isMobile && (
          <aside className="hidden w-[min(22%,20rem)] shrink-0 md:flex md:flex-col">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              districts={districts}
              assetCount={displayedAssets.length}
              variant="sidebar"
            />
          </aside>
        )}

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col p-2 md:p-3 md:pl-2">
          {isMobile && (
            <div className="mb-2 flex shrink-0 items-center gap-2">
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm"
                  >
                    <Menu className="size-4" />
                    Filters
                  </button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Map filters</DrawerTitle>
                  </DrawerHeader>
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    districts={districts}
                    assetCount={displayedAssets.length}
                    variant="drawer"
                    onClose={() => setDrawerOpen(false)}
                  />
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="mx-4 mb-6 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
                    >
                      Done
                    </button>
                  </DrawerClose>
                </DrawerContent>
              </Drawer>
            </div>
          )}

          <div className="pointer-events-none absolute left-3 top-14 z-[410] flex flex-col gap-2 md:left-4 md:top-4">
            <div className="pointer-events-auto">
              <LayerToggle layers={layers} onChange={setLayers} />
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl md:min-h-[420px]">
            {error && !loading && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/80 p-4 text-center">
                <p className="max-w-md text-sm text-destructive">{error}</p>
              </div>
            )}
            {!loading && displayedAssets.length === 0 && !error && (
              <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/60 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No infrastructure assets match the current filters. Try
                  widening type, risk, district, or disaster context.
                </p>
              </div>
            )}
            <MapCanvas
              assets={displayedAssets}
              layers={layers}
              selectedId={selectedAsset?.id ?? null}
              highlightDistrictsLower={highlightDistrictsLower}
              fitTick={fitTick}
              onSelect={setSelectedAsset}
            />
            <AssetDetailsPanel
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MapGisPage;
