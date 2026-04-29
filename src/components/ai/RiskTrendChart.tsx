import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "./types";

type Props = {
  series: TrendPoint[];
  projection: TrendPoint[];
};

export function RiskTrendChart({ series, projection }: Props) {
  const merged = [
    ...(series || []).map((p) => ({
      name: p.label || p.period,
      observed: p.risk_index,
      projected: null as number | null,
    })),
    ...(projection || []).map((p) => ({
      name: p.label || p.period,
      observed: null as number | null,
      projected: p.risk_index,
    })),
  ];

  if (!merged.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        Not enough audit history to plot a trend yet.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full min-w-0 sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={36} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--border)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="observed"
            name="Observed (monthly)"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projected (model)"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 2 }}
            connectNulls
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
