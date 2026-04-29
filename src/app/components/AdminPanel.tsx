import { useState } from "react";
import { motion } from "motion/react";
import { Users, Building2, Settings, Upload, Brain, Database, FileText, Plus, Edit, Trash2 } from "lucide-react";

const users = [
  { id: 1, name: 'Ahmed Khan', role: 'Engineer', email: 'ahmed.khan@pwd.gov.pk', status: 'active' },
  { id: 2, name: 'Sara Ali', role: 'Engineer', email: 'sara.ali@pwd.gov.pk', status: 'active' },
  { id: 3, name: 'Dr. Usman Sheikh', role: 'Admin', email: 'usman.sheikh@pwd.gov.pk', status: 'active' },
  { id: 4, name: 'Fatima Malik', role: 'Government Official', email: 'fatima.malik@punjab.gov.pk', status: 'inactive' },
];

const infrastructure = [
  { id: 'A001', name: 'Ravi Bridge', type: 'Bridge', district: 'Lahore', status: 'active' },
  { id: 'A002', name: 'DHQ Hospital', type: 'Building', district: 'Multan', status: 'active' },
  { id: 'A003', name: 'GT Road Section 12', type: 'Road', district: 'Rawalpindi', status: 'active' },
  { id: 'A004', name: 'Mangla Dam Gate 3', type: 'Dam', district: 'Mirpur', status: 'maintenance' },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'infrastructure', label: 'Infrastructure DB', icon: Building2 },
    { id: 'standards', label: 'Audit Standards', icon: FileText },
    { id: 'ai', label: 'AI Training', icon: Brain },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">System administration and configuration</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search users..."
                className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>All Roles</option>
                <option>Engineer</option>
                <option>Admin</option>
                <option>Government Official</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-muted rounded">
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'infrastructure' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search infrastructure..."
                className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>All Types</option>
                <option>Bridge</option>
                <option>Building</option>
                <option>Road</option>
                <option>Dam</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Infrastructure
            </button>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Asset ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {infrastructure.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {asset.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {asset.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {asset.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        asset.status === 'active'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-muted rounded">
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'standards' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Upload Audit Standards</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload PDF documents containing audit criteria, scoring guidelines, and compliance requirements.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground mb-1">Upload Standards Document</p>
              <p className="text-sm text-muted-foreground">PDF files (max 20MB)</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Current Standards</h3>
            <div className="space-y-2">
              {['Bridge Safety Standards 2024', 'Building Code Compliance', 'Seismic Design Guidelines', 'Flood Protection Requirements'].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{doc}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-primary hover:underline text-sm">View</button>
                    <button className="text-destructive hover:underline text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Risk Scoring Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Structural Integrity Weight (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="40"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">Current: 40%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Disaster Resilience Weight (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="35"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">Current: 35%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Age & Maintenance Weight (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="25"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">Current: 25%</p>
              </div>
              <button className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                Save Configuration
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'ai' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl p-6">
              <Database className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-white/80 text-sm mb-1">Training Datasets</p>
              <p className="text-3xl font-semibold">45,234</p>
            </div>
            <div className="bg-gradient-to-br from-secondary to-secondary/80 text-white rounded-xl p-6">
              <Brain className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-white/80 text-sm mb-1">Active Models</p>
              <p className="text-3xl font-semibold">4</p>
            </div>
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#8b5cf6]/80 text-white rounded-xl p-6">
              <Settings className="w-10 h-10 mb-3 opacity-90" />
              <p className="text-white/80 text-sm mb-1">Model Accuracy</p>
              <p className="text-3xl font-semibold">88%</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Upload Training Data</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload historical audit data, disaster records, and structural assessments to improve AI accuracy.
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground mb-1">Upload Training Dataset</p>
              <p className="text-sm text-muted-foreground">CSV, JSON, or Excel files</p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Model Training Status</h3>
            <div className="space-y-4">
              {[
                { name: 'Flood Prediction Model', progress: 100, status: 'Completed' },
                { name: 'Earthquake Vulnerability', progress: 100, status: 'Completed' },
                { name: 'Heat Stress Analysis', progress: 67, status: 'Training...' },
                { name: 'Structural Degradation', progress: 100, status: 'Completed' },
              ].map((model, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{model.name}</span>
                    <span className="text-sm text-muted-foreground">{model.status}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${model.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Model Performance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prediction Accuracy</p>
                <p className="text-2xl font-semibold text-foreground">88.3%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">False Positive Rate</p>
                <p className="text-2xl font-semibold text-foreground">4.2%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Processing Speed</p>
                <p className="text-2xl font-semibold text-foreground">1.2s</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Data Quality Score</p>
                <p className="text-2xl font-semibold text-foreground">94%</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">System Name</label>
                <input
                  type="text"
                  defaultValue="Punjab Infrastructure Audit Intelligence Platform"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Organization</label>
                <input
                  type="text"
                  defaultValue="Government of Punjab - PWD"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
                <input
                  type="email"
                  defaultValue="admin@pwd.punjab.gov.pk"
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Notification Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Email notifications for critical risks</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">SMS alerts for disaster warnings</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Daily summary reports</span>
                <input type="checkbox" className="rounded" />
              </label>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h3 className="font-semibold text-foreground mb-4">Security Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Two-factor authentication</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Session timeout (30 minutes)</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between cursor-pointer p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-foreground">Audit log retention (90 days)</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
          </div>

          <button className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Save All Settings
          </button>
        </motion.div>
      )}
    </div>
  );
}
