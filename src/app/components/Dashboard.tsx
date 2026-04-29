import { StatCard } from "./StatCard";
import { RiskBadge } from "./RiskBadge";
import { Building2, AlertTriangle, CheckCircle, TrendingUp, Brain, MapPin } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "motion/react";
import { Link } from "react-router";

const riskOverTimeData = [
  { month: 'Jan', safe: 120, moderate: 45, high: 28, critical: 12 },
  { month: 'Feb', safe: 125, moderate: 42, high: 25, critical: 10 },
  { month: 'Mar', safe: 130, moderate: 40, high: 22, critical: 8 },
  { month: 'Apr', safe: 135, moderate: 38, high: 20, critical: 7 },
];

const assetDistribution = [
  { name: 'Bridges', value: 145, color: '#3b82f6' },
  { name: 'Buildings', value: 230, color: '#10B981' },
  { name: 'Roads', value: 180, color: '#f59e0b' },
  { name: 'Dams', value: 45, color: '#8b5cf6' },
];

const recentAudits = [
  { id: 'A001', name: 'Ravi Bridge, Lahore', risk: 'high', date: '2026-04-28', engineer: 'Ahmed Khan' },
  { id: 'A002', name: 'DHQ Hospital, Multan', risk: 'moderate', date: '2026-04-27', engineer: 'Sara Ali' },
  { id: 'A003', name: 'GT Road Section 12', risk: 'safe', date: '2026-04-26', engineer: 'Usman Sheikh' },
  { id: 'A004', name: 'Mangla Dam Gate 3', risk: 'critical', date: '2026-04-25', engineer: 'Fatima Malik' },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Real-time infrastructure risk monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Infrastructure"
          value="1,247"
          icon={Building2}
          trend="12% from last month"
          trendUp={true}
          color="bg-primary"
        />
        <StatCard
          title="High Risk Assets"
          value="87"
          icon={AlertTriangle}
          trend="5% decrease"
          trendUp={false}
          color="bg-[#f97316]"
        />
        <StatCard
          title="Recently Audited"
          value="156"
          icon={CheckCircle}
          trend="This month"
          color="bg-secondary"
        />
        <StatCard
          title="AI Predictions Active"
          value="34"
          icon={Brain}
          trend="Running models"
          color="bg-[#8b5cf6]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20"
      >
        <div className="flex items-start gap-4">
          <div className="bg-primary/20 p-3 rounded-lg">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">AI Insight</h3>
            <p className="text-foreground/80">
              32% of bridges in South Punjab show high flood vulnerability. Recommended: Immediate structural assessment and reinforcement planning.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Risk Distribution Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="safe" stackId="1" stroke="#10B981" fill="#10B981" />
              <Area type="monotone" dataKey="moderate" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#f97316" fill="#f97316" />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Asset Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={assetDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {assetDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Recent Audits</h3>
          <Link to="/app/map" className="text-primary hover:underline text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Asset ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Engineer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {recentAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {audit.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {audit.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <RiskBadge level={audit.risk as any} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {audit.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {audit.engineer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/app/assets/${audit.id}`}
                      className="text-primary hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl p-6 shadow-sm border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Quick Map Preview</h3>
          <Link to="/app/map" className="flex items-center gap-2 text-primary hover:underline text-sm">
            <MapPin className="w-4 h-4" />
            Open Full Map
          </Link>
        </div>
        <div className="bg-muted/30 rounded-lg h-64 flex items-center justify-center border border-border">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Interactive GIS map with infrastructure pins</p>
            <p className="text-sm text-muted-foreground mt-1">Color-coded by risk level</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
