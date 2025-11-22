import { createStorageRef } from '@/common/utils/storage'

import 'element-plus/theme-chalk/dark/css-vars.css'

/** 主题模式 */
type ThemeMode = 'light' | 'dark'

/** 主题配置接口 */
interface ThemeConfig {
  /** 是否为暗色模式 */
  darkMode: boolean
  /** 主色调 */
  primary: string
  /** 其他颜色配置 */
  [key: string]: string | boolean
}

/** 混合颜色的基准色 */
const MIX_BASE_COLORS: Record<ThemeMode, [string, string]> = {
  light: ['#ffffff', '#000000'], // [浅色基准, 深色基准]
  dark: ['#000000', '#ffffff'] // [深色基准, 浅色基准]
}

/** Element Plus 颜色变量的亮度级别 */
const LIGHT_LEVELS = [3, 5, 7, 8, 9] as const

/** 暗色调混合比例 */
const DARK_MIX_WEIGHT = 0.2

/** 默认主题配置 */
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  darkMode: false,
  primary: '#409eff'
}

/**
 * 解析十六进制颜色为 RGB 值
 * @param hex - 十六进制颜色值，如 #ffffff
 * @returns RGB 对象
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.substring(1, 3), 16),
    g: parseInt(hex.substring(3, 5), 16),
    b: parseInt(hex.substring(5, 7), 16)
  }
}

/**
 * 将 RGB 值转换为十六进制颜色
 * @param r - 红色值 (0-255)
 * @param g - 绿色值 (0-255)
 * @param b - 蓝色值 (0-255)
 * @returns 十六进制颜色值
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => `0${(value || 0).toString(16)}`.slice(-2)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * 混合两种颜色
 * @param color1 - 第一种颜色（十六进制）
 * @param color2 - 第二种颜色（十六进制）
 * @param weight - color2 的权重 (0-1)，0 表示完全是 color1，1 表示完全是 color2
 * @returns 混合后的颜色（十六进制）
 */
function mixColors(color1: string, color2: string, weight: number): string {
  // 确保权重在 0-1 之间
  const normalizedWeight = Math.max(Math.min(weight, 1), 0)

  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  // 计算混合后的 RGB 值
  const r = Math.round(rgb1.r * (1 - normalizedWeight) + rgb2.r * normalizedWeight)
  const g = Math.round(rgb1.g * (1 - normalizedWeight) + rgb2.g * normalizedWeight)
  const b = Math.round(rgb1.b * (1 - normalizedWeight) + rgb2.b * normalizedWeight)

  return rgbToHex(r, g, b)
}

/**
 * 应用主题配置到 DOM
 * @param config - 主题配置
 */
function applyThemeConfig(config: ThemeConfig): void {
  const root = document.documentElement
  const mode: ThemeMode = config.darkMode ? 'dark' : 'light'
  const [lightBase, darkBase] = MIX_BASE_COLORS[mode]

  // 设置暗色模式 class
  root.setAttribute('class', config.darkMode ? 'dark' : '')

  // 应用每个颜色配置
  Object.entries(config).forEach(([key, value]) => {
    // 跳过 darkMode 配置项
    if (key === 'darkMode') return

    const colorValue = value as string
    const cssVarPrefix = `--el-color-${key}`

    // 设置主色
    root.style.setProperty(cssVarPrefix, colorValue)

    // 设置亮色系列（light-3, light-5, light-7, light-8, light-9）
    LIGHT_LEVELS.forEach((level) => {
      const mixedColor = mixColors(colorValue, lightBase, level / 10)
      root.style.setProperty(`${cssVarPrefix}-light-${level}`, mixedColor)
    })

    // 设置暗色（dark-2）
    const darkColor = mixColors(colorValue, darkBase, DARK_MIX_WEIGHT)
    root.style.setProperty(`${cssVarPrefix}-dark-2`, darkColor)
  })
}

/**
 * 主题管理 Hook
 * 提供响应式的主题配置，支持亮色/暗色模式切换和主题色自定义
 *
 * @returns themeCfg - 主题配置的响应式引用
 *
 * @example
 * ```ts
 * const { themeCfg } = useTheme()
 *
 * // 切换暗色模式
 * themeCfg.value.darkMode = true
 *
 * // 修改主题色
 * themeCfg.value.primary = '#ff0000'
 * ```
 */
export function useTheme() {
  const themeCfg = createStorageRef('themeCfg', DEFAULT_THEME_CONFIG, {
    onChange: applyThemeConfig,
    immediate: true
  })

  return {
    themeCfg
  }
}
