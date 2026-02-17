import { join } from 'path'
import { loadEnv, defineConfig } from 'vite'

import { getPlugins } from './vite-plugins'

import type { ConfigEnv, UserConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as Env.ImportMeta
  const base = '/admin/'

  const userConfig: UserConfig = {
    base,
    plugins: getPlugins(viteEnv, env.command === 'build', base),
    resolve: {
      alias: {
        '@': join(__dirname, '../src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/common/scss/mixin.scss' as *;`
        }
      }
    },
    build: {
      outDir: 'dist/admin',
      sourcemap: env.command === 'build' ? true : 'inline',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-core': ['vue', 'vue-router', 'pinia'],
            utils: ['axios', 'dayjs']
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3500,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
  return userConfig
})
