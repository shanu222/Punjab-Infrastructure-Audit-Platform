import { motion } from "motion/react";
import { Brain, TrendingUp, Activity, Database, Zap } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const predictiveData = [
  { year: '2024', bridges: 45, buildings: 32, roads: 28, dams: 12 },
  { year: '2025', bridges: 52, buildings: 38, roads: 35, dams: 15 },
  { year: '2026', bridges: 68, buildings: 45, roads: 42, dams: 18 },
  { year: '2027', bridges: 75, buildings: 52, roads: 48, dams: 22 },
  { year: '2028', bridges: 82, buildings: 58, roads: 55, dams: 25 },
];

const riskZones = [
  { district: 'Lahore', current: 65, predicted: 78 },
  { district: 'Multan', current: 45, predicted: 52 },
  { district: 'Rawalpindi', current: 58, predicted: 68 },
  { district: 'Faisalabad', current: 42, predicted: 49 },
  { district: 'Sialkot', current: 38, predicted: 45 },
];

const aiModels = [
  { name: 'Flood Prediction Model', status: 'active', confidence: 92, updated: '2 hours ago' },
  { name: 'Earthquake Vulnerability', status: 'active', confidence: 87, updated: '5 hours ago' },
  { name: 'Heat Stress Analysis', status: 'training', confidence: 78, updated: '1 day ago' },
  { name: 'Structural Degradation', status: 'active', confidence: 94, updated: '30 mins ago' },
];

export function AIRiskDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">AI Risk Analysis Dashboard</h1>
        <p className="text-muted-foreground">Advanced predictive analytics and machine learning insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-6 shadow-lg"
        >
          <Brain className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-white/80 text-sm mb-1">Active Models</p>
          <p className="text-3xl font-semibold">4</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-secondary to-secondary/80 text-white rounded-xl p-6 shadow-lg"
        >
          <Activity className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-white/80 text-sm mb-1">Predictions Today</p>
          <p className="text-3xl font-semibold">1,247</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#8b5cf6] to-[#8b5cf6]/80 text-white rounded-xl p-6 shadow-lg"
        >
          <Database className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-white/80 text-sm mb-1">Training Data</p>
          <p className="text-3xl font-semibold">45K</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#f59e0b] to-[#f59e0b]/80 text-white rounded-xl p-6 shadow-lg"
        >
          <Zap className="w-10 h-10 mb-3 opacity-90" />
          <p className="text-white/80 text-sm mb-1">Avg Confidence</p>
          <p className="text-3xl font-semibold">88%</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Predictive Risk Trends (5-Year Forecast)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={predictiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bridges" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="buildings" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="roads" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="dams" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-6 shadow-sm border border-border"
        >
          <h3 className="font-semibold text-foreground mb-4">Future Risk Zones (Current vs Predicted)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskZones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="district" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current Risk" />
              <Bar dataKey="predicted" fill="#ef4444" name="Predicted Risk (2029)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-xl p-6 shadow-sm border border-border"
      >
        <h3 className="font-semibold text-foreground mb-6">AI Models Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiModels.map((model, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="border border-border rounded-lg p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    model.status === 'active' ? 'bg-[#10B981] animate-pulse' : 'bg-[#f59e0b]'
                  }`} />
                  <div>
                    <h4 className="font-medium text-foreground">{model.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{model.status}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Confidence Level</span>
                    <span className="text-sm font-medium text-foreground">{model.confidence}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${model.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-foreground">{model.updated}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Flood Prediction</h4>
              <p className="text-xs text-muted-foreground">Next 90 days</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 mb-4">
            High probability of flooding in southern districts. 156 assets at elevated risk.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '92%' }} />
            </div>
            <span className="text-sm font-medium">92%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-br from-[#ef4444]/10 to-[#ef4444]/5 rounded-xl p-6 border border-[#ef4444]/20"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#ef4444]/20 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-[#ef4444]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Earthquake Risk</h4>
              <p className="text-xs text-muted-foreground">Vulnerability Index</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 mb-4">
            87 structures require immediate seismic reinforcement based on geological data.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#ef4444]" style={{ width: '87%' }} />
            </div>
            <span className="text-sm font-medium">87%</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-br from-[#f59e0b]/10 to-[#f59e0b]/5 rounded-xl p-6 border border-[#f59e0b]/20"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-[#f59e0b]/20 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Heat Stress</h4>
              <p className="text-xs text-muted-foreground">Climate Impact</p>
            </div>
          </div>
          <p className="text-sm text-foreground/80 mb-4">
            Rising temperatures affecting 234 concrete structures. Material degradation accelerating.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#f59e0b]" style={{ width: '78%' }} />
            </div>
            <span className="text-sm font-medium">78%</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="bg-card rounded-xl p-6 shadow-sm border border-border"
      >
        <h3 className="font-semibold text-foreground mb-4">Data Sources & Model Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Training Data Sources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Historical audit records (2010-2026)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Meteorological data (Pakistan Met Dept)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Geological surveys (PMD Seismic)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Structural engineering reports
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Model Architecture</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                Deep learning neural networks
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                Time series forecasting (LSTM)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                Computer vision (crack detection)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                Ensemble methods for validation
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
