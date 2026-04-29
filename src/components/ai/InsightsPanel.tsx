import { Brain, Sparkles } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  headlines: string[];
  predictions: { summary?: string; confidence?: number; horizon_months?: number }[];
};

export function InsightsPanel({ headlines, predictions }: Props) {
  const h = headlines?.length ? headlines : [];
  const p = predictions?.length ? predictions : [];

  if (!h.length && !p.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        No insights available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Brain className="size-5 text-primary" />
        AI insights
      </h2>
      <div className="space-y-3">
        {h.map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 to-transparent px-4 py-3 text-sm leading-relaxed text-foreground"
          >
            <span className="font-medium text-primary">Signal · </span>
            {text}
          </motion.div>
        ))}
      </div>
      {p.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-amber-600" />
            Predictions
          </h3>
          {p.map((x, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {x.horizon_months ?? "?"} mo horizon:{" "}
              </span>
              {x.summary}
              {typeof x.confidence === "number" && (
                <span className="ml-2 text-xs">
                  (confidence {Math.round(x.confidence * 100)}%)
                </span>
              )}
            </motion.p>
          ))}
        </div>
      )}
    </div>
  );
}
