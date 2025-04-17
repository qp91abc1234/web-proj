import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import unocss from '@unocss/eslint-config/flat'
import eslintConfigPrettier from 'eslint-config-prettier'
import importSortPlugin from 'eslint-plugin-for-sort-import'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'

const ignoreCfg = {
  files: ['**/*.{js,mjs,cjs,ts,vue}'],
  ignores: [
    // 构建产物
    'dist',
    'build',

    // 依赖
    'node_modules',

    // 缓存
    '.cache',
    '.temp',

    // 自动生成的文件
    'auto-imports.d.ts',
    'components.d.ts',

    // 测试覆盖率报告
    'coverage',

    // 静态资源
    'public',
    'static',

    // 编辑器配置
    '.vscode',
    '.idea',

    // 环境变量
    '.env.*',

    // 日志
    '*.log',

    // 其他
    '*.min.js',
    '*.min.css'
  ]
}

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tseslint.parser } } },
  ignoreCfg,
  eslintPluginPrettier,
  eslintConfigPrettier,
  unocss,
  importSortPlugin(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]
