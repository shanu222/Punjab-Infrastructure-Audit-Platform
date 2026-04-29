import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MapPin } from "lucide-react";
import type { HighRiskZone } from "./types";

type Props = {
  zones: HighRiskZone[];
};

export function ZonePanel({ zones }: Props) {
  const chartData = (zones || []).slice(0, 10).map((z) => ({
    district: z.district || "—",
    audits: z.high_risk_audit_count ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="size-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">High-risk districts</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        Ranked by count of HIGH / CRITICAL audits (live aggregates). Flood, seismic,
        and heat overlays on the GIS map complement this list.
      </p>
      {chartData.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          No high-risk concentration detected yet — encourage field submissions to
          populate this panel.
        </p>
      ) : (
        <div className="h-[260px] w-full min-w-0 sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="district"
                width={88}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="audits"
                name="High / critical audits"
                fill="#dc2626"
                radius={[0, 6, 6, 0]}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <ul className="max-h-40 space-y-2 overflow-y-auto text-sm">
        {(zones || []).slice(0, 8).map((z, i) => (
          <li
            key={`${z.district}-${i}`}
            className="flex justify-between rounded-lg border border-border bg-card/60 px-3 py-2"
          >
            <span className="font-medium text-foreground">{z.district}</span>
            <span className="tabular-nums text-muted-foreground">
              {z.high_risk_audit_count} audits
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
