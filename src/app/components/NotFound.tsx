import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function NotFound() {
  return (
    <div className="relative min-h-screen bg-transparent flex items-center justify-center p-4 transition-colors duration-300">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle mode="toggle" />
      </div>
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-4xl font-semibold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
