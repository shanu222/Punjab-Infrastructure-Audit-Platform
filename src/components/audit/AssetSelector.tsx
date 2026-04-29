import { useMemo, useState } from "react";
import { Search } from "lucide-react";

export type ListAsset = {
  _id?: string;
  asset_id?: string;
  display_name?: string;
  district?: string;
  type?: string;
  location?: { lat: number; lng: number };
};

type Props = {
  assets: ListAsset[];
  valueId: string | null;
  onChange: (id: string | null, asset: ListAsset | null) => void;
  disabled?: boolean;
};

export function AssetSelector({
  assets,
  valueId,
  onChange,
  disabled,
}: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return assets;
    return assets.filter((a) => {
      const id = String(a._id || a.asset_id || "");
      const name = (a.display_name || "").toLowerCase();
      const d = (a.district || "").toLowerCase();
      const t = (a.type || "").toLowerCase();
      return (
        id.includes(s) || name.includes(s) || d.includes(s) || t.includes(s)
      );
    });
  }, [assets, q]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Select infrastructure asset
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, district, type, or ID…"
          disabled={disabled}
          className="min-h-12 w-full rounded-xl border border-border bg-input-background py-3 pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <select
        value={valueId || ""}
        onChange={(e) => {
          const id = e.target.value || null;
          const a = assets.find((x) => String(x._id || x.asset_id) === id);
          onChange(id, a || null);
        }}
        disabled={disabled}
        className="min-h-14 w-full rounded-xl border border-border bg-input-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">— Choose asset —</option>
        {filtered.map((a) => {
          const id = String(a._id || a.asset_id || "");
          const label =
            a.display_name ||
            `${a.type || "Asset"} — ${a.district || ""}`.trim();
          return (
            <option key={id} value={id}>
              {label} ({id.slice(-6)})
            </option>
          );
        })}
      </select>
      {filtered.length === 0 && q.trim() && (
        <p className="text-sm text-muted-foreground">No matches.</p>
      )}
    </div>
  );
}
