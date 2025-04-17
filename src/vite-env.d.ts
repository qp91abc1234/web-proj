/// <reference types="vite/client" />

declare namespace Env {
  interface ImportMeta extends ImportMetaEnv {
    readonly VITE_DEV_TOOL: string
    readonly VITE_VISUALIZER_TOOL: string
    readonly VITE_BASE_URL: string
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta
}
