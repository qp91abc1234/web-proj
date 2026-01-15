import autoprefixer from 'autoprefixer'
import postcssPresetEnv from 'postcss-preset-env'

/**
 * PostCSS 配置 - 用于样式兼容性处理
 * @see https://github.com/postcss/postcss
 */
export default {
  plugins: [
    // 自动添加浏览器前缀
    // 根据 .browserslistrc 配置自动添加 -webkit-, -moz-, -ms- 等前缀
    autoprefixer(),

    // 将现代 CSS 特性转换为大多数浏览器支持的 CSS
    // 如：将 8位 hex 颜色转换为 rgba、自定义属性回退等
    postcssPresetEnv({
      // 设置要支持的 CSS 特性阶段（0-4）
      // stage 2：建议阶段，相对稳定的特性
      stage: 2,
      // 使用 .browserslistrc 配置的浏览器目标
      // 不需要在这里重复指定
      autoprefixer: {
        // 禁用 postcss-preset-env 内置的 autoprefixer
        // 因为我们已经单独使用了 autoprefixer 插件
        disable: true
      }
    })
  ]
}
