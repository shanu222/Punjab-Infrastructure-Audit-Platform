import type { GisMapAsset } from "./types";
import { riskLevelToColor } from "./mapUtils";

export function markerHtmlForAsset(
  asset: GisMapAsset,
  opts: { selected: boolean; pulse?: boolean },
): string {
  const color = riskLevelToColor(asset.risk_level);
  const scale = opts.selected ? 1.15 : 1;
  const ring =
    opts.pulse || opts.selected
      ? "box-shadow:0 0 0 3px rgba(59,130,246,0.45);"
      : "box-shadow:0 1px 4px rgba(0,0,0,0.35);";
  return `<div class="asset-dot-wrap" style="transform:scale(${scale});transition:transform 0.2s ease;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
    <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;${ring}"></div>
  </div>`;
}

export function markerClassName(): string {
  return "pia-asset-marker";
}
