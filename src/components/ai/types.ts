export type TrendPoint = {
  period: string;
  label: string;
  risk_index: number;
  submissions?: number;
  projected?: boolean;
};

export type HighRiskZone = {
  district?: string;
  high_risk_audit_count?: number;
};

export type DisasterModels = {
  flood?: {
    risk_percent?: number;
    affected_assets?: number;
    trend?: string;
    avg_score?: number;
  };
  earthquake?: {
    vulnerability_score?: number;
    high_risk_structures?: number;
    trend?: string;
    avg_score?: number;
  };
  heat?: {
    stress_level?: number;
    trend?: string;
    avg_score?: number;
  };
};

export type AiDashboardPayload = {
  generated_at?: string;
  total_assets?: number;
  trends?: {
    message?: string;
    audits_last_window?: number;
    series?: TrendPoint[];
    projection?: TrendPoint[];
  };
  high_risk_zones?: HighRiskZone[];
  predictions?: {
    id?: string;
    summary?: string;
    confidence?: number;
    horizon_months?: number;
  }[];
  recommendations?: { id?: string; text: string; priority?: string }[];
  disaster_models?: DisasterModels;
  insight_headlines?: string[];
  weak_infrastructure_types?: {
    type?: string;
    high_severity_audit_count?: number;
  }[];
  summary_metrics?: {
    avg_structural?: number;
    avg_flood?: number;
    avg_earthquake?: number;
    avg_heat?: number;
  };
};
