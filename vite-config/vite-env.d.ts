/// <reference types="vite/client" />

declare namespace Env {
  interface ImportMeta extends ImportMetaEnv {
    /** 项目名称 */
    readonly VITE_APP_NAME: string
    /** 默认登录用户名（仅开发环境） */
    readonly VITE_DEFAULT_USERNAME: string
    /** 默认登录密码（仅开发环境） */
    readonly VITE_DEFAULT_PASSWORD: string
    /** OSS 配置 */
    readonly VITE_OSS_REGION: string
    readonly VITE_OSS_BUCKET: string
    readonly VITE_OSS_ACCESS_KEY_ID: string
    readonly VITE_OSS_ACCESS_KEY_SECRET: string
  }
}

interface ImportMeta {
  readonly env: Env.ImportMeta
}
