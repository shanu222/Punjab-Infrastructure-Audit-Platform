import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Download,
  Flag,
  Hammer,
  Loader2,
  ShieldOff,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import {
  fetchAssetAiInsights,
  fetchAssetById,
  fetchAuditsForAsset,
  patchAssetFlags,
} from "@/services/assetService.js";
import { getStoredUser } from "@/utils/authStorage.js";
import { format, parseISO } from "date-fns";
import { AssetHeader } from "@/components/assets/AssetHeader";
import { RiskPanel } from "@/components/assets/RiskPanel";
import type { ScoreBreakdown } from "@/components/assets/RiskPanel";
import { DetailsSection } from "@/components/assets/DetailsSection";
import { AssetLocationMap } from "@/components/assets/AssetLocationMap";
import { MediaGallery, normalizeMediaUrl } from "@/components/assets/MediaGallery";
import { AuditTimeline, type AuditRow } from "@/components/assets/AuditTimeline";
import { AIInsights, type AiInsightsModel } from "@/components/assets/AIInsights";
import { weightedComposite } from "@/components/assets/riskUtils";

type AssetRecord = {
  _id?: string;
  asset_id?: string;
  display_name?: string;
  type?: string;
  district?: string;
  location?: { lat: number; lng: number };
  construction_year?: number | null;
  material?: string | null;
  structural_type?: string | null;
  risk_score?: number | null;
  is_flagged_critical?: boolean;
  created_by?: {
    name?: string;
    email?: string;
    department?: string;
  } | null;
};

const MONGO_ID_RE = /^[a-f\d]{24}$/i;

