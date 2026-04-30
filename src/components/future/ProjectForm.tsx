import type { FormErrors, FutureFormState } from "./types";

const DISTRICTS = [
  "Lahore",
  "Rawalpindi",
  "Multan",
  "Faisalabad",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur",
  "Sialkot",
  "Sheikhupura",
  "Jhang",
  "Gujrat",
  "Sahiwal",
  "Kasur",
  "Rahim Yar Khan",
  "Okara",
  "Muzaffargarh",
  "Khanewal",
  "Mianwali",
  "Bhakkar",
  "Layyah",
  "Attock",
  "Chiniot",
  "Hafizabad",
  "Mandi Bahauddin",
  "Narowal",
  "Vehari",
  "Other / specify in notes",
];

type Props = {
  form: FutureFormState;
  onChange: <K extends keyof FutureFormState>(key: K, value: FutureFormState[K]) => void;
  errors: FormErrors;
};

export function ProjectForm({ form, onChange, errors }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Project name</label>
        <input
          value={form.project_name}
          onChange={(e) => onChange("project_name", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background"
          placeholder="e.g., GT Road widening — Phase 2"
        />
        {errors.project_name && <p className="text-xs text-destructive mt-1">{errors.project_name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Infrastructure type</label>
        <select
          value={form.type}
          onChange={(e) => onChange("type", e.target.value as FutureFormState["type"])}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background capitalize"
        >
          <option value="building">Building</option>
          <option value="road">Road</option>
          <option value="bridge">Bridge</option>
          <option value="dam">Dam</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">District</label>
        <input
          list="future-punjab-districts"
          value={form.district}
          onChange={(e) => onChange("district", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background"
          placeholder="Type or pick a district"
        />
        <datalist id="future-punjab-districts">
          {DISTRICTS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        {errors.district && <p className="text-xs text-destructive mt-1">{errors.district}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Latitude</label>
          <input
            value={form.lat}
            onChange={(e) => onChange("lat", e.target.value)}
            inputMode="decimal"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background font-mono text-sm"
            placeholder="31.52"
          />
          {errors.lat && <p className="text-xs text-destructive mt-1">{errors.lat}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Longitude</label>
          <input
            value={form.lng}
            onChange={(e) => onChange("lng", e.target.value)}
            inputMode="decimal"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background font-mono text-sm"
            placeholder="74.35"
          />
          {errors.lng && <p className="text-xs text-destructive mt-1">{errors.lng}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Proposed material</label>
        <input
          value={form.material}
          onChange={(e) => onChange("material", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background"
          placeholder="e.g., Reinforced concrete M35"
        />
        {errors.material && <p className="text-xs text-destructive mt-1">{errors.material}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Structural type</label>
        <input
          value={form.structural_type}
          onChange={(e) => onChange("structural_type", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background"
          placeholder="e.g., RCC frame, simply supported slab"
        />
        {errors.structural_type && <p className="text-xs text-destructive mt-1">{errors.structural_type}</p>}
      </div>
    </div>
  );
}
