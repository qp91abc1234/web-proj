import { join } from 'path'
import { loadEnv, defineConfig } from 'vite'

import { manualChunks } from './manual-chunks'
import { getPlugins } from './vite-plugins'

import type { ConfigEnv, UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as Env.ImportMeta

  const userConfig: UserConfig = {
    plugins: getPlugins(viteEnv, env.command === 'build'),
    resolve: {
      alias: {
        '@': join(__dirname, '../src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/common/scss/mixin.scss';`
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3500
    }
  }
  return userConfig
})
