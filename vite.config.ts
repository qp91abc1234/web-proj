import { join } from 'path'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv, defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import type { ConfigEnv, UserConfig } from 'vite'

function getPlugins(viteEnv: Env.ImportMeta, isBuild: boolean) {
  let plugins = [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    UnoCSS()
  ]

  const isTrue = (value: string) => value === 'true'

  if (!isBuild && isTrue(viteEnv.VITE_DEV_TOOL)) {
    plugins = plugins.concat(
      vueDevTools({
        launchEditor: 'cursor'
      })
    )
  }

  if (isBuild && isTrue(viteEnv.VITE_VISUALIZER_TOOL)) {
    plugins = plugins.concat(
      visualizer({
        emitFile: true,
        filename: 'stat.html',
        open: true
      })
    )
  }

  return plugins
}

// https://vite.dev/config/
export default defineConfig((env: ConfigEnv) => {
  const viteEnv = loadEnv(env.mode, process.cwd()) as unknown as Env.ImportMeta

  const userConfig: UserConfig = {
    plugins: getPlugins(viteEnv, env.command === 'build'),
    resolve: {
      alias: {
        '@': join(__dirname, './src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use '@/common/scss/mixin.scss';`
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
