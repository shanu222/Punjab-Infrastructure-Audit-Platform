import { useParams, Link } from "react-router";
import { motion } from "motion/react";
import { Download, Share2, Printer, ArrowLeft, FileText, Image, CheckCircle } from "lucide-react";
import { RiskBadge } from "./RiskBadge";

export function ReportGeneration() {
  const { id } = useParams();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/app/assets/${id}`}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Audit Report</h1>
            <p className="text-muted-foreground">Asset ID: {id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
      >
        <div className="bg-primary text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Infrastructure Audit Report</h2>
              <p className="text-white/80">Punjab Infrastructure Audit Intelligence Platform</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Report ID</p>
              <p className="font-mono">RPT-2026-{id}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Asset Overview
            </h3>
            <div className="grid grid-cols-2 gap-6 bg-muted/30 rounded-lg p-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asset Name</p>
                <p className="font-medium text-foreground">Ravi Bridge, Lahore</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asset Type</p>
                <p className="font-medium text-foreground">Bridge</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="font-medium text-foreground">Ravi River, Lahore District</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Audit Date</p>
                <p className="font-medium text-foreground">April 28, 2026</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Engineer</p>
                <p className="font-medium text-foreground">Ahmed Khan (ENG-2451)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Construction Year</p>
                <p className="font-medium text-foreground">1984 (42 years old)</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Risk Assessment Summary</h3>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Overall Risk Level</p>
                  <RiskBadge level="high" size="lg" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <p className="text-4xl font-semibold text-foreground">68<span className="text-xl">/100</span></p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Flood Risk</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#ef4444]" style={{ width: '85%' }} />
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Seismic Risk</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#f97316]" style={{ width: '62%' }} />
                    </div>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Heat Stress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-[#f59e0b]" style={{ width: '45%' }} />
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Inspection Findings</h3>
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Structural Integrity</p>
                    <p className="text-sm text-muted-foreground">Foundation shows signs of erosion. Multiple cracks detected in support pillars (Grade: Moderate).</p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Load Capacity</p>
                    <p className="text-sm text-muted-foreground">Current load capacity: 50 tons. Recommended maximum: 35 tons due to structural degradation.</p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-1">Material Condition</p>
                    <p className="text-sm text-muted-foreground">Severe corrosion detected in reinforcement bars. Concrete spalling observed in 3 locations.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Photographic Evidence</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center border border-border">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">6 high-resolution images captured during inspection</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Engineer Notes</h3>
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-foreground leading-relaxed">
                Bridge shows significant signs of aging and environmental stress. Foundation has been compromised by repeated flood events.
                Immediate action required to prevent catastrophic failure during monsoon season. Traffic load restrictions recommended until
                structural reinforcement is completed. Priority rating: HIGH.
              </p>
            </div>
          </section>

          <section className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="bg-primary/20 p-2 rounded-lg">🤖</span>
              AI Recommendations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-card/50 rounded-lg p-4">
                <div className="w-6 h-6 bg-[#ef4444] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</div>
                <div>
                  <p className="font-medium text-foreground mb-1">Immediate Foundation Reinforcement</p>
                  <p className="text-sm text-muted-foreground">Install additional support piles to stabilize eroded foundation. Estimated cost: PKR 15M</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card/50 rounded-lg p-4">
                <div className="w-6 h-6 bg-[#f97316] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</div>
                <div>
                  <p className="font-medium text-foreground mb-1">Corrosion Treatment</p>
                  <p className="text-sm text-muted-foreground">Apply anti-corrosion coating to exposed reinforcement. Replace severely damaged sections.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card/50 rounded-lg p-4">
                <div className="w-6 h-6 bg-[#f59e0b] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</div>
                <div>
                  <p className="font-medium text-foreground mb-1">Flood Monitoring System</p>
                  <p className="text-sm text-muted-foreground">Install real-time water level sensors and structural stress monitors.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card/50 rounded-lg p-4">
                <div className="w-6 h-6 bg-[#10B981] text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">4</div>
                <div>
                  <p className="font-medium text-foreground mb-1">Traffic Restrictions</p>
                  <p className="text-sm text-muted-foreground">Reduce maximum load to 35 tons until repairs are completed. Install weight monitoring system.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4">Certification</h3>
            <div className="bg-muted/30 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inspected By</p>
                  <p className="font-medium text-foreground">Ahmed Khan</p>
                  <p className="text-sm text-muted-foreground">Senior Engineer, Punjab PWD</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Approved By</p>
                  <p className="font-medium text-foreground">Dr. Sara Malik</p>
                  <p className="text-sm text-muted-foreground">Chief Engineer, Infrastructure Division</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  This report was generated using the Punjab Infrastructure Audit Intelligence Platform on April 29, 2026.
                  Report ID: RPT-2026-{id}. This document is certified by the Government of Punjab, Public Works Department.
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
