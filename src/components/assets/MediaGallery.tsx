import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Image, X } from "lucide-react";

export type MediaItem = {
  url: string;
  kind: "image" | "video";
};

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

export function normalizeMediaUrl(url: string): MediaItem {
  return {
    url,
    kind: isVideoUrl(url) ? "video" : "image",
  };
}

type Props = {
  items: MediaItem[];
};

export function MediaGallery({ items }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!items.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Media gallery</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          No images or videos are attached to audits for this asset yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Media gallery</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        From audit submissions — click an image to enlarge.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((m, i) =>
          m.kind === "video" ? (
            <div
              key={`${m.url}-${i}`}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-black"
            >
              <video
                src={m.url}
                className="h-full w-full object-cover opacity-90"
                controls
                preload="metadata"
              />
              <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Video
              </div>
            </div>
          ) : (
            <button
              key={`${m.url}-${i}`}
              type="button"
              onClick={() => setLightbox(m.url)}
              className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted/40 transition hover:border-primary hover:shadow-md"
            >
              <img
                src={m.url}
                alt=""
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                <Image className="size-8 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
            </button>
          ),
        )}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setLightbox(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setLightbox(null);
            }}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/55 dark:bg-white/15 dark:hover:bg-white/25"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(null);
              }}
            >
              <X className="size-6" />
            </button>
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              src={lightbox}
              alt="Enlarged"
              className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
