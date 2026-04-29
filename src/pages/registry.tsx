import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Search, MapPin, RefreshCw, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/utils/api.js";
import { PageHeader } from "@/components/common/PageHeader";
import { AppCard } from "@/components/common/AppCard";
import { RiskBadge } from "@/components/common/RiskBadge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Skeleton } from "@/app/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

type Row = {
  _id: string;
  type: string;
  district: string;
  risk_score: number | null;
  display_name?: string;
};

function riskLevel(score: number | null): string {
  if (score == null) return "UNKNOWN";
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "SAFE";
}

export function AssetRegistryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/assets");
      const list = (res?.data?.assets as Row[]) || [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e: unknown) {
      toast.error("Could not load assets", {
        description: e instanceof Error ? e.message : "Network error",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const types = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.type || "other"));
    return Array.from(s).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (!debounced) return true;
      const hay = `${r.display_name || ""} ${r.type} ${r.district}`.toLowerCase();
      return hay.includes(debounced);
    });
  }, [rows, debounced, typeFilter]);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      <PageHeader
        title="Asset registry"
        description="Search and open infrastructure records. Links to full GIS map and per-asset detail."
        actions={
          <Button variant="outline" size="sm" className="gap-2 rounded-xl min-h-11" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <AppCard className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, type, district…"
              className="pl-10 h-11 rounded-xl bg-input-background"
              aria-label="Search assets"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-52 h-11 rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="secondary" className="rounded-xl min-h-11">
            <Link to="/app/map" className="gap-2">
              <MapPin className="size-4" />
              Open map
            </Link>
          </Button>
        </div>
      </AppCard>

      <AppCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Asset</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">District</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Risk</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground"> </th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="h-8 w-8 rounded-md inline-block" />
                    </td>
                  </tr>
                ))}
              {!loading &&
                filtered.map((r) => (
                  <motion.tr
                    key={r._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.display_name || `${r.type?.replace(/_/g, " ")} — ${r.district}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.district}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={riskLevel(r.risk_score)} />
                        <span className="text-xs text-muted-foreground tabular-nums">{r.risk_score ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" className="rounded-lg gap-1" asChild>
                        <Link to={`/app/assets/${r._id}`}>
                          View
                          <ChevronRight className="size-4" />
                        </Link>
                      </Button>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No assets match your filters.</p>
        )}
      </AppCard>
    </div>
  );
}

export default AssetRegistryPage;
