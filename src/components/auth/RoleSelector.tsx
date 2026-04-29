import { motion } from "motion/react";
import { User, Shield, Settings } from "lucide-react";

export type PortalRole = "engineer" | "government" | "admin";

const roles: {
  id: PortalRole;
  title: string;
  description: string;
  icon: typeof User;
  accent: string;
}[] = [
  {
    id: "engineer",
    title: "Engineer",
    description: "Conduct audits and inspections",
    icon: User,
    accent: "bg-secondary",
  },
  {
    id: "government",
    title: "Government Official",
    description: "View analytics and reports",
    icon: Shield,
    accent: "bg-primary",
  },
  {
    id: "admin",
    title: "Admin",
    description: "Manage users and platform settings",
    icon: Settings,
    accent: "bg-[#8b5cf6]",
  },
];

type Props = {
  selectedRole: PortalRole | "";
  onSelect: (role: PortalRole) => void;
};

export function RoleSelector({ selectedRole, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {roles.map((role) => (
        <motion.button
          key={role.id}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(role.id)}
          className={`p-5 md:p-6 rounded-xl border-2 text-left transition-all duration-200 min-h-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            selectedRole === role.id
              ? "border-primary bg-primary/8 shadow-md ring-1 ring-primary/30"
              : "border-border hover:border-primary/45 hover:bg-muted/40 hover:shadow-sm"
          }`}
        >
          <div
            className={`${role.accent} w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-3 md:mb-4 mx-auto`}
          >
            <role.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h3 className="font-semibold text-base md:text-lg text-center text-foreground mb-1">
            {role.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground text-center leading-snug">
            {role.description}
          </p>
        </motion.button>
      ))}
    </div>
  );
}
