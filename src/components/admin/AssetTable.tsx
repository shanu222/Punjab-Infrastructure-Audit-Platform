import { Building2, Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type AdminAssetRow = {
  asset_id: string;
  display_name?: string;
  type: string;
  district: string;
  risk_score: number | null;
  is_flagged_critical?: boolean;
};

type SortKey = "display_name" | "type" | "district" | "risk";

type Props = {
  assets: AdminAssetRow[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onAdd: () => void;
  onEdit: (a: AdminAssetRow) => void;
  onDelete: (a: AdminAssetRow) => void;
};

function riskLabel(a: AdminAssetRow): string {
  if (a.is_flagged_critical) return "Critical (flagged)";
  if (a.risk_score == null) return "—";
  if (a.risk_score >= 75) return "High";
  if (a.risk_score >= 50) return "Elevated";
  return "Low";
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
}

export function AssetTable({ assets, loading, sortKey, sortDir, onSort, onAdd, onEdit, onDelete }: Props) {
  const th = (key: SortKey, label: string) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
      <button type="button" onClick={() => onSort(key)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          Add asset
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {th("display_name", "Asset")}
              {th("type", "Type")}
              {th("district", "District")}
              {th("risk", "Risk level")}
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading assets…
                </td>
              </tr>
            )}
            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No assets yet.
                </td>
              </tr>
            )}
            {!loading &&
              assets.map((a) => (
                <tr key={a.asset_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">{a.display_name || `${a.type} — ${a.district}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{String(a.type).replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.district}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        riskLabel(a).startsWith("Critical")
                          ? "bg-destructive/15 text-destructive"
                          : riskLabel(a) === "High"
                            ? "bg-orange-500/15 text-orange-700 dark:text-orange-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {riskLabel(a)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button type="button" onClick={() => onEdit(a)} className="p-2 rounded-lg hover:bg-muted text-primary">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => onDelete(a)} className="p-2 rounded-lg hover:bg-muted text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