export function AssetDetailPage() {
  const { id } = useParams();
  const user = getStoredUser();
  const { resolvedTheme } = useTheme();
  const canEngineer = user?.role === "admin" || user?.role === "engineer";

  const [asset, setAsset] = useState<AssetRecord | null>(null);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsightsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagBusy, setFlagBusy] = useState(false);

  const validId = id && MONGO_ID_RE.test(id);

  const resolvedId = id || "";

  const load = useCallback(async () => {
    if (!validId || !id) {
      setError("Invalid asset identifier.");
      setLoading(false);
      setAiLoading(false);
      return;
    }
    setLoading(true);
    setAiLoading(true);
    setError(null);
    try {
      const assetRes = await fetchAssetById(id);
      const a = assetRes?.data?.asset as AssetRecord | undefined;
      if (!a) {
        setError("Asset not found.");
        setAsset(null);
        setAudits([]);
        setAiInsights(null);
        return;
      }
      setAsset(a);

      const [auditRes, aiRes] = await Promise.all([
        fetchAuditsForAsset(id).catch((e: Error) => {
          toast.error("Audits failed to load", { description: e.message });
          return null;
        }),
        fetchAssetAiInsights(id).catch((e: Error) => {
          toast.error("AI insights failed to load", { description: e.message });
          return null;
        }),
      ]);

      const list = (auditRes?.data?.audits as AuditRow[]) || [];
      setAudits(Array.isArray(list) ? list : []);
      setAiInsights((aiRes?.data as AiInsightsModel) || null);
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      const msg =
        err.status === 404
          ? "Asset not found."
          : err instanceof Error
            ? err.message
            : "Failed to load asset";
      setError(msg);
      setAsset(null);
      setAudits([]);
      setAiInsights(null);
      if (err.status !== 404) {
        toast.error("Asset load failed", { description: msg });
      }
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  }, [id, validId]);

  useEffect(() => {
    void load();
  }, [load]);

  const latestAudit = audits[0];

  const breakdown: ScoreBreakdown = useMemo(() => {
    if (!latestAudit?.scores) return null;
    const s = latestAudit.scores;
    return {
      structural: s.structural,
      flood: s.flood,
      earthquake: s.earthquake,
      heat: s.heat,
    };
  }, [latestAudit]);

  const overallScore = useMemo(() => {
    if (typeof asset?.risk_score === "number" && !Number.isNaN(asset.risk_score)) {
      return asset.risk_score;
    }
    if (latestAudit?.scores) {
      return weightedComposite(latestAudit.scores);
    }
    return null;
  }, [asset?.risk_score, latestAudit]);

  const lastAuditLabel = useMemo(() => {
    if (!latestAudit?.createdAt) return "—";
    try {
      return format(parseISO(latestAudit.createdAt), "MMM d, yyyy");
    } catch {
      return "—";
    }
  }, [latestAudit]);

  const mediaItems = useMemo(() => {
    const urls = new Set<string>();
    for (const au of audits) {
      const mu = au && (au as { media_urls?: string[] }).media_urls;
      if (Array.isArray(mu)) {
        mu.forEach((u) => {
          if (typeof u === "string" && u.trim()) urls.add(u.trim());
        });
      }
    }
    return Array.from(urls).map(normalizeMediaUrl);
  }, [audits]);

  const handleDownloadReport = () => {
    const latest = audits[0];
    if (latest?.report_pdf) {
      window.open(latest.report_pdf, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("No PDF on the latest audit", {
      description:
        "Generate a report from the audit workspace, or upload a PDF after field work.",
    });
  };

  const handleToggleFlag = async () => {
    if (!validId || !id || !asset) return;
    const next = !asset.is_flagged_critical;
    setFlagBusy(true);
    try {
      const res = await patchAssetFlags(id, { is_flagged_critical: next });
      const updated = res?.data?.asset as AssetRecord | undefined;
      if (updated) {
        setAsset(updated);
        toast.success(next ? "Flagged as critical" : "Critical flag removed");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error("Could not update flag", { description: msg });
    } finally {
      setFlagBusy(false);
    }
  };

  if (!validId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-destructive">{error || "Invalid asset id."}</p>
        <Link to="/app/map" className="mt-4 inline-block text-primary hover:underline">
          Back to map
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-8">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading asset intelligence…</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold text-foreground">Asset not found</h1>
        <p className="mt-2 text-muted-foreground">
          {error || "The requested asset does not exist or was removed."}
        </p>
        <Link
          to="/app/map"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to map
        </Link>
      </div>
    );
  }

  const lat = asset.location?.lat;
  const lng = asset.location?.lng;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link
          to="/app/map"
          className="rounded-lg border border-border bg-card p-2 text-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <span className="text-sm text-muted-foreground">Map</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <AssetHeader asset={asset} resolvedId={resolvedId} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RiskPanel overallScore={overallScore} breakdown={breakdown} />

            <DetailsSection
              construction_year={asset.construction_year}
              material={asset.material}
              structural_type={asset.structural_type}
              owner={asset.created_by || null}
              lastAuditLabel={lastAuditLabel}
            />

            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Location preview</h2>
              <AssetLocationMap
                lat={lat}
                lng={lng}
                label={asset.display_name}
                mapTheme={resolvedTheme}
              />
            </section>

            <MediaGallery items={mediaItems} />

            <AuditTimeline assetId={resolvedId} audits={audits} />
          </div>

          <aside className="space-y-6 lg:col-span-1">
            <AIInsights insights={aiInsights} loading={aiLoading} />

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">Actions</h2>
              <div className="mt-4 flex flex-col gap-2">
                {canEngineer ? (
                  <Link
                    to={`/app/audit?asset_id=${encodeURIComponent(resolvedId)}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    <Hammer className="size-4" />
                    Start new audit
                  </Link>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    New audits are limited to engineers and administrators.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  <Download className="size-4" />
                  Download report
                </button>

                {canEngineer ? (
                  <button
                    type="button"
                    disabled={flagBusy}
                    onClick={() => void handleToggleFlag()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-800 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-200"
                  >
                    {flagBusy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : asset.is_flagged_critical ? (
                      <ShieldOff className="size-4" />
                    ) : (
                      <Flag className="size-4" />
                    )}
                    {asset.is_flagged_critical
                      ? "Remove critical flag"
                      : "Flag as critical"}
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

export default AssetDetailPage;
