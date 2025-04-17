import { ref, onScopeDispose } from 'vue'

export function useMobile() {
  const isMobile = ref(false)

  const judgeBySize = () => {
    /** 参考 Bootstrap 的响应式设计将最大移动端宽度设置为 992 */
    const MAX_MOBILE_WIDTH = 992
    const rect = document.body.getBoundingClientRect()
    return rect.width - 1 < MAX_MOBILE_WIDTH
  }

  const isPCPlatform = (userAgent?: string): boolean => {
    try {
      const sUserAgent = userAgent || navigator.userAgent.toLowerCase()
      let isPC = true

      if (
        /ipad|iphone|iPhone|midp|rv:1.2.3.4|ucweb|android|Android|windows ce|windows mobile/.test(
          sUserAgent
        )
      ) {
        isPC = false
      }

      return isPC
    } catch {
      return true
    }
  }

  const resizeHandler = () => {
    isMobile.value = !isPCPlatform()
    if (!isMobile.value && !document.hidden) {
      isMobile.value = judgeBySize()
    }
  }

  window.addEventListener('resize', resizeHandler)

  onScopeDispose(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  resizeHandler()

  return {
    isMobile
  }
}
