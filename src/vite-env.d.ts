/// <reference types="vite/client" />

/** Injected in `vite.config.ts` from NEXT_PUBLIC_API_URL / VITE_API_BASE_URL at build time. */
declare const __PIAP_API_BASE__: string;

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
