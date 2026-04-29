import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type AdminLogRow = {
  id: string;
  user: { name?: string; email?: string } | null;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
};

type SortKey = "timestamp" | "action" | "user";

type Props = {
  logs: AdminLogRow[];
  loading: boolean;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
};

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />;
  return dir === "asc" ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />;
}

export function LogsTable({ logs, loading, sortKey, sortDir, onSort }: Props) {
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
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {th("user", "User")}
            {th("action", "Action")}
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Entity</th>
            {th("timestamp", "Timestamp")}
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                Loading logs…
              </td>
            </tr>
          )}
          {!loading && logs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No log entries.
              </td>
            </tr>
          )}
          {!loading &&
            logs.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{row.user?.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{row.user?.email || ""}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{row.action}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs break-all max-w-[200px]">{row.entity}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                  {row.timestamp ? new Date(row.timestamp).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{row.ip || "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
