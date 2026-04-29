import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Filter, Layers, X, Search } from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { Link } from "react-router";

const assets = [
  { id: 'A001', name: 'Ravi Bridge', type: 'Bridge', district: 'Lahore', risk: 'high', lat: 31.5, lng: 74.3 },
  { id: 'A002', name: 'DHQ Hospital', type: 'Building', district: 'Multan', risk: 'moderate', lat: 30.2, lng: 71.5 },
  { id: 'A003', name: 'GT Road Section 12', type: 'Road', district: 'Rawalpindi', risk: 'safe', lat: 33.6, lng: 73.0 },
  { id: 'A004', name: 'Mangla Dam Gate 3', type: 'Dam', district: 'Mirpur', risk: 'critical', lat: 33.1, lng: 73.6 },
  { id: 'A005', name: 'Faisalabad Bridge', type: 'Bridge', district: 'Faisalabad', risk: 'moderate', lat: 31.4, lng: 73.1 },
  { id: 'A006', name: 'City Hall', type: 'Building', district: 'Islamabad', risk: 'safe', lat: 33.7, lng: 73.1 },
];

const districts = ['All', 'Lahore', 'Multan', 'Rawalpindi', 'Mirpur', 'Faisalabad', 'Islamabad'];
const assetTypes = ['All', 'Bridge', 'Building', 'Road', 'Dam'];
const riskLevels = ['All', 'Safe', 'Moderate', 'High', 'Critical'];

export function MapView() {
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedAsset, setSelectedAsset] = useState<typeof assets[0] | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    seismic: true,
    urban: false,
  });

  const filteredAssets = assets.filter(asset => {
    if (selectedDistrict !== 'All' && asset.district !== selectedDistrict) return false;
    if (selectedType !== 'All' && asset.type !== selectedType) return false;
    if (selectedRisk !== 'All' && asset.risk !== selectedRisk.toLowerCase()) return false;
    return true;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return '#10B981';
      case 'moderate': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="h-full relative flex">
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="w-80 bg-card border-r border-border p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {districts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asset Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {assetTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Risk Level</label>
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {riskLevels.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-3">Asset List ({filteredAssets.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAssets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className="w-full p-3 bg-muted/30 hover:bg-muted rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-sm">{asset.name}</p>
                        <RiskBadge level={asset.risk as any} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground">{asset.type} • {asset.district}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!showFilters && (
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-card border border-border rounded-lg shadow-sm hover:bg-muted flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          )}
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="px-4 py-2 bg-card border border-border rounded-lg shadow-sm hover:bg-muted flex items-center gap-2"
          >
            <Layers className="w-5 h-5" />
            Layers
          </button>
        </div>

        {showLayers && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 left-4 z-10 bg-card border border-border rounded-lg shadow-lg p-4 w-64"
          >
            <h3 className="font-medium text-foreground mb-3">Map Layers</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLayers.flood}
                  onChange={(e) => setActiveLayers({ ...activeLayers, flood: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Flood Zones</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLayers.seismic}
                  onChange={(e) => setActiveLayers({ ...activeLayers, seismic: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Seismic Zones</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeLayers.urban}
                  onChange={(e) => setActiveLayers({ ...activeLayers, urban: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Urban Density</span>
              </label>
            </div>
          </motion.div>
        )}

        <div className="w-full h-full bg-muted/20 relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {activeLayers.flood && (
              <ellipse cx="40%" cy="60%" rx="200" ry="150" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
            )}
            {activeLayers.seismic && (
              <rect x="50%" y="20%" width="300" height="200" fill="rgba(239, 68, 68, 0.1)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" />
            )}

            {filteredAssets.map((asset, index) => (
              <g key={asset.id}>
                <circle
                  cx={`${asset.lng * 10}%`}
                  cy={`${asset.lat * 2}%`}
                  r="8"
                  fill={getRiskColor(asset.risk)}
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-10 transition-all"
                  onClick={() => setSelectedAsset(asset)}
                />
              </g>
            ))}
          </svg>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-2 opacity-20" />
              <p className="text-sm opacity-50">Interactive GIS Map Visualization</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="absolute right-0 top-0 bottom-0 w-96 bg-card border-l border-border shadow-xl p-6 overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-xl text-foreground mb-1">{selectedAsset.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedAsset.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                  <RiskBadge level={selectedAsset.risk as any} />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Type</p>
                  <p className="font-medium">{selectedAsset.type}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">District</p>
                  <p className="font-medium">{selectedAsset.district}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
                  <p className="font-mono text-sm">{selectedAsset.lat}°N, {selectedAsset.lng}°E</p>
                </div>

                <Link
                  to={`/app/assets/${selectedAsset.id}`}
                  className="block w-full px-4 py-3 bg-primary text-white rounded-lg text-center hover:bg-primary/90 transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
