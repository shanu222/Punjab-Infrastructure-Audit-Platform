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
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            interval="preserveStartEnd"
            stroke="var(--border)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            width={36}
            stroke="var(--border)"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--popover)",
              color: "var(--popover-foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Legend wrapperStyle={{ color: "var(--foreground)" }} />
          <Line
            type="monotone"
            dataKey="observed"
            name="Observed (monthly)"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive
          />
          <Line
            type="monotone"
            dataKey="projected"
            name="Projected (model)"
            stroke="var(--chart-3)"
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
