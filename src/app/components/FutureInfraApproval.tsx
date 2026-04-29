import { useState } from "react";
import { motion } from "motion/react";
import { Building2, MapPin, Upload, Brain, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export function FutureInfraApproval() {
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setResults({
        compliance: 'approved',
        riskScore: 23,
        recommendations: [
          { type: 'success', text: 'Location is outside flood-prone zones' },
          { type: 'warning', text: 'Increase foundation depth by 2ft for seismic safety' },
          { type: 'success', text: 'Soil bearing capacity adequate for proposed structure' },
          { type: 'warning', text: 'Recommended: Use reinforced concrete grade M30 or higher' },
        ]
      });
      setStep(3);
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Future Infrastructure Approval</h1>
        <p className="text-muted-foreground">AI-powered pre-construction risk assessment</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 flex-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-1 rounded ${
                  step > s ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Project Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Infrastructure Type</label>
                <select className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Bridge</option>
                  <option>Building</option>
                  <option>Road</option>
                  <option>Dam</option>
                  <option>School</option>
                  <option>Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter location or coordinates"
                    className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Estimated Budget</label>
                  <input
                    type="text"
                    placeholder="PKR"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Expected Completion</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Continue to Design Details
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Design Specifications</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Structure Height (ft)</label>
                  <input
                    type="number"
                    placeholder="e.g., 45"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Foundation Depth (ft)</label>
                  <input
                    type="number"
                    placeholder="e.g., 12"
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Primary Material</label>
                <select className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Reinforced Concrete</option>
                  <option>Steel</option>
                  <option>Composite</option>
                  <option>Brick & Mortar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Concrete Grade</label>
                <select className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>M20</option>
                  <option>M25</option>
                  <option>M30</option>
                  <option>M40</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Design Documents</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground mb-1">Upload design blueprints</p>
                  <p className="text-sm text-muted-foreground">PDF, DWG, or images (max 50MB)</p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">AI Analysis Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI will analyze your design against disaster risks, soil conditions, and compliance standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleAnalyze}
              className="flex-1 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Run AI Analysis
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && analyzing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-xl p-12 shadow-sm border border-border text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Design...</h3>
          <p className="text-muted-foreground mb-6">AI is evaluating risk factors and compliance</p>
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}

      {step === 3 && !analyzing && results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className={`rounded-xl p-8 border-2 ${
            results.compliance === 'approved'
              ? 'bg-[#10B981]/10 border-[#10B981]'
              : 'bg-[#ef4444]/10 border-[#ef4444]'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              {results.compliance === 'approved' ? (
                <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-[#ef4444] rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-semibold text-foreground">
                  {results.compliance === 'approved' ? 'Approved with Recommendations' : 'Requires Modifications'}
                </h3>
                <p className="text-muted-foreground">AI Risk Assessment Complete</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-card/50 rounded-lg p-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Calculated Risk Score</p>
                <p className="text-3xl font-semibold text-foreground">{results.riskScore}/100</p>
              </div>
              <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981]"
                  style={{ width: `${results.riskScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Analysis Results</h3>
            <div className="space-y-3">
              {results.recommendations.map((rec: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    rec.type === 'success'
                      ? 'bg-[#10B981]/10 border border-[#10B981]/20'
                      : 'bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                  }`}
                >
                  {rec.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#f59e0b] mt-0.5" />
                  )}
                  <p className="flex-1 text-sm text-foreground">{rec.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Disaster Risk Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Flood Risk</span>
                  <span className="text-sm font-medium text-[#10B981]">Low (18%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981]" style={{ width: '18%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Earthquake Risk</span>
                  <span className="text-sm font-medium text-[#f59e0b]">Moderate (45%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#f59e0b]" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Heat Stress</span>
                  <span className="text-sm font-medium text-[#10B981]">Low (22%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981]" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1);
                setResults(null);
              }}
              className="px-6 py-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
            >
              New Analysis
            </button>
            <button className="flex-1 px-6 py-4 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium">
              Download Report
            </button>
            <button className="flex-1 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              Submit for Approval
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
