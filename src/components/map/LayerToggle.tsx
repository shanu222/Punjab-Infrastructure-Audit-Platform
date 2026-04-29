import { Layers } from "lucide-react";
import type { MapLayerToggles } from "./types";

type Props = {
  layers: MapLayerToggles;
  onChange: (next: MapLayerToggles) => void;
  className?: string;
};

const ROWS: { key: keyof MapLayerToggles; label: string }[] = [
  { key: "flood", label: "Flood zones" },
  { key: "seismic", label: "Seismic zones" },
  { key: "urban", label: "Urban density / heat" },
];

export function LayerToggle({ layers, onChange, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-border bg-card/95 backdrop-blur-sm p-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Layers className="size-4 text-primary" />
        Layers
      </div>
      <div className="space-y-2">
        {ROWS.map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60"
          >
            <input
              type="checkbox"
              className="size-4 rounded border-border accent-primary"
              checked={layers[key]}
              onChange={(e) =>
                onChange({ ...layers, [key]: e.target.checked })
              }
            />
            <span className="text-foreground">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
