import type { DisasterUi } from "@/utils/auditScoring";

type Props = {
  value: DisasterUi;
  onChange: (next: DisasterUi) => void;
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

function Opt({
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

export function DisasterSection({ value, onChange, disabled }: Props) {
  const set = <K extends keyof DisasterUi>(k: K, v: DisasterUi[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <Row label="Flood resilience">
        <Opt
          active={value.flood === "safe"}
          disabled={disabled}
          onClick={() => set("flood", "safe")}
        >
          Safe
        </Opt>
        <Opt
          active={value.flood === "moderate"}
          disabled={disabled}
          onClick={() => set("flood", "moderate")}
        >
          Moderate
        </Opt>
        <Opt
          active={value.flood === "high"}
          disabled={disabled}
          onClick={() => set("flood", "high")}
        >
          High risk
        </Opt>
      </Row>
      <Row label="Earthquake performance">
        <Opt
          active={value.earthquake === "resistant"}
          disabled={disabled}
          onClick={() => set("earthquake", "resistant")}
        >
          Resistant
        </Opt>
        <Opt
          active={value.earthquake === "vulnerable"}
          disabled={disabled}
          onClick={() => set("earthquake", "vulnerable")}
        >
          Vulnerable
        </Opt>
        <Opt
          active={value.earthquake === "critical"}
          disabled={disabled}
          onClick={() => set("earthquake", "critical")}
        >
          Critical
        </Opt>
      </Row>
      <Row label="Heat stress">
        <Opt
          active={value.heat === "stable"}
          disabled={disabled}
          onClick={() => set("heat", "stable")}
        >
          Stable
        </Opt>
        <Opt
          active={value.heat === "weak"}
          disabled={disabled}
          onClick={() => set("heat", "weak")}
        >
          Weak
        </Opt>
        <Opt
          active={value.heat === "failing"}
          disabled={disabled}
          onClick={() => set("heat", "failing")}
        >
          Failing
        </Opt>
      </Row>
    </div>
  );
}
