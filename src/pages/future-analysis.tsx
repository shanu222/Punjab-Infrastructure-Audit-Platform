import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Brain, ChevronRight, Download, Loader2, MapPin } from "lucide-react";
import { getStoredUser } from "@/utils/authStorage.js";
import { useTheme } from "@/context/ThemeContext";
import { submitFutureAnalysis, fetchFutureAnalysisPdfBlob } from "@/services/futureService.js";
import { ProjectForm } from "@/components/future/ProjectForm";
import { MapSelector, type NearbyPin } from "@/components/future/MapSelector";
import { RiskPanel } from "@/components/future/RiskPanel";
import { HistoricalInsights } from "@/components/future/HistoricalInsights";
import { Recommendations } from "@/components/future/Recommendations";
import { ResultCard } from "@/components/future/ResultCard";
import type { FormErrors, FutureAnalysisData, FutureFormState } from "@/components/future/types";

const initialForm: FutureFormState = {
  project_name: "",
  type: "building",
  district: "",
  lat: "",
  lng: "",
  material: "",
  structural_type: "",
};

function validate(f: FutureFormState): FormErrors {
  const e: FormErrors = {};
  if (!f.project_name.trim()) e.project_name = "Required";
  if (!f.district.trim()) e.district = "Required";
  if (!f.material.trim()) e.material = "Required";
  if (!f.structural_type.trim()) e.structural_type = "Required";
  const la = Number(f.lat);
  const ln = Number(f.lng);
  if (f.lat.trim() === "" || f.lng.trim() === "") e.location = "Select a location on the map or enter coordinates.";
  if (f.lat.trim() !== "" && (Number.isNaN(la) || la < -90 || la > 90)) e.lat = "Valid latitude required";
  if (f.lng.trim() !== "" && (Number.isNaN(ln) || ln < -180 || ln > 180)) e.lng = "Valid longitude required";
  return e;
}

export function FutureInfraApproval() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const { resolvedTheme } = useTheme();
  const allowed = user?.role === "admin" || user?.role === "government";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FutureFormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FutureAnalysisData | null>(null);

  useEffect(() => {
    if (!allowed) {
      navigate("/app", { replace: true });
    }
  }, [allowed, navigate]);

  const latNum = form.lat.trim() === "" ? null : Number(form.lat);
  const lngNum = form.lng.trim() === "" ? null : Number(form.lng);

  const nearbyPins: NearbyPin[] = useMemo(() => {
    if (!result?.nearby_assets) return [];
    return result.nearby_assets
      .filter((a) => typeof a.lat === "number" && typeof a.lng === "number")
      .map((a) => ({
        id: a.id,
        lat: a.lat as number,
        lng: a.lng as number,
        label: `${a.type} · ${a.district} · ${a.distance_km} km`,
        risk_score: a.risk_score,
      }));
  }, [result]);

  const setField = useCallback(<K extends keyof FutureFormState>(key: K, value: FutureFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      if (key === "lat" || key === "lng") delete next.location;
      return next;
    });
  }, []);

  if (!allowed) {
    return null;
  }

  function handleMapLocation(lat: number, lng: number) {
    setForm((prev) => ({
      ...prev,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.lat;
      delete next.lng;
      delete next.location;
      return next;
    });
  }

  function buildPayload(): Parameters<typeof submitFutureAnalysis>[0] {
    return {
      project_name: form.project_name.trim(),
      type: form.type,
      district: form.district.trim(),
      material: form.material.trim(),
      structural_type: form.structural_type.trim(),
      location: { lat: Number(form.lat), lng: Number(form.lng) },
    };
  }

  async function runAnalysis() {
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setError("");
    setLoading(true);
    setStep(2);
    try {
      const data = (await submitFutureAnalysis(buildPayload())) as FutureAnalysisData;
      setResult(data);
      setStep(3);
    } catch (err: unknown) {
      setStep(1);
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    setError("");
    try {
      const blob = await fetchFutureAnalysisPdfBlob(buildPayload());
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `future-infrastructure-${form.project_name.replace(/\s+/g, "-").slice(0, 60)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setPdfLoading(false);
    }
  }

  function resetFlow() {
    setForm(initialForm);
    setResult(null);
    setErrors({});
    setError("");
    setStep(1);
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Future infrastructure approval</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Punjab Infrastructure Audit Intelligence Platform — location risk, historical audits, and sanction guidance.
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-0.5 rounded min-w-[12px] ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
        <span className="sr-only">Steps</span>
      </div>
      <div className="text-xs text-muted-foreground -mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span>1. Project & location</span>
        <span>2. Analysis</span>
        <span>3. Result & report</span>
      </div>

      {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm px-4 py-3">{error}</div>}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Project input
              </h2>
              <ProjectForm form={form} onChange={setField} errors={errors} />
              {errors.location && <p className="text-xs text-destructive mt-2">{errors.location}</p>}
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-semibold text-foreground mb-2">Map selection</h2>
              <MapSelector
                lat={latNum != null && !Number.isNaN(latNum) ? latNum : null}
                lng={lngNum != null && !Number.isNaN(lngNum) ? lngNum : null}
                onLocationChange={handleMapLocation}
                nearbyAssets={[]}
                mapTheme={resolvedTheme}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void runAnalysis()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
          >
            Run risk analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-border bg-card p-10 text-center space-y-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">Running geo & audit intelligence…</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Correlating proposal location with registered assets, audit history, and hazard indices.
          </p>
        </motion.div>
      )}

      {step === 3 && result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <ResultCard
            status={result.approval_status}
            explanation={result.approval_explanation}
            summaryLine={result.recommendation}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RiskPanel data={result} />
            <HistoricalInsights data={result} />
          </div>

          <Recommendations items={result.recommendations} />

          {result.nearby_assets.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-3">Nearby infrastructure (map)</h3>
              <div className="h-[280px] rounded-xl overflow-hidden border border-border">
                <MapSelector
                  lat={Number(form.lat)}
                  lng={Number(form.lng)}
                  onLocationChange={() => {}}
                  nearbyAssets={nearbyPins}
                  readOnly
                  mapTheme={resolvedTheme}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Blue pin: proposal. Coloured dots: existing assets.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={resetFlow}
              className="px-5 py-3 rounded-lg border border-border text-sm font-medium hover:bg-muted"
            >
              New analysis
            </button>
            <button
              type="button"
              disabled={pdfLoading}
              onClick={() => void downloadPdf()}
              className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF report
            </button>
          </div>
        </motion.div>
      )}

      <div className="rounded-lg border border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground flex gap-2">
        <Brain className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Outputs are decision-support only. Statutory environmental, planning, and building-control approvals remain
          required. Geo context uses registered assets within an adaptive radius when the database is sparse.
        </p>
      </div>
    </div>
  );
}
