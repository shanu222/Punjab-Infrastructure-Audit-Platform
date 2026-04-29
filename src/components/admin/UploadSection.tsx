import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";

type UploadedItem = {
  id: string;
  name: string;
  key?: string;
  at: string;
};

type Props = {
  onUpload: (file: File) => Promise<void>;
  disabled?: boolean;
};

export function UploadSection({ onUpload, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [err, setErr] = useState("");

  async function handleFile(f: File | null) {
    if (!f || disabled || busy) return;
    setErr("");
    setBusy(true);
    try {
      await onUpload(f);
      setItems((prev) => [
        { id: `${Date.now()}`, name: f.name, at: new Date().toISOString() },
        ...prev,
      ].slice(0, 12));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Standards & documents
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload audit guidelines (PDF) and engineering standards. Files are stored under{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">reports/</code> in object storage.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] || null)}
        />

        <button
          type="button"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/60 transition-colors disabled:opacity-50"
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-foreground font-medium">{busy ? "Uploading…" : "Choose PDF to upload"}</p>
          <p className="text-xs text-muted-foreground mt-1">Max size per server policy (typically up to 100MB)</p>
        </button>
        {err && <p className="text-sm text-destructive mt-2">{err}</p>}
      </div>

      {items.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h4 className="text-sm font-medium mb-2">Recent uploads (this session)</h4>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between text-sm border-b border-border/60 pb-2 last:border-0">
                <span className="truncate pr-2">{it.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(it.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
