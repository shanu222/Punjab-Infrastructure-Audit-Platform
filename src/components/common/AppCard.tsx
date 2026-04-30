import { cn } from "@/app/components/ui/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Glass card: readable over global background; lighter blur on small screens. */
export function AppCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 text-card-foreground shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]",
        "bg-white/80 backdrop-blur-sm backdrop-saturate-150 dark:bg-slate-800/70 dark:backdrop-blur-md",
        "md:backdrop-blur-md motion-reduce:backdrop-blur-none motion-reduce:bg-card/95 dark:motion-reduce:bg-card/95",
        className,
      )}
    >
      {children}
    </div>
  );
}
