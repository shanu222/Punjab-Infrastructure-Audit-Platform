import { AlertTriangle } from "lucide-react";

export type AssetHeaderModel = {
  display_name?: string;
  asset_id?: string;
  _id?: string;
  type?: string;
  district?: string;
  is_flagged_critical?: boolean;
};

type Props = {
  asset: AssetHeaderModel;
  resolvedId: string;
};

function titleCaseType(t: string | undefined) {
  if (!t) return "—";
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AssetHeader({ asset, resolvedId }: Props) {
  const name = asset.display_name || titleCaseType(asset.type);
  return (
    <header className="space-y-3 border-b border-border pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {name}
            </h1>
            {asset.is_flagged_critical && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-500/30 dark:text-red-300">
                <AlertTriangle className="size-3.5" />
                Critical flag
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Asset ID: {resolvedId}
          </p>
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Type
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            {titleCaseType(asset.type)}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            District
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-foreground">
            {asset.district || "—"}
          </dd>
        </div>
      </dl>
    </header>
  );
}
