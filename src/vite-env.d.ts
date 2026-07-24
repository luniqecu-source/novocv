/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROXY_URL?: string
  readonly VITE_AI_MODEL?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
