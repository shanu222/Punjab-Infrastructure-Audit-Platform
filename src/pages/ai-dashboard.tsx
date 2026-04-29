import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { RefreshCw, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { fetchAiInsights } from "@/services/aiService.js";
import { getStoredUser } from "@/utils/authStorage.js";
import { RiskTrendChart } from "@/components/ai/RiskTrendChart";
import { ZonePanel } from "@/components/ai/ZonePanel";
import { ModelCards } from "@/components/ai/ModelCards";
import { InsightsPanel } from "@/components/ai/InsightsPanel";
import { Recommendations } from "@/components/ai/Recommendations";
import type { AiDashboardPayload } from "@/components/ai/types";

const REFRESH_MS = 60_000;

export function AiDashboardPage() {
  const user = getStoredUser();
  const allowed = user?.role === "government" || user?.role === "admin";

  const [data, setData] = useState<AiDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetchAiInsights();
      setData((res?.data as AiDashboardPayload) || null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load insights";
      setError(msg);
      setData(null);
      if (!silent) toast.error("AI insights failed", { description: msg });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      void load(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <ShieldAlert className="size-10 shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              AI Risk Intelligence is available to government and administrator
              roles only.
            </p>
          </div>
        </div>
        <Link to="/app" className="text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading intelligence layer…</p>
      </div>
    );
  }

  const series = data?.trends?.series || [];
  const projection = data?.trends?.projection || [];
  const zones = data?.high_risk_zones || [];
  const headlines = data?.insight_headlines || [];
  const predictions = data?.predictions || [];
  const recommendations = data?.recommendations || [];
  const weak = data?.weak_infrastructure_types || [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-3 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
          >
            AI Risk Intelligence
          </motion.h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Predictive infrastructure analysis for Punjab-wide planning
          </p>
          {data?.generated_at && (
            <p className="mt-2 text-xs text-muted-foreground">
              Generated {new Date(data.generated_at).toLocaleString()} ·{" "}
              {data.total_assets != null ? (
                <span>{data.total_assets} assets in registry</span>
              ) : null}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-border bg-card px-4 text-sm font-medium shadow-sm hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            className={`size-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Predictive risk trajectory
          </h2>
          <p className="mb-4 text-xs text-muted-foreground">
            {data?.trends?.message ||
              "Monthly mean composite risk from audits, with a simple projection curve."}
          </p>
          <RiskTrendChart series={series} projection={projection} />
        </section>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
          <ZonePanel zones={zones} />
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Disaster exposure models
        </h2>
        <ModelCards models={data?.disaster_models} />
      </section>

      {weak.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4 md:p-5">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Weak infrastructure types (HIGH / CRITICAL audits)
          </h2>
          <div className="flex flex-wrap gap-2">
            {weak.map((w) => (
              <span
                key={w.type}
                className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium capitalize"
              >
                {w.type?.replace(/_/g, " ")} · {w.high_severity_audit_count}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
          <InsightsPanel headlines={headlines} predictions={predictions} />
        </section>
        <section className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
          <Recommendations items={recommendations} />
        </section>
      </div>
    </div>
  );
}

export default AiDashboardPage;
