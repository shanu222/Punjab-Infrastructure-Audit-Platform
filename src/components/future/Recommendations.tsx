import { Sparkles } from "lucide-react";

type Props = {
  items: string[];
  loading?: boolean;
};

export function Recommendations({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI-style recommendations</h3>
      </div>
      <ul className="space-y-2">
        {items.map((text, i) => (
          <li key={i} className="text-sm text-foreground border-l-2 border-primary/60 pl-3 py-1 bg-muted/30 rounded-r-lg">
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
