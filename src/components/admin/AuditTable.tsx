import { Eye, CheckCircle, Flag, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type AdminAuditRow = {
  _id: string;
  createdAt?: string;
  overall_risk?: string;
  admin_status?: string;
  asset_id?: { district?: string; type?: string; _id?: string };
  engineer_id?: { name?: string; email?: string; _id?: string };
};

type SortKey = "createdAt" | "overall_risk" | "engineer" | "district";

type Props = {
  audits: AdminAuditRow[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onView: (a: AdminAuditRow) => void;
  onApprove: (a: AdminAuditRow) => void;
  onFlag: (a: AdminAuditRow) => void;
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
}

export function AuditTable({ audits, loading, sortKey, sortDir, onSort, onView, onApprove, onFlag }: Props) {
  const th = (key: SortKey, label: string) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
      <button type="button" onClick={() => onSort(key)} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <SortIcon active={sortKey === key} dir={sortDir} />
      </button>
    </th>
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-x-auto">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {th("createdAt", "Date")}
            {th("district", "Asset / district")}
            {th("engineer", "Engineer")}
            {th("overall_risk", "Risk")}
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Review</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                Loading audits…
              </td>
            </tr>
          )}
          {!loading && audits.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No audits match filters.
              </td>
            </tr>
          )}
          {!loading &&
            audits.map((a) => (
              <tr key={a._id} className="hover:bg-muted/30">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium capitalize">{a.asset_id?.type?.replace(/_/g, " ") || "—"}</span>
                  <span className="text-muted-foreground"> · {a.asset_id?.district || "—"}</span>
                </td>
                <td className="px-4 py-3">{a.engineer_id?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted">{a.overall_risk || "—"}</span>
                </td>
                <td className="px-4 py-3 capitalize text-xs">{a.admin_status || "pending"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button type="button" onClick={() => onView(a)} className="p-2 rounded-lg hover:bg-muted" title="View">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onApprove(a)} className="p-2 rounded-lg hover:bg-muted text-emerald-600" title="Approve">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => onFlag(a)} className="p-2 rounded-lg hover:bg-muted text-orange-600" title="Flag">
                    <Flag className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
