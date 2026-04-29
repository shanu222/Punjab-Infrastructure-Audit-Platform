import { cn } from "@/app/components/ui/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Enterprise card shell: white surface, soft shadow, xl radius (8px grid). */
export function AppCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card text-card-foreground shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
