import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import dayjs from 'dayjs'

import ViteHtmlTransform from './viteHtmlTransform'
import viteImgCompress from './viteImgCompress'
import viteImgUpload from './viteImgUpload'

import type { PluginOption } from 'vite'

/**
 * 创建 Vite 插件列表
 * @param viteEnv 环境变量
 * @param isBuild 是否为构建命令
 */
export function getPlugins(viteEnv: Env.ImportMeta, isBuild: boolean): PluginOption[] {
  const buildTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

  let plugins: PluginOption[] = [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    UnoCSS(),
    // HTML 转换插件：注入构建时间 & HTML 压缩
    ViteHtmlTransform({
      // 仅在构建时开启 HTML 压缩，开发环境保留原始 HTML，方便调试
      minify: isBuild,
      inject: [
        {
          // 默认入口 HTML：index.html
          regex: 'index\\.html$',
          data: {
            // 也可以在 EJS 模板中使用 <%= buildTime %>
            buildTime
          },
          tags: [
            {
              tag: 'meta',
              attrs: {
                name: 'build-time',
                content: buildTime
              },
              injectTo: 'head'
            }
          ]
        }
      ]
    })
  ]

  const isTrue = (value: string) => value === 'true'

  // 开发环境：按需启用 Vue DevTools
  if (!isBuild && isTrue(viteEnv.VITE_DEV_TOOL)) {
    plugins = plugins.concat(
      vueDevTools({
        launchEditor: 'cursor'
      })
    )
  }

  if (isBuild) {
    // 构建时启用图片压缩
    plugins.push(
      viteImgCompress({
        enable: true
      })
    )

    // 构建时启用图片上传（在图片压缩后执行）
    // 注意：需要配置 upload 函数才能启用
    plugins.push(
      viteImgUpload({
        enable: true,
        // 上传函数示例 - 需要根据实际情况实现
        upload: async () => {
          // 示例：上传到 OSS/CDN
          // const url = await uploadToOSS(fileName, content)
          // return url
          return ''
        }
      })
    )

    // 按需启用打包体积分析
    if (isTrue(viteEnv.VITE_VISUALIZER_TOOL)) {
      plugins = plugins.concat(
        visualizer({
          emitFile: true,
          filename: 'stat.html',
          open: true
        })
      )
    }
  }

  return plugins
}
