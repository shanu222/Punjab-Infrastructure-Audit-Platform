import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { RiskBadge } from "@/app/components/RiskBadge";
import type { GisMapAsset } from "./types";
import { riskLevelToBadgeKey } from "./mapUtils";

type Props = {
  asset: GisMapAsset | null;
  onClose: () => void;
};

function formatAuditDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function AssetDetailsPanel({ asset, onClose }: Props) {
  return (
    <AnimatePresence>
      {asset && (
        <motion.aside
          key={asset.id}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="pointer-events-auto absolute right-0 top-0 z-20 flex h-full w-full max-w-md flex-col border-l border-border bg-card/98 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border p-5">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">
                {asset.name}
              </h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {asset.id}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-1.5 hover:bg-muted"
              aria-label="Close details"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Risk
              </p>
              <RiskBadge level={riskLevelToBadgeKey(asset.risk_level)} />
              {typeof asset.risk_score === "number" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Composite score:{" "}
                  <span className="font-medium text-foreground">
                    {asset.risk_score}
                  </span>{" "}
                  / 100
                </p>
              )}
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Type
              </p>
              <p className="capitalize text-foreground">
                {asset.type?.replace(/_/g, " ") || "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                District
              </p>
              <p className="text-foreground">{asset.district || "—"}</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Location
              </p>
              <p className="font-mono text-sm text-foreground">
                {typeof asset.lat === "number" && typeof asset.lng === "number"
                  ? `${asset.lat.toFixed(5)}°N, ${asset.lng.toFixed(5)}°E`
                  : "—"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last audit
              </p>
              <p className="text-foreground">
                {formatAuditDate(asset.last_audit_at ?? undefined)}
              </p>
            </div>

            <Link
              to={`/app/assets/${asset.id}`}
              className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View full details
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
