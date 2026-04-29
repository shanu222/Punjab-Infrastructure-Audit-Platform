import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type TrendPoint = { period: string; audits: number };

type Props = {
  data: TrendPoint[];
  loading: boolean;
};

export function TrendChart({ data, loading }: Props) {
  const chartData =
    data && data.length
      ? data
      : [{ period: "—", audits: 0 }];

  if (loading && (!data || !data.length)) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border min-h-[300px] animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-[220px] bg-muted/50 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border">
      <h3 className="font-semibold text-foreground mb-4">Audit trend by month</h3>
      <div className="h-[260px] sm:h-[300px] w-full min-w-0 overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%" minWidth={320}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Line
              type="monotone"
              dataKey="audits"
              name="Audits"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
