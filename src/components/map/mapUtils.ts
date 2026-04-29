type Polygon = { type: "Polygon"; coordinates: number[][][] };
type MultiLineString = { type: "MultiLineString"; coordinates: number[][][] };
type FeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: Polygon | MultiLineString;
  }>;
};

/** Default view: Punjab region */
export const PUNJAB_CENTER: [number, number] = [31.17, 74.33];
export const PUNJAB_ZOOM = 7;

export const RISK_MARKER_COLORS: Record<string, string> = {
  SAFE: "#10B981",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
  UNKNOWN: "#64748b",
};

export function riskLevelToColor(level: string | undefined): string {
  const k = (level || "UNKNOWN").toUpperCase();
  return RISK_MARKER_COLORS[k] || RISK_MARKER_COLORS.UNKNOWN;
}

export function riskLevelToBadgeKey(
  level: string | undefined,
): "safe" | "moderate" | "high" | "critical" {
  const u = (level || "").toUpperCase();
  if (u === "SAFE") return "safe";
  if (u === "MODERATE") return "moderate";
  if (u === "HIGH") return "high";
  if (u === "CRITICAL") return "critical";
  return "moderate";
}

function ringContainsPoint(
  ring: number[][],
  lat: number,
  lng: number,
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** `coordinates[0]` is outer ring as [lng, lat][] */
export function pointInPolygon(
  lat: number,
  lng: number,
  coordinates: number[][][],
): boolean {
  if (!coordinates?.length) return false;
  const outer = coordinates[0];
  if (!ringContainsPoint(outer, lng, lat)) return false;
  for (let h = 1; h < coordinates.length; h++) {
    if (ringContainsPoint(coordinates[h], lng, lat)) return false;
  }
  return true;
}

export const FLOOD_ZONE_POLYGON: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [71.2, 29.0],
      [71.2, 31.6],
      [74.2, 31.6],
      [74.2, 29.0],
      [71.2, 29.0],
    ],
  ],
};

export const SEISMIC_ZONE_POLYGON: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [71.5, 31.4],
      [71.5, 34.2],
      [75.4, 34.2],
      [75.4, 31.4],
      [71.5, 31.4],
    ],
  ],
};

export const HEAT_URBAN_POLYGON: Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [73.6, 30.8],
      [73.6, 32.4],
      [75.8, 32.4],
      [75.8, 30.8],
      [73.6, 30.8],
    ],
  ],
};

/** Approximate north–Punjab seismic grid (lng, lat lines). */
export function seismicGridLines(): MultiLineString {
  const lines: number[][][] = [];
  for (let lng = 71.6; lng <= 75.2; lng += 0.35) {
    lines.push([
      [lng, 31.45],
      [lng, 34.05],
    ]);
  }
  for (let lat = 31.5; lat <= 34.0; lat += 0.35) {
    lines.push([
      [71.55, lat],
      [75.35, lat],
    ]);
  }
  return { type: "MultiLineString", coordinates: lines };
}

export const FLOOD_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: {}, geometry: FLOOD_ZONE_POLYGON }],
};

export const SEISMIC_FILL_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: {}, geometry: SEISMIC_ZONE_POLYGON },
  ],
};

export const SEISMIC_GRID_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: {}, geometry: seismicGridLines() },
  ],
};

export const URBAN_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [{ type: "Feature", properties: {}, geometry: HEAT_URBAN_POLYGON }],
};

export function assetMatchesDisasterFilter(
  asset: { lat: number; lng: number },
  disaster: string,
): boolean {
  const d = disaster.toLowerCase();
  if (d === "all") return true;
  if (d === "flood")
    return pointInPolygon(asset.lat, asset.lng, FLOOD_ZONE_POLYGON.coordinates);
  if (d === "earthquake")
    return pointInPolygon(
      asset.lat,
      asset.lng,
      SEISMIC_ZONE_POLYGON.coordinates,
    );
  if (d === "heat")
    return pointInPolygon(
      asset.lat,
      asset.lng,
      HEAT_URBAN_POLYGON.coordinates,
    );
  return true;
}
