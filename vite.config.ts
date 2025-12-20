import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
import createVitePlugin from './vite'

const TAURI_HOST = process.env.TAURI_DEV_HOST

type ViteEnv = Record<string, string | undefined> & {
  VITE_APP_ENV?: string
  VITE_APP_TITLE?: string
  VITE_APP_VERSION?: string
  VITE_APP_PORT?: string
  VITE_APP_HMR_PORT?: string
}

function toNumber(value: string | undefined, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()) as ViteEnv

  const port = toNumber(env.VITE_APP_PORT, 18080)
  const hmrPort = toNumber(env.VITE_APP_HMR_PORT, 1421)

  const plugins: PluginOption[] = createVitePlugin(env as Record<string, string>)

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    clearScreen: false,
    define: {
      __APP_INFO__: JSON.stringify({
        env: env.VITE_APP_ENV ?? mode,
        title: env.VITE_APP_TITLE ?? 'App',
        version: env.VITE_APP_VERSION ?? '0.0.0',
      }),
    },
    server: {
      port,
      strictPort: true,
      host: TAURI_HOST || false,
      hmr: TAURI_HOST
        ? {
            protocol: 'ws',
            host: TAURI_HOST,
            port: hmrPort,
          }
        : undefined,
      watch: {
        ignored: ['**/src-tauri/**'],
      },
    },
  }
})
