import { Building2, AlertTriangle, ClipboardList, MapPinned } from "lucide-react";
import { StatCard } from "@/app/components/StatCard";

export type DashboardStatsPayload = {
  role_scope?: string;
  total_assets?: number;
  high_risk_assets?: number;
  recent_audits_count_30d?: number;
  districts_covered?: number;
  personal_assets_audited?: number | null;
};

type Props = {
  stats: DashboardStatsPayload | null;
  loading: boolean;
};

function SkeletonCard() {
  return (
    <div className="piap-surface p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2 mb-4" />
      <div className="h-8 bg-muted rounded w-1/3 mb-2" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

export function StatsCards({ stats, loading }: Props) {
  const role = stats?.role_scope || "";

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const s = stats || {};

  const cards =
    role === "engineer"
      ? [
          {
            title: "Total infrastructure (state)",
            value: s.total_assets ?? 0,
            icon: Building2,
            trend: "Punjab-wide asset register",
            trendUp: true,
            color: "bg-primary",
          },
          {
            title: "High risk assets (state)",
            value: s.high_risk_assets ?? 0,
            icon: AlertTriangle,
            trend: "Composite index ≥ 50",
            trendUp: false,
            color: "bg-[#f97316]",
          },
          {
            title: "My audits (30 days)",
            value: s.recent_audits_count_30d ?? 0,
            icon: ClipboardList,
            trend: "Your submissions",
            trendUp: true,
            color: "bg-secondary",
          },
          {
            title: "Assets I inspected",
            value: s.personal_assets_audited ?? 0,
            icon: MapPinned,
            trend: "Distinct assets audited",
            trendUp: true,
            color: "bg-[#8b5cf6]",
          },
        ]
      : [
          {
            title: "Total infrastructure",
            value: s.total_assets ?? 0,
            icon: Building2,
            trend: "Registered assets",
            trendUp: true,
            color: "bg-primary",
          },
          {
            title: "High risk assets",
            value: s.high_risk_assets ?? 0,
            icon: AlertTriangle,
            trend: "Risk index ≥ 50",
            trendUp: false,
            color: "bg-[#f97316]",
          },
          {
            title: "Recent audits (30 days)",
            value: s.recent_audits_count_30d ?? 0,
            icon: ClipboardList,
            trend: "Audit submissions",
            trendUp: true,
            color: "bg-secondary",
          },
          {
            title: "Districts covered",
            value: s.districts_covered ?? 0,
            icon: MapPinned,
            trend: "Unique districts",
            trendUp: true,
            color: "bg-[#8b5cf6]",
          },
        ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      {cards.map((c) => (
        <StatCard
          key={c.title}
          title={c.title}
          value={c.value}
          icon={c.icon}
          trend={c.trend}
          trendUp={c.trendUp}
          color={c.color}
        />
      ))}
    </div>
  );
}
