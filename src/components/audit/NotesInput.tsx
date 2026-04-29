type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export function NotesInput({ value, onChange, disabled }: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        Engineer observations
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={5}
        placeholder="Defects, measurements, access constraints, stakeholder comments…"
        className="min-h-32 w-full resize-y rounded-xl border border-border bg-input-background p-4 text-base outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
