import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Brain,
  FileText,
  Building2,
  Settings,
  Bell,
  User,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { getStoredUser, clearAuth } from "@/utils/authStorage.js";

const allNavItems = [
  { path: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/app/map", icon: Map, label: "GIS Map" },
  { path: "/app/audit", icon: ClipboardList, label: "Audit Form" },
  {
    path: "/app/ai-analysis",
    icon: Brain,
    label: "AI Analysis",
    govAdminOnly: true,
  },
  { path: "/app/future-approval", icon: Building2, label: "Future Approval", govAdminOnly: true },
  { path: "/app/admin", icon: Settings, label: "Admin Panel", adminOnly: true },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const user = getStoredUser();

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (item.adminOnly && user?.role !== "admin") return false;
      if (
        item.govAdminOnly &&
        user?.role !== "admin" &&
        user?.role !== "government"
      ) {
        return false;
      }
      return true;
    });
  }, [user?.role]);

  const isNavActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app" || location.pathname === "/app/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-70 bg-sidebar border-r border-sidebar-border flex flex-col"
          >
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-sidebar-foreground">Punjab Infra</h1>
                  <p className="text-xs text-muted-foreground">Audit Intelligence</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = isNavActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-sidebar-border space-y-2">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {user?.role || "—"}
                    {user?.department ? ` · ${user.department}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent border border-sidebar-border"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-4">
            <button type="button" className="relative p-2 hover:bg-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
