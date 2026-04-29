import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Radio,
  Save,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAssetsList, createAuditRequest } from "@/services/auditService.js";
import { getStoredUser } from "@/utils/authStorage.js";
import type { ListAsset } from "@/components/audit/AssetSelector";
import { AssetSelector } from "@/components/audit/AssetSelector";
import { StructuralChecklist } from "@/components/audit/StructuralChecklist";
import { DisasterSection } from "@/components/audit/DisasterSection";
import { ScorePanel } from "@/components/audit/ScorePanel";
import { MediaUpload, type MediaSlot } from "@/components/audit/MediaUpload";
import { NotesInput } from "@/components/audit/NotesInput";
import type { StructuralUi, DisasterUi, AuditScores } from "@/utils/auditScoring";
import {
  structuralUiToChecklist,
  structuralScoreFromChecklist,
  disasterUiToAssessment,
  disasterScoresFromAssessment,
  buildScores,
  assessRiskFromScores,
  aiAssistWarnings,
} from "@/utils/auditScoring";

const STEPS = [
  "Asset",
  "Structural",
  "Disaster",
  "Media & submit",
] as const;

const INITIAL_STRUCT: StructuralUi = {
  cracks: null,
  foundation: null,
  load_capacity: null,
  corrosion: null,
};

const INITIAL_DISASTER: DisasterUi = {
  flood: null,
  earthquake: null,
  heat: null,
};

