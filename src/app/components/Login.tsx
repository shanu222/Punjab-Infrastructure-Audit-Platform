import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Building2, User, Shield, Settings } from "lucide-react";

const roles = [
  {
    id: 'government',
    title: 'Government Official',
    description: 'View analytics and reports',
    icon: Shield,
    color: 'bg-primary',
  },
  {
    id: 'engineer',
    title: 'Field Engineer',
    description: 'Conduct audits and inspections',
    icon: User,
    color: 'bg-secondary',
  },
  {
    id: 'admin',
    title: 'System Admin',
    description: 'Manage users and settings',
    icon: Settings,
    color: 'bg-[#8b5cf6]',
  },
];

export function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleLogin = () => {
    if (selectedRole) {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6 shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-semibold text-foreground mb-3">
            Punjab Infrastructure Audit Intelligence Platform
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced AI-powered disaster risk assessment system
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-center mb-8">Select Your Role</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole(role.id)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`${role.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </motion.button>
            ))}
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleLogin}
            disabled={!selectedRole}
            className="w-full mt-6 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In
          </motion.button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Secured by Government of Punjab | PWD Department
          </p>
        </div>
      </motion.div>
    </div>
  );
}
