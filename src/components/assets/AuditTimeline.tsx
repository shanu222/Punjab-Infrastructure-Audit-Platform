import { format, parseISO } from "date-fns";
import { FileText, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { RiskBadge } from "@/app/components/RiskBadge";

export type AuditRow = {
  _id: string;
  createdAt?: string;
  overall_risk?: string;
  notes?: string;
  report_pdf?: string | null;
  engineer_id?: { name?: string; email?: string } | null;
  scores?: {
    structural: number;
    flood: number;
    earthquake: number;
    heat: number;
  };
};

type Props = {
  assetId: string;
  audits: AuditRow[];
};

function riskToBadge(
  r: string | undefined,
): "safe" | "moderate" | "high" | "critical" {
  const u = (r || "MODERATE").toLowerCase();
  if (u === "safe") return "safe";
  if (u === "high") return "high";
  if (u === "critical") return "critical";
  return "moderate";
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function auditScore(a: AuditRow): number | null {
  if (!a.scores) return null;
  const s = a.scores;
  const avg = (s.structural + s.flood + s.earthquake + s.heat) / 4;
  return Math.round(avg);
}

export function AuditTimeline({ assetId, audits }: Props) {
  if (!audits.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Audit history</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No audits have been submitted for this asset yet. Start a field audit
          to build the timeline.
        </p>
        <Link
          to={`/app/audit?asset_id=${encodeURIComponent(assetId)}`}
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Start new audit
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Audit history</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Newest first — PDFs open in a new tab when available.
      </p>
      <div className="mt-4 max-h-[480px] space-y-0 overflow-y-auto pr-1">
        {audits.map((a, index) => (
          <motion.div
            key={a._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex gap-3 border-b border-border py-4 last:border-0"
          >
            <div className="flex flex-col items-center pt-1">
              <div className="size-2.5 rounded-full bg-primary shadow ring-2 ring-primary/30" />
              {index < audits.length - 1 && (
                <div className="mt-1 w-px flex-1 min-h-[2rem] bg-border" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    Field audit
                    {auditScore(a) != null ? (
                      <span className="ml-2 font-mono text-sm text-muted-foreground">
                        score ~{auditScore(a)}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(a.createdAt)}
                  </p>
                </div>
                <RiskBadge level={riskToBadge(a.overall_risk)} size="sm" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Engineer:{" "}
                <span className="font-medium text-foreground">
                  {a.engineer_id?.name || "—"}
                </span>
              </p>
              {a.notes ? (
                <p className="mt-2 line-clamp-3 text-sm text-foreground/90">
                  {a.notes}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {a.report_pdf ? (
                  <a
                    href={a.report_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                  >
                    <FileText className="size-3.5" />
                    View full report (PDF)
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
                <Link
                  to={`/app/reports/${a._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/15"
                >
                  Report workspace
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
