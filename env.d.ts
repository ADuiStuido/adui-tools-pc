/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_PORT: string
  readonly VITE_APP_HMR_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
