import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { RiskBadge } from "./RiskBadge";
import { ArrowLeft, MapPin, Calendar, Hammer, AlertTriangle, Brain, Download, Image, Video } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const riskPrediction = [
  { year: '2024', risk: 45 },
  { year: '2025', risk: 52 },
  { year: '2026', risk: 68 },
  { year: '2027', risk: 75 },
  { year: '2028', risk: 82 },
  { year: '2029', risk: 88 },
];

const auditHistory = [
  { date: '2026-04-28', event: 'Structural Inspection', engineer: 'Ahmed Khan', status: 'High Risk Identified' },
  { date: '2026-01-15', event: 'Routine Audit', engineer: 'Sara Ali', status: 'Moderate Risk' },
  { date: '2025-10-20', event: 'Flood Assessment', engineer: 'Usman Sheikh', status: 'Moderate Risk' },
  { date: '2025-07-12', event: 'Safety Inspection', engineer: 'Fatima Malik', status: 'Low Risk' },
];

export function AssetDetail() {
  const { id } = useParams();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/app/map"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Ravi Bridge, Lahore</h1>
          <p className="text-muted-foreground">Asset ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-semibold text-xl text-foreground mb-2">Risk Assessment</h2>
                <RiskBadge level="high" size="lg" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-foreground">68</p>
                <p className="text-sm text-muted-foreground">Risk Score</p>
              </div>
            </div>

            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-16 h-16 text-muted-foreground" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium">Ravi River, Lahore</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                <p className="font-mono text-sm">31.5°N, 74.3°E</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">District</p>
                <p className="font-medium">Lahore</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Type</p>
                <p className="font-medium">Bridge</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Structural Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Material</p>
                <p className="font-medium">Reinforced Concrete</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Age</p>
                <p className="font-medium">42 Years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Length</p>
                <p className="font-medium">450 meters</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Load Capacity</p>
                <p className="font-medium">50 tons</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Maintenance</p>
                <p className="font-medium">March 2024</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Construction Year</p>
                <p className="font-medium">1984</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Media Gallery</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-border hover:border-primary transition-colors cursor-pointer">
                  {i === 4 ? (
                    <Video className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Audit History</h3>
            <div className="space-y-4">
              {auditHistory.map((audit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    {index < auditHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-foreground">{audit.event}</p>
                      <p className="text-sm text-muted-foreground">{audit.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Engineer: {audit.engineer}</p>
                    <p className="text-sm text-foreground mt-1">{audit.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">AI Insights</h3>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Risk Prediction (5 Years)</h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={riskPrediction}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground mt-2">
                  Predicted to reach critical risk level by 2028
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">AI Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                    <span>Immediate foundation reinforcement required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                    <span>Install flood monitoring sensors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                    <span>Conduct seismic stress test</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                    <span>Replace corroded support beams</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Confidence Level</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '87%' }} />
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/app/audit"
                className="flex items-center gap-2 w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Hammer className="w-5 h-5" />
                New Audit
              </Link>
              <Link
                to={`/app/reports/${id}`}
                className="flex items-center gap-2 w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Download className="w-5 h-5" />
                Generate Report
              </Link>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Disaster Vulnerability</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Flood Risk</span>
                  <span className="text-sm font-medium text-[#ef4444]">85%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#ef4444]" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Earthquake Risk</span>
                  <span className="text-sm font-medium text-[#f97316]">62%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#f97316]" style={{ width: '62%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Heat Stress</span>
                  <span className="text-sm font-medium text-[#f59e0b]">45%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#f59e0b]" style={{ width: '45%' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
