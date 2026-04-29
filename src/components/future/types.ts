export type FutureFormState = {
  project_name: string;
  type: "building" | "road" | "bridge" | "dam";
  district: string;
  lat: string;
  lng: string;
  material: string;
  structural_type: string;
};

export type FormErrors = Partial<Record<keyof FutureFormState | "location", string>>;

export type HazardMetric = { score: number; level: string };

export type FutureAnalysisData = {
  project_name: string;
  district: string;
  type: string;
  flood_risk: HazardMetric;
  earthquake_risk: HazardMetric;
  heat_risk: HazardMetric;
  structural_score?: number;
  nearby_assets: Array<{
    id: string;
    type: string;
    district: string;
    distance_km: number;
    risk_score: number | null;
    is_flagged_critical?: boolean;
    lat?: number;
    lng?: number;
  }>;
  historical: {
    average_area_risk: number | null;
    high_critical_audit_count: number;
    audits_sampled: number;
    nearby_asset_count: number;
  };
  recommendation: string;
  recommendations: string[];
  approval_status: string;
  approval_explanation: string;
  overall_risk: string;
  composite_index: number;
};
