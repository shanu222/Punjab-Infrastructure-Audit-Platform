import { Filter, X } from "lucide-react";
import type { MapAssetFilters } from "./types";

const ASSET_TYPES = [
  { value: "all", label: "All types" },
  { value: "building", label: "Building" },
  { value: "road", label: "Road" },
  { value: "bridge", label: "Bridge" },
  { value: "dam", label: "Dam" },
];

const RISKS = [
  { value: "all", label: "All levels" },
  { value: "SAFE", label: "Safe" },
  { value: "MODERATE", label: "Moderate" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const DISASTERS = [
  { value: "all", label: "All contexts" },
  { value: "flood", label: "Flood" },
  { value: "earthquake", label: "Earthquake" },
  { value: "heat", label: "Heat" },
];

type Props = {
  filters: MapAssetFilters;
  onChange: (next: MapAssetFilters) => void;
  districts: string[];
  assetCount: number;
  onClose?: () => void;
  variant?: "sidebar" | "drawer";
};

export function FilterPanel({
  filters,
  onChange,
  districts,
  assetCount,
  onClose,
  variant = "sidebar",
}: Props) {
  const wrap =
    variant === "sidebar"
      ? "h-full w-full max-w-[20rem] border-r border-border bg-card p-5"
      : "p-4 pb-8";

  return (
    <div className={`flex flex-col overflow-y-auto ${wrap}`}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Filter className="size-5 text-primary" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted"
            aria-label="Close filters"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Asset type
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ ...filters, type: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {ASSET_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Risk level
          </label>
          <select
            value={filters.risk}
            onChange={(e) =>
              onChange({ ...filters, risk: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {RISKS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            District
          </label>
          <select
            value={filters.district}
            onChange={(e) =>
              onChange({ ...filters, district: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Disaster context
          </label>
          <select
            value={filters.disaster}
            onChange={(e) =>
              onChange({ ...filters, disaster: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {DISASTERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Narrows markers to assets inside the simulated hazard footprint for
            that scenario. Use layers to show full overlays.
          </p>
        </div>

        <div className="mt-auto rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{assetCount}</span>{" "}
          assets on the map
        </div>
      </div>
    </div>
  );
}
