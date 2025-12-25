/// <reference types="vite/client" />

declare namespace Env {
  interface ImportMeta extends ImportMetaEnv {
    /** 项目名称 */
    readonly VITE_APP_NAME: string
    /** 开发工具开关 */
    readonly VITE_DEV_TOOL: string
    /** 可视化工具开关 */
    readonly VITE_VISUALIZER_TOOL: string
    /** API 基础 URL */
    readonly VITE_BASE_URL: string
    /** 默认登录用户名（仅开发环境） */
    readonly VITE_DEFAULT_USERNAME: string
    /** 默认登录密码（仅开发环境） */
    readonly VITE_DEFAULT_PASSWORD: string
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta
}
