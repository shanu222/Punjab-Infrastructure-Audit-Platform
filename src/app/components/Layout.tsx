import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Brain,
  Building2,
  Settings,
  Bell,
  User,
  Menu,
  LogOut,
  Layers,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getStoredUser, clearAuth } from "@/utils/authStorage.js";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/app/components/ui/utils";

type NavItem = {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
  govAdminOnly?: boolean;
};

const NAV: NavItem[] = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/map", label: "Map", icon: Map },
  { path: "/app/assets", label: "Assets", icon: Layers },
  { path: "/app/audit", label: "Audit", icon: ClipboardList },
  { path: "/app/ai-analysis", label: "AI dashboard", icon: Brain, govAdminOnly: true },
  { path: "/app/future-approval", label: "Future analysis", icon: Building2, govAdminOnly: true },
  { path: "/app/admin", label: "Admin", icon: Settings, adminOnly: true },
];

function NavLinks({
  onNavigate,
  isActive,
}: {
  onNavigate?: () => void;
  isActive: (path: string) => boolean;
}) {
  const user = getStoredUser();
  const items = useMemo(() => {
    return NAV.filter((item) => {
      if (item.adminOnly && user?.role !== "admin") return false;
      if (item.govAdminOnly && user?.role !== "admin" && user?.role !== "government") return false;
      return true;
    });
  }, [user?.role]);

  return (
    <>
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-5 shrink-0 opacity-90" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <Building2 className="size-6" />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sidebar-foreground leading-tight truncate">Punjab Infra</p>
        <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Audit intelligence</p>
      </div>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getStoredUser();

  const isNavActive = (path: string) => {
    if (path === "/app") {
      return location.pathname === "/app" || location.pathname === "/app/";
    }
    if (path === "/app/assets") {
      return location.pathname === "/app/assets" || location.pathname.startsWith("/app/assets/");
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const sidebarFooter = (
    <div className="mt-auto border-t border-sidebar-border p-4 space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground shrink-0">
          <User className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name || "User"}</p>
          <p className="text-xs text-muted-foreground capitalize truncate">
            {user?.role || "—"}
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center gap-2 rounded-xl border-sidebar-border bg-card/50 hover:bg-card"
        onClick={handleLogout}
      >
        <LogOut className="size-4" />
        Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar shadow-[var(--shadow-card)] z-30">
        <div className="p-5 border-b border-sidebar-border">
          <Brand />
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          <NavLinks isActive={isNavActive} />
        </nav>
        {sidebarFooter}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 md:h-16 items-center gap-2 border-b border-border/80 bg-card/90 px-3 md:px-5 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 shadow-sm">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl shrink-0" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,20rem)] p-0 flex flex-col bg-sidebar border-sidebar-border">
              <div className="p-5 border-b border-sidebar-border">
                <Brand />
              </div>
              <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} isActive={isNavActive} />
              </nav>
              {sidebarFooter}
            </SheetContent>
          </Sheet>

          <div className="hidden sm:block flex-1 min-w-0 pl-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Punjab Infrastructure</p>
            <p className="text-sm font-bold text-foreground truncate">Audit intelligence platform</p>
          </div>

          <div className="flex-1 sm:hidden" />

          <div className="flex items-center gap-1 md:gap-2 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-xl" aria-label="Notifications">
                  <Bell className="size-5" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Alerts</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    toast.warning("High-risk asset detected", {
                      description: "Review the map filters for critical markers in your district.",
                    });
                  }}
                >
                  High-risk asset detected — tap to acknowledge
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.success("Audit submitted", { description: "Recent submission synced successfully." });
                  }}
                >
                  Audit submitted successfully (sample)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/map">Open map</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl gap-2 px-2 md:px-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-4" />
                  </div>
                  <span className="hidden md:inline max-w-[8rem] truncate text-sm font-medium">{user?.name || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Signed in</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user?.email || "—"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive gap-2">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="min-h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