export function AuditFormPage() {
  const user = getStoredUser();
  const canSubmit =
    user?.role === "admin" || user?.role === "engineer";

  const [searchParams] = useSearchParams();
  const presetAssetId = searchParams.get("asset_id")?.trim() || null;

  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [assets, setAssets] = useState<ListAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [aiOn, setAiOn] = useState(true);

  const [assetId, setAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ListAsset | null>(null);

  const [structural, setStructural] = useState<StructuralUi>(INITIAL_STRUCT);
  const [disaster, setDisaster] = useState<DisasterUi>(INITIAL_DISASTER);

  const [mediaSlots, setMediaSlots] = useState<MediaSlot[]>([]);
  const [notes, setNotes] = useState("");

  const [gps, setGps] = useState<{
    lat: number;
    lng: number;
    accuracy_m?: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy,
        });
        setGpsError(null);
      },
      (err) => {
        setGpsError(err.message || "GPS unavailable");
      },
      { enableHighAccuracy: true, timeout: 18_000, maximumAge: 60_000 },
    );
  }, []);

  const loadAssets = useCallback(async () => {
    setAssetsLoading(true);
    try {
      const res = await fetchAssetsList();
      const list = (res?.data?.assets as ListAsset[]) || [];
      setAssets(Array.isArray(list) ? list : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load assets";
      toast.error("Could not load assets", { description: msg });
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (!presetAssetId || !assets.length) return;
    const found = assets.find(
      (a) => String(a._id || a.asset_id) === presetAssetId,
    );
    if (found) {
      setAssetId(presetAssetId);
      setSelectedAsset(found);
    }
  }, [presetAssetId, assets]);

  const checklist = useMemo(
    () => structuralUiToChecklist(structural),
    [structural],
  );
  const disasterAssess = useMemo(
    () => disasterUiToAssessment(disaster),
    [disaster],
  );

  const scores: AuditScores | null = useMemo(() => {
    if (!checklist || !disasterAssess) return null;
    const s = structuralScoreFromChecklist(checklist);
    const d = disasterScoresFromAssessment(disasterAssess);
    return buildScores(s, d);
  }, [checklist, disasterAssess]);

  const aiLines = useMemo(() => {
    if (!aiOn) return [];
    return aiAssistWarnings(checklist, scores);
  }, [aiOn, checklist, scores]);

  const refreshGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy_m: pos.coords.accuracy,
        });
        setGpsError(null);
        toast.success("Location updated");
      },
      (err) => setGpsError(err.message || "GPS error"),
      { enableHighAccuracy: true, timeout: 18_000 },
    );
  };

  const canNext = () => {
    if (step === 0) return Boolean(assetId && selectedAsset);
    if (step === 1) return Boolean(checklist);
    if (step === 2) return Boolean(disasterAssess);
    return true;
  };

  const submit = async () => {
    if (!canSubmit) {
      toast.error("Only engineers and administrators can submit audits.");
      return;
    }
    if (!assetId || !checklist || !disasterAssess || !scores) {
      toast.error("Complete all required sections first.");
      return;
    }
    const keys = mediaSlots
      .filter((m) => m.key && !m.error && !m.uploading)
      .map((m) => m.key as string);
    if (keys.length === 0) {
      const ok = window.confirm(
        "No media attached yet. Field audits usually include at least one photo. Submit anyway?",
      );
      if (!ok) return;
    }
    if (mediaSlots.some((m) => m.uploading)) {
      toast.error("Wait for uploads to finish.");
      return;
    }
    if (mediaSlots.some((m) => m.error && !m.key)) {
      toast.error("Remove failed uploads or retry before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        asset_id: assetId,
        structural_checklist: checklist,
        disaster_assessment: disasterAssess,
        scores,
        media_urls: keys,
        notes: notes.trim(),
      };
      if (gps && typeof gps.lat === "number" && typeof gps.lng === "number") {
        payload.capture_location = {
          lat: gps.lat,
          lng: gps.lng,
          ...(typeof gps.accuracy_m === "number"
            ? { accuracy_m: gps.accuracy_m }
            : {}),
        };
      }
      const res = await createAuditRequest(payload);
      const band = res?.data?.risk_assessment?.overall_risk;
      toast.success("Audit submitted", {
        description: band
          ? `Recorded risk band: ${band}`
          : "Audit saved successfully.",
      });
      setStep(0);
      setStructural(INITIAL_STRUCT);
      setDisaster(INITIAL_DISASTER);
      setMediaSlots([]);
      setNotes("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submit failed";
      toast.error("Submission failed", { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (!canSubmit) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-foreground">Field audit</h1>
        <p className="text-muted-foreground">
          Audit submission is restricted to engineers and administrators. Use a
          government account to review assets and reports instead.
        </p>
        <Link
          to="/app"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 pb-28 md:px-4 md:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Field audit
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Punjab Infrastructure Audit Intelligence Platform
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!online && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-200">
              <WifiOff className="size-3.5" />
              Offline mode (UI prep)
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Radio className="size-3.5" />
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          <span className="text-sm font-medium">AI assist</span>
        </div>
        <button
          type="button"
          onClick={() => setAiOn(!aiOn)}
          className={`min-h-10 rounded-full px-4 text-sm font-semibold ${
            aiOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {aiOn ? "On" : "Off"}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {step + 1} / {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {aiLines.length > 0 && (
        <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100">
          {aiLines.map((line, i) => (
            <p key={i}>⚠ {line}</p>
          ))}
        </div>
      )}

      <ScorePanel scores={scores} />

      {assetsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-10 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {step === 0 && (
            <>
              <AssetSelector
                assets={assets}
                valueId={assetId}
                disabled={submitting}
                onChange={(id, a) => {
                  setAssetId(id);
                  setSelectedAsset(a);
                }}
              />
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Site context (auto)
                </h2>
                {selectedAsset ? (
                  <dl className="grid gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Asset</dt>
                      <dd className="font-medium text-foreground">
                        {selectedAsset.display_name ||
                          `${selectedAsset.type} — ${selectedAsset.district}`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="capitalize">{selectedAsset.type}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">District</dt>
                      <dd>{selectedAsset.district}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Engineer</dt>
                      <dd>{user?.name || user?.email || "—"}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select an asset to load details.
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    GPS capture
                  </h2>
                  <button
                    type="button"
                    onClick={refreshGps}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
                  >
                    <MapPin className="size-4" />
                    Refresh
                  </button>
                </div>
                {gps ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    {gps.lat.toFixed(5)}°, {gps.lng.toFixed(5)}°
                    {gps.accuracy_m != null
                      ? ` (±${Math.round(gps.accuracy_m)} m)`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs text-destructive">{gpsError || "Locating…"}</p>
                )}
              </div>
            </>
          )}
          {step === 1 && (
            <StructuralChecklist
              value={structural}
              onChange={setStructural}
              disabled={submitting}
            />
          )}
          {step === 2 && (
            <DisasterSection
              value={disaster}
              onChange={setDisaster}
              disabled={submitting}
            />
          )}
          {step === 3 && (
            <div className="space-y-6">
              <MediaUpload
                items={mediaSlots}
                setItems={setMediaSlots}
                disabled={submitting}
              />
              <NotesInput
                value={notes}
                onChange={setNotes}
                disabled={submitting}
              />
              {scores && (
                <p className="text-center text-xs text-muted-foreground">
                  Composite {assessRiskFromScores(scores).composite} →{" "}
                  {assessRiskFromScores(scores).overall_risk} (stored server-side)
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur-md md:static md:z-0 md:border-0 md:bg-transparent md:p-0">
        <div className="mx-auto flex max-w-2xl gap-2">
          {step > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex min-h-12 min-w-[5rem] items-center justify-center gap-1 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={submitting || !canNext()}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground disabled:opacity-50"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={
                submitting ||
                !assetId ||
                !checklist ||
                !disasterAssess ||
                !scores
              }
              onClick={() => void submit()}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-base font-semibold text-secondary-foreground disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Save className="size-5" />
              )}
              Submit audit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditFormPage;
