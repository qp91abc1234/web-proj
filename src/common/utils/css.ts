/**
 * CSS 变量名类型（以 -- 开头的字符串）
 */
export type CssVarName = `--${string}`

/**
 * CSS 优先级类型
 * - 'important': 设置为 !important
 * - '': 普通优先级（默认）
 */
export type CssPriority = 'important' | ''

/**
 * CSS 变量配置
 */
export interface CssVarConfig {
  /** CSS 变量名 */
  name: CssVarName | string
  /** CSS 变量值 */
  value: string
  /** 优先级，只能是 'important' 或空字符串 */
  priority?: CssPriority
}

/**
 * 确保变量名以 -- 开头
 */
function ensureCssVarPrefix(varName: string): string {
  return varName.startsWith('--') ? varName : `--${varName}`
}

/**
 * 获取 CSS 变量值
 *
 * @param varName - CSS 变量名（可以省略 -- 前缀）
 * @param options - 配置选项或默认值字符串
 * @returns CSS 变量的值，如果未找到则返回默认值或空字符串
 *
 * @example
 * ```ts
 * // 基础用法
 * const primaryColor = getCssVar('primary-color')
 *
 * // 使用默认值
 * const color = getCssVar('primary-color', { defaultValue: '#1890ff' })
 *
 * // 简写：直接传默认值字符串
 * const color = getCssVar('primary-color', '#1890ff')
 *
 * // 指定元素
 * const btnColor = getCssVar('btn-color', { element: buttonElement })
 *
 * // 完整配置
 * const color = getCssVar('primary-color', {
 *   defaultValue: '#1890ff',
 *   element: buttonElement
 * })
 * ```
 */
export function getCssVar(
  varName: string,
  options?: string | { defaultValue?: string; element?: HTMLElement }
): string {
  if (!varName) {
    console.warn('getCssVar: 变量名不能为空')
    return ''
  }

  // 解析参数
  let defaultValue = ''
  let element = document.documentElement

  if (typeof options === 'string') {
    // 简写：直接传默认值
    defaultValue = options
  } else if (options) {
    // 对象配置
    defaultValue = options.defaultValue || ''
    element = options.element || document.documentElement
  }

  const normalizedName = ensureCssVarPrefix(varName)
  const value = getComputedStyle(element).getPropertyValue(normalizedName).trim()

  return value || defaultValue
}

/**
 * 设置 CSS 变量
 *
 * @param varName - CSS 变量名（可以省略 -- 前缀）
 * @param value - CSS 变量值
 * @param element - 要设置变量的元素，默认为 document.documentElement
 * @param priority - 优先级，只能是 'important' 或空字符串（默认）
 *
 * @example
 * ```ts
 * // 设置主题颜色（普通优先级）
 * setCssVar('primary-color', '#1890ff')
 *
 * // 设置重要优先级（相当于 !important）
 * setCssVar('primary-color', '#1890ff', document.documentElement, 'important')
 *
 * // 明确设置普通优先级
 * setCssVar('primary-color', '#1890ff', document.documentElement, '')
 * ```
 */
export function setCssVar(
  varName: string,
  value: string,
  element: HTMLElement = document.documentElement,
  priority?: CssPriority
): void {
  if (!varName) {
    console.warn('setCssVar: 变量名不能为空')
    return
  }

  const normalizedName = ensureCssVarPrefix(varName)
  element.style.setProperty(normalizedName, value, priority)
}

/**
 * 移除 CSS 变量
 *
 * @param varName - CSS 变量名（可以省略 -- 前缀）
 * @param element - 要移除变量的元素，默认为 document.documentElement
 *
 * @example
 * ```ts
 * removeCssVar('--primary-color')
 * removeCssVar('primary-color')
 * ```
 */
export function removeCssVar(
  varName: string,
  element: HTMLElement = document.documentElement
): void {
  if (!varName) {
    console.warn('removeCssVar: 变量名不能为空')
    return
  }

  const normalizedName = ensureCssVarPrefix(varName)
  element.style.removeProperty(normalizedName)
}

/**
 * 检查 CSS 变量是否存在（是否有值）
 *
 * @param varName - CSS 变量名（可以省略 -- 前缀）
 * @param element - 要检查的元素，默认为 document.documentElement
 * @returns 变量是否存在
 *
 * @example
 * ```ts
 * if (hasCssVar('primary-color')) {
 *   console.log('主题颜色已设置')
 * }
 * ```
 */
export function hasCssVar(
  varName: string,
  element: HTMLElement = document.documentElement
): boolean {
  const value = getCssVar(varName, { element })
  return value !== ''
}

