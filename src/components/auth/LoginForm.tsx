import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  email: string;
  password: string;
  remember: boolean;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRememberChange: (v: boolean) => void;
  onSubmit: () => void;
};

export function LoginForm({
  email,
  password,
  remember,
  loading,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onSubmit,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const handleForgot = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    toast.info("Contact your PWD / department administrator to reset credentials.");
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => onEmailChange(e.target.value.trim())}
          placeholder="name@department.gov"
          className="w-full px-4 py-3 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => onRememberChange(e.target.checked)}
            className="rounded border-border w-4 h-4 accent-primary"
          />
          <span className="text-sm text-foreground">Remember me</span>
        </label>
        <a
          href="#"
          onClick={handleForgot}
          className="text-sm text-primary hover:underline min-h-[44px] flex items-center"
        >
          Forgot password?
        </a>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.99 }}
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-3.5 md:py-4 min-h-[48px] rounded-lg bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </motion.button>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">2FA:</span> One-time passcodes will be
          available in a future release.
        </p>
        <p>
          <span className="font-medium text-foreground">CNIC login:</span>{" "}
          <button type="button" className="text-primary underline opacity-60 cursor-not-allowed" disabled>
            Coming soon
          </button>
        </p>
      </div>
    </div>
  );
}
