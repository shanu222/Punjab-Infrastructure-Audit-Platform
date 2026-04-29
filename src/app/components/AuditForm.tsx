import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Mic, MapPin, Save, Brain, CheckCircle, AlertCircle } from "lucide-react";

export function AuditForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);

  const sections = [
    'Basic Info',
    'Structural Checklist',
    'Disaster Assessment',
    'Media & Notes'
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Field Audit Form</h1>
        <p className="text-muted-foreground">Complete structural inspection</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                currentSection === index
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-primary/5 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
        </div>
        <button
          onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            aiAssistEnabled
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {aiAssistEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {currentSection === 0 && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-4">
              <h3 className="font-semibold text-foreground mb-4">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asset ID</label>
                <input
                  type="text"
                  value="A001"
                  disabled
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asset Name</label>
                <input
                  type="text"
                  placeholder="Enter asset name"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asset Type</label>
                <select className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Bridge</option>
                  <option>Building</option>
                  <option>Road</option>
                  <option>Dam</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Auto-captured via GPS"
                    className="flex-1 px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 1 && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Structural Checklist</h3>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-foreground">Visible Cracks</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#10B981] text-white rounded text-sm">No</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Minor</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Major</button>
                    </div>
                  </div>
                  {aiAssistEnabled && (
                    <p className="text-xs text-primary bg-primary/10 rounded p-2">
                      💡 AI Tip: Upload a photo for automatic crack detection
                    </p>
                  )}
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-foreground">Foundation Stability</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Stable</button>
                      <button className="px-3 py-1 bg-[#f59e0b] text-white rounded text-sm">Moderate</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Unstable</button>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-foreground">Load Bearing Capacity</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-[#10B981] text-white rounded text-sm">Good</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Fair</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Poor</button>
                    </div>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-medium text-foreground">Material Corrosion</label>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">None</button>
                      <button className="px-3 py-1 bg-muted text-muted-foreground rounded text-sm">Light</button>
                      <button className="px-3 py-1 bg-[#f97316] text-white rounded text-sm">Severe</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 2 && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Disaster Assessment</h3>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <label className="font-medium text-foreground block mb-3">Flood Resilience</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Elevated foundation</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Drainage system present</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Flood barriers installed</span>
                    </label>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <label className="font-medium text-foreground block mb-3">Earthquake Resistance</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Seismic design implemented</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Flexible joints present</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Reinforced structure</span>
                    </label>
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <label className="font-medium text-foreground block mb-3">Heat Stress Resistance</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="65"
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">Resistance Level: 65%</p>
                </div>
              </div>

              {aiAssistEnabled && (
                <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">AI Risk Calculation</p>
                      <p className="text-sm text-foreground/80">Based on inputs: Estimated risk score is 68/100 (High Risk)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentSection === 3 && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Media & Notes</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Photos</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="aspect-square bg-muted/30 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors">
                      <Camera className="w-8 h-8 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </button>
                    <div className="aspect-square bg-primary/10 rounded-lg border border-primary/20 relative">
                      <div className="absolute top-1 right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="aspect-square bg-primary/10 rounded-lg border border-primary/20 relative">
                      <div className="absolute top-1 right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  {aiAssistEnabled && (
                    <p className="text-xs text-primary mt-2">✨ AI will analyze photos for structural defects</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Voice Notes</label>
                  <button className="w-full px-4 py-3 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/20 transition-colors">
                    <Mic className="w-5 h-5 text-secondary" />
                    <span className="text-secondary font-medium">Record Voice Note</span>
                  </button>
                  <div className="mt-2 space-y-2">
                    <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                        <Mic className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Voice Note 1</p>
                        <p className="text-xs text-muted-foreground">2:34 mins</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Enter any additional observations..."
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span className="text-sm font-medium">GPS Location Captured</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">31.5204°N, 74.3587°E</p>
                  <p className="text-xs text-muted-foreground mt-1">Accuracy: ±5 meters</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="mt-6 flex gap-3">
        {currentSection > 0 && (
          <button
            onClick={() => setCurrentSection(currentSection - 1)}
            className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Previous
          </button>
        )}
        {currentSection < sections.length - 1 ? (
          <button
            onClick={() => setCurrentSection(currentSection + 1)}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Next Section
          </button>
        ) : (
          <button className="flex-1 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Submit Audit
          </button>
        )}
      </div>

      <div className="mt-4 bg-muted/30 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Offline mode active. Data will sync when connection is restored.
        </p>
      </div>
    </div>
  );
}
