import { useRef } from "react";
import { Image, Loader2, Trash2, Video } from "lucide-react";
import { uploadMediaFile } from "@/services/auditService.js";

export type MediaSlot = {
  id: string;
  file: File;
  previewUrl: string;
  key: string | null;
  uploading: boolean;
  error: string | null;
};

type Props = {
  items: MediaSlot[];
  setItems: React.Dispatch<React.SetStateAction<MediaSlot[]>>;
  disabled?: boolean;
};

export function MediaUpload({ items, setItems, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const added: MediaSlot[] = files.map((file, i) => ({
      id: `${Date.now()}-${i}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      key: null,
      uploading: true,
      error: null,
    }));

    setItems((prev) => [...prev, ...added]);

    void Promise.all(
      added.map(async (slot) => {
        try {
          const res = await uploadMediaFile(slot.file);
          const key = res?.data?.key;
          if (!key) throw new Error("No storage key returned");
          setItems((prev) =>
            prev.map((s) =>
              s.id === slot.id
                ? { ...s, key, uploading: false, error: null }
                : s,
            ),
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setItems((prev) =>
            prev.map((s) =>
              s.id === slot.id
                ? { ...s, key: null, uploading: false, error: msg }
                : s,
            ),
          );
        }
      }),
    );
  };

  const remove = (id: string) => {
    setItems((prev) => {
      const slot = prev.find((s) => s.id === id);
      if (slot?.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      return prev.filter((s) => s.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={handlePick}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-base font-medium text-primary transition hover:bg-primary/10"
      >
        <Image className="size-5" />
        Add photos / videos
      </button>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((m) => (
          <div
            key={m.id}
            className="relative overflow-hidden rounded-xl border border-border bg-muted/30"
          >
            {m.file.type.startsWith("video/") ? (
              <video
                src={m.previewUrl}
                className="aspect-video w-full object-cover"
                muted
                playsInline
                controls
              />
            ) : (
              <img
                src={m.previewUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />
            )}
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
              {m.file.type.startsWith("video/") ? (
                <Video className="size-3" />
              ) : (
                <Image className="size-3" />
              )}
            </div>
            {m.uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            )}
            {m.error && (
              <p className="border-t border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                {m.error}
              </p>
            )}
            {m.key && !m.error && (
              <p className="border-t border-border bg-card/90 p-1 text-[10px] text-muted-foreground">
                Uploaded
              </p>
            )}
            <button
              type="button"
              disabled={disabled || m.uploading}
              onClick={() => remove(m.id)}
              className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/75"
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Files upload to cloud storage immediately; storage keys are sent with
        the audit payload.
      </p>
    </div>
  );
}
