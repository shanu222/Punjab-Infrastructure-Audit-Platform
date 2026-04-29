import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  safe: "#10B981",
  moderate: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export type RiskDistribution = {
  safe?: number;
  moderate?: number;
  high?: number;
  critical?: number;
};

type Props = {
  distribution: RiskDistribution | null;
  loading: boolean;
};

export function RiskChart({ distribution, loading }: Props) {
  const data = [
    { name: "Safe", key: "safe" as const, value: distribution?.safe ?? 0 },
    { name: "Moderate", key: "moderate" as const, value: distribution?.moderate ?? 0 },
    { name: "High", key: "high" as const, value: distribution?.high ?? 0 },
    { name: "Critical", key: "critical" as const, value: distribution?.critical ?? 0 },
  ].filter((d) => d.value > 0);

  const chartData = data.length ? data : [{ name: "No data", key: "safe" as const, value: 1 }];

  if (loading && !distribution) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border min-h-[320px] animate-pulse flex items-center justify-center">
        <div className="h-48 w-48 rounded-full bg-muted" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-4">Risk distribution (audits)</h3>
      <div className="h-[280px] sm:h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.key] || "#94a3b8"}
                  stroke="var(--card)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [value, "Audits"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--popover)",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
