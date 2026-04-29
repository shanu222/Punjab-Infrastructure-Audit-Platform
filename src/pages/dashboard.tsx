import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  fetchDashboardStats,
  fetchMapAssets,
  fetchAiInsights,
} from "@/services/dashboardService.js";
import { StatsCards, type DashboardStatsPayload } from "@/components/dashboard/StatsCards";
import { RiskChart, type RiskDistribution } from "@/components/dashboard/RiskChart";
import { TrendChart, type TrendPoint } from "@/components/dashboard/TrendChart";
import { MapPreview, type MapAsset } from "@/components/dashboard/MapPreview";
import { InsightsPanel, type AiInsightsShape } from "@/components/dashboard/InsightsPanel";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
import { getStoredUser } from "@/utils/authStorage.js";

const REFRESH_MS = 30_000;

export function DashboardPage() {
  const user = getStoredUser();
  const [stats, setStats] = useState<DashboardStatsPayload | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [mapData, setMapData] = useState<MapAsset[]>([]);
  const [insights, setInsights] = useState<AiInsightsShape | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [statsRes, mapRes, aiRes] = await Promise.all([
        fetchDashboardStats(),
        fetchMapAssets(),
        fetchAiInsights(),
      ]);

      const d = statsRes?.data || {};
      setStats({
        role_scope: d.role_scope,
        total_assets: d.total_assets,
        high_risk_assets: d.high_risk_assets,
        recent_audits_count_30d: d.recent_audits_count_30d,
        districts_covered: d.districts_covered,
        personal_assets_audited: d.personal_assets_audited,
      });
      setRiskDistribution(d.risk_distribution || null);
      setTrends(Array.isArray(d.audit_trends) ? d.audit_trends : []);
      setActivity(Array.isArray(d.recent_activity) ? d.recent_activity : []);

      const assets = mapRes?.data?.assets;
      setMapData(Array.isArray(assets) ? assets : []);

      setInsights(aiRes?.data || null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load dashboard";
      setError(msg);
      if (!silent) toast.error("Dashboard load failed", { description: msg });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAll(false);
  }, [loadAll]);

  useEffect(() => {
    const id = setInterval(() => {
      void loadAll(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  const handleRefresh = () => {
    void loadAll(true);
    toast.success("Refreshing dashboard…");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 md:space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">
            Analytics dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Live infrastructure and disaster-risk intelligence
          </p>
          {user?.role === "admin" && (
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              <Shield className="w-3.5 h-3.5" />
              Administrator view — full system metrics
            </p>
          )}
          {user?.role === "government" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Government view — statewide analytics and alerts
            </p>
          )}
          {user?.role === "engineer" && (
            <p className="mt-2 text-xs text-muted-foreground">
              Engineer view — your audit workload with Punjab-wide context
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 self-start px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted/60 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && !stats && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} — check API connection and sign in again.
        </div>
      )}

      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RiskChart distribution={riskDistribution} loading={loading} />
        <TrendChart data={trends} loading={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <MapPreview assets={mapData} loading={loading} />
        <InsightsPanel insights={insights} loading={loading} />
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <ActivityFeed items={activity} loading={loading} />
      </motion.div>

      <p className="text-xs text-muted-foreground text-center">
        Auto-refresh every {REFRESH_MS / 1000}s · Data from PIAP API
      </p>
    </div>
  );
}

export default DashboardPage;
