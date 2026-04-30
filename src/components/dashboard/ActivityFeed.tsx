import { Link } from "react-router";
import { RiskBadge } from "@/app/components/RiskBadge";

export type ActivityItem = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  at: string;
  meta?: { engineer?: string };
};

type Props = {
  items: ActivityItem[];
  loading: boolean;
};

function riskFromSubtitle(sub?: string) {
  if (!sub) return "safe";
  const m = sub.match(/overall risk:\s*(\w+)/i);
  const r = (m?.[1] || "safe").toLowerCase();
  if (r === "safe" || r === "moderate" || r === "high" || r === "critical") return r;
  return "safe";
}

export function ActivityFeed({ items, loading }: Props) {
  if (loading && !items.length) {
    return (
      <div className="piap-surface overflow-hidden animate-pulse">
        <div className="p-4 border-b border-border h-10 bg-muted/40" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-4 h-16 bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="piap-surface shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between gap-2">
        <h3 className="font-semibold text-foreground">Recent activity</h3>
        <span className="text-xs text-muted-foreground">Latest audits & alerts</span>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-muted/50 sticky top-0 z-[1]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Summary
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Risk / status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                When
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((row) => {
              const date = row.at ? new Date(row.at).toLocaleString() : "—";
              const level = row.type === "audit" ? riskFromSubtitle(row.subtitle) : "high";
              const linkId = row.type === "audit" ? row.id : row.id.replace(/^asset-/, "");
              return (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm capitalize text-foreground">{row.type}</td>
                  <td className="px-4 py-3 text-sm text-foreground max-w-[280px]">
                    <div className="font-medium truncate">{row.title}</div>
                    {row.meta?.engineer && (
                      <div className="text-xs text-muted-foreground truncate">
                        Engineer: {row.meta.engineer}
                      </div>
                    )}
                    {row.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">{row.subtitle}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.type === "audit" ? (
                      <RiskBadge level={level as "safe" | "moderate" | "high" | "critical"} size="sm" />
                    ) : (
                      <span className="text-xs font-medium text-[#ef4444]">Alert</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{date}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <Link to={`/app/assets/${linkId}`} className="text-primary hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!items.length && (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent activity yet.</div>
        )}
      </div>
    </div>
  );
}