/**
 * 批量获取 CSS 变量
 *
 * @param varNames - CSS 变量名数组
 * @param element - 要获取变量的元素，默认为 document.documentElement
 * @returns 变量名到值的映射对象
 *
 * @example
 * ```ts
 * const colors = getCssVars(['primary-color', 'secondary-color', 'success-color'])
 * console.log(colors)
 * // { '--primary-color': '#1890ff', '--secondary-color': '#52c41a', ... }
 * ```
 */
export function getCssVars(
  varNames: string[],
  element: HTMLElement = document.documentElement
): Record<string, string> {
  return varNames.reduce(
    (acc, varName) => {
      const normalizedName = ensureCssVarPrefix(varName)
      acc[normalizedName] = getCssVar(varName, { element })
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * 批量设置 CSS 变量
 *
 * @param vars - 变量配置对象或数组
 * @param element - 要设置变量的元素，默认为 document.documentElement
 *
 * @example
 * ```ts
 * // 使用对象（最常用）
 * setCssVars({
 *   'primary-color': '#1890ff',
 *   'secondary-color': '#52c41a'
 * })
 *
 * // 使用配置数组（支持优先级）
 * setCssVars([
 *   { name: 'primary-color', value: '#1890ff' },
 *   { name: 'secondary-color', value: '#52c41a', priority: 'important' }
 * ])
 *
 * // 主题切换场景
 * const lightTheme = {
 *   'primary-color': '#1890ff',
 *   'bg-color': '#ffffff',
 *   'text-color': '#000000'
 * }
 *
 * const darkTheme = {
 *   'primary-color': '#177ddc',
 *   'bg-color': '#141414',
 *   'text-color': '#ffffff'
 * }
 *
 * setCssVars(isDark ? darkTheme : lightTheme)
 * ```
 */
export function setCssVars(
  vars: Record<string, string> | CssVarConfig[],
  element: HTMLElement = document.documentElement
): void {
  if (Array.isArray(vars)) {
    vars.forEach(({ name, value, priority }) => {
      setCssVar(name, value, element, priority)
    })
  } else {
    Object.entries(vars).forEach(([name, value]) => {
      setCssVar(name, value, element)
    })
  }
}

/**
 * 切换 CSS 变量值（在两个值之间切换）
 *
 * @param varName - CSS 变量名（可以省略 -- 前缀）
 * @param value1 - 第一个值
 * @param value2 - 第二个值
 * @param element - 要切换变量的元素，默认为 document.documentElement
 * @param priority - 优先级，只能是 'important' 或空字符串（默认）
 * @returns 切换后的值
 *
 * @example
 * ```ts
 * // 切换主题
 * const newTheme = toggleCssVar('theme', 'light', 'dark')
 * console.log(newTheme) // 'dark' 或 'light'
 *
 * // 切换主题并设置为 important
 * const newTheme = toggleCssVar('theme', 'light', 'dark', document.documentElement, 'important')
 * ```
 */
export function toggleCssVar(
  varName: string,
  value1: string,
  value2: string,
  element: HTMLElement = document.documentElement,
  priority?: CssPriority
): string {
  const currentValue = getCssVar(varName, { element })
  const newValue = currentValue === value1 ? value2 : value1
  setCssVar(varName, newValue, element, priority)
  return newValue
}

/**
 * 获取所有已定义的 CSS 变量
 *
 * @param element - 要获取变量的元素，默认为 document.documentElement
 * @returns 所有 CSS 变量的映射对象
 *
 * @example
 * ```ts
 * const allVars = getAllCssVars()
 * console.log(allVars)
 * // { '--primary-color': '#1890ff', '--font-size': '14px', ... }
 * ```
 */
export function getAllCssVars(
  element: HTMLElement = document.documentElement
): Record<string, string> {
  const styles = getComputedStyle(element)
  const cssVars: Record<string, string> = {}

  // 遍历所有样式属性
  for (let i = 0; i < styles.length; i++) {
    const name = styles[i]
    if (name.startsWith('--')) {
      cssVars[name] = styles.getPropertyValue(name).trim()
    }
  }

  return cssVars
}

/**
 * 移除多个 CSS 变量
 *
 * @param varNames - CSS 变量名数组
 * @param element - 要移除变量的元素，默认为 document.documentElement
 *
 * @example
 * ```ts
 * removeCssVars(['primary-color', 'secondary-color'])
 * ```
 */
export function removeCssVars(
  varNames: string[],
  element: HTMLElement = document.documentElement
): void {
  varNames.forEach((varName) => removeCssVar(varName, element))
}
