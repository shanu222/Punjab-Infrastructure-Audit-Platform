export type GisMapAsset = {
  id: string;
  asset_id?: string;
  name: string;
  type: string;
  district?: string;
  lat: number;
  lng: number;
  risk_level: string;
  risk_score?: number | null;
  last_audit_at?: string | null;
};

export type MapAssetFilters = {
  type: string;
  risk: string;
  district: string;
  disaster: string;
};

export type MapLayerToggles = {
  flood: boolean;
  seismic: boolean;
  urban: boolean;
};

export type HighRiskZone = {
  district: string;
  high_risk_audit_count: number;
};

export type AiInsightsPayload = {
  generated_at?: string;
  high_risk_zones?: HighRiskZone[];
  predictions?: { id?: string; summary?: string; confidence?: number }[];
  trends?: { message?: string };
};
