import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import { ChevronDown, User } from "lucide-react";

export type OwnerInfo = {
  name?: string;
  email?: string;
  department?: string;
} | null;

type Props = {
  construction_year?: number | null;
  material?: string | null;
  structural_type?: string | null;
  owner: OwnerInfo;
  lastAuditLabel: string;
};

export function DetailsSection({
  construction_year,
  material,
  structural_type,
  owner,
  lastAuditLabel,
}: Props) {
  return (
    <Collapsible
      defaultOpen
      className="group rounded-xl border border-border bg-card shadow-sm"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left hover:bg-muted/40">
        <h2 className="text-lg font-semibold text-foreground">Basic details</h2>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-4 border-t border-border px-5 py-4 sm:grid-cols-2">
          <Field label="Construction year" value={construction_year ?? "—"} />
          <Field label="Material" value={material || "—"} />
          <Field label="Structural type" value={structural_type || "—"} />
          <Field label="Last audit" value={lastAuditLabel} />
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Custodian (recorded by)
            </p>
            <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <User className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  {owner?.name || "—"}
                </p>
                {owner?.email && (
                  <p className="text-sm text-muted-foreground">{owner.email}</p>
                )}
                {owner?.department ? (
                  <p className="text-xs text-muted-foreground">
                    {owner.department}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
