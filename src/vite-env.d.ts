/// <reference types="vite/client" />

// Build-time env exposed to the client (D-1). No secret is committed
// here (C-8); VITE_API_BASE_URL defaults to same-origin in client.ts.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
