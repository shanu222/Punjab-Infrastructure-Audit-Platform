import { Lightbulb } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  items: { id?: string; text: string; priority?: string }[];
};

const PRIORITY_RING: Record<string, string> = {
  high: "ring-red-500/40 bg-red-500/5",
  medium: "ring-amber-500/40 bg-amber-500/5",
  low: "ring-slate-400/30 bg-muted/40",
};

export function Recommendations({ items }: Props) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        No recommendations returned — widen audit coverage to fuel the rules
        engine.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Lightbulb className="size-5 text-amber-600" />
        Recommendations
      </h2>
      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {items.map((r, i) => {
          const pr = (r.priority || "medium").toLowerCase();
          const ring = PRIORITY_RING[pr] || PRIORITY_RING.medium;
          return (
            <motion.li
              key={r.id || i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border border-border p-4 text-sm leading-relaxed ring-2 ${ring}`}
            >
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {r.priority || "medium"}
              </span>
              {r.text}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
