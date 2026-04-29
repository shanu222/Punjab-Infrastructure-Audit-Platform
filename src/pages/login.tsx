import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { RoleSelector, type PortalRole } from "@/components/auth/RoleSelector";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  setAuth,
  setRememberedEmail,
  getRememberedEmail,
} from "@/utils/authStorage.js";
import {
  login as loginApi,
  hintRole,
  postClientLoginLog,
  collectDeviceInfo,
} from "@/services/authService.js";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function redirectPathForRole(role: PortalRole): string {
  if (role === "engineer") return "/app/audit";
  if (role === "government") return "/app";
  return "/app/admin";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<PortalRole | "">("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = getRememberedEmail();
    if (saved) setEmail(saved);
  }, []);

  const runRoleHint = useCallback(async (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    try {
      const res = await hintRole(trimmed);
      const suggested = res?.data?.suggested_role as PortalRole | null | undefined;
      if (suggested && (suggested === "engineer" || suggested === "government" || suggested === "admin")) {
        setSelectedRole(suggested);
        toast("Role suggested from your account", {
          description: `Selected: ${suggested}`,
        });
      }
    } catch {
      /* ignore hint failures */
    }
  }, []);

  useEffect(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => {
      void runRoleHint(email);
    }, 500);
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [email, runRoleHint]);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!selectedRole) {
      toast.error("Please select your role.");
      return;
    }
    if (!trimmedEmail || !password) {
      toast.error("Enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({
        email: trimmedEmail,
        password,
        role: selectedRole,
      });
      const { user, token, security } = res.data || {};
      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      setAuth(token, user);
      if (remember) setRememberedEmail(trimmedEmail);
      else setRememberedEmail("");

      try {
        await postClientLoginLog({
          role: user.role,
          client_timestamp: new Date().toISOString(),
          device_info: collectDeviceInfo(),
        });
      } catch {
        toast.warning("Signed in, but device audit log could not be sent.");
      }

      if (security?.suspicious_login || security?.new_ip_detected) {
        toast.warning("Unusual sign-in detected", {
          description: "New IP address for this account. If this was not you, contact security.",
          duration: 8000,
        });
      }

      toast.success("Signed in successfully");
      navigate(redirectPathForRole(user.role as PortalRole), { replace: true });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      if (e.status === 403) {
        toast.error("Role mismatch", {
          description: e.message || "Selected role does not match your account.",
        });
      } else if (e.status === 401) {
        toast.error("Invalid credentials", {
          description: e.message || "Check email and password.",
        });
      } else {
        toast.error("Sign-in failed", {
          description: e.message || "Server error. Try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary/[0.07] via-background to-secondary/[0.08] flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle mode="toggle" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl transition-colors duration-300"
      >
        <header className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl mb-4 md:mb-6 shadow-[var(--shadow-card-hover)] ring-1 ring-primary/20">
            <Building2 className="w-9 h-9 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground mb-2 md:mb-3 tracking-tight">
            Punjab Infrastructure Audit Intelligence Platform
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            AI-based Infra Audit System
          </p>
        </header>

        <div className="bg-card rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 p-6 sm:p-8 md:p-10 border border-border">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-6 md:mb-8 text-foreground">
            Select your role
          </h2>

          <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />

          <div className="mt-8 md:mt-10 pt-8 border-t border-border">
            <h3 className="text-lg font-medium text-center mb-4 text-foreground">Sign in</h3>
            <LoginForm
              email={email}
              password={password}
              remember={remember}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onRememberChange={setRemember}
              onSubmit={() => void handleLogin()}
            />
          </div>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
            Secured by Government of Punjab · PWD Department · All sign-ins are audit logged
          </p>
        </div>
      </motion.div>
    </div>
  );
}
