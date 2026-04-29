import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type Props = {
  status: string;
  explanation: string;
  summaryLine?: string;
};

export function ResultCard({ status, explanation, summaryLine }: Props) {
  const upper = status.toUpperCase();
  const isApproved = upper === "APPROVED";
  const isRejected = upper === "REJECTED";
  const isConditional = upper === "APPROVED_WITH_CONDITIONS";

  const border = isRejected
    ? "border-destructive/50 bg-destructive/5"
    : isConditional
      ? "border-amber-500/50 bg-amber-500/5"
      : "border-emerald-600/50 bg-emerald-600/5";

  return (
    <div className={`rounded-xl border-2 p-6 ${border}`}>
      <div className="flex flex-wrap items-start gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
            isRejected ? "bg-destructive text-destructive-foreground" : isConditional ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {isRejected ? <XCircle className="w-8 h-8" /> : isConditional ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Approval result</p>
          <h3 className="text-xl font-semibold text-foreground mt-0.5">{status.replace(/_/g, " ")}</h3>
          {summaryLine && <p className="text-sm text-muted-foreground mt-1">{summaryLine}</p>}
          <p className="text-sm text-foreground mt-3 leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
