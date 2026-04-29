import type { StructuralUi } from "@/utils/auditScoring";

type Props = {
  value: StructuralUi;
  onChange: (next: StructuralUi) => void;
  disabled?: boolean;
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Opt<T extends string>({
  active,
  children,
  onClick,
  disabled,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 min-w-[5.5rem] flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition sm:min-w-[7rem] ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-muted/40 text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function StructuralChecklist({ value, onChange, disabled }: Props) {
  const set = <K extends keyof StructuralUi>(k: K, v: StructuralUi[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <Row label="Cracks (visible)">
        <Opt
          active={value.cracks === "none"}
          disabled={disabled}
          onClick={() => set("cracks", "none")}
        >
          None
        </Opt>
        <Opt
          active={value.cracks === "minor"}
          disabled={disabled}
          onClick={() => set("cracks", "minor")}
        >
          Minor
        </Opt>
        <Opt
          active={value.cracks === "major"}
          disabled={disabled}
          onClick={() => set("cracks", "major")}
        >
          Major
        </Opt>
      </Row>
      <Row label="Foundation condition">
        <Opt
          active={value.foundation === "stable"}
          disabled={disabled}
          onClick={() => set("foundation", "stable")}
        >
          Stable
        </Opt>
        <Opt
          active={value.foundation === "weak"}
          disabled={disabled}
          onClick={() => set("foundation", "weak")}
        >
          Weak
        </Opt>
        <Opt
          active={value.foundation === "critical"}
          disabled={disabled}
          onClick={() => set("foundation", "critical")}
        >
          Critical
        </Opt>
      </Row>
      <Row label="Load capacity">
        <Opt
          active={value.load_capacity === "adequate"}
          disabled={disabled}
          onClick={() => set("load_capacity", "adequate")}
        >
          Adequate
        </Opt>
        <Opt
          active={value.load_capacity === "reduced"}
          disabled={disabled}
          onClick={() => set("load_capacity", "reduced")}
        >
          Reduced
        </Opt>
        <Opt
          active={value.load_capacity === "unsafe"}
          disabled={disabled}
          onClick={() => set("load_capacity", "unsafe")}
        >
          Unsafe
        </Opt>
      </Row>
      <Row label="Corrosion">
        <Opt
          active={value.corrosion === "none"}
          disabled={disabled}
          onClick={() => set("corrosion", "none")}
        >
          None
        </Opt>
        <Opt
          active={value.corrosion === "moderate"}
          disabled={disabled}
          onClick={() => set("corrosion", "moderate")}
        >
          Moderate
        </Opt>
        <Opt
          active={value.corrosion === "severe"}
          disabled={disabled}
          onClick={() => set("corrosion", "severe")}
        >
          Severe
        </Opt>
      </Row>
    </div>
  );
}
