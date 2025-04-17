export function getCssVar(varName: string, element: HTMLElement = document.documentElement) {
  if (!varName?.startsWith('--')) {
    console.error("CSS 变量名应以 '--' 开头")
    return ''
  }
  // 没有拿到值时，会返回空串
  return getComputedStyle(element).getPropertyValue(varName)
}

export function setCssVar(
  varName: string,
  value: string,
  element: HTMLElement = document.documentElement
) {
  if (!varName?.startsWith('--')) {
    console.error("CSS 变量名应以 '--' 开头")
    return
  }
  element.style.setProperty(varName, value)
}
