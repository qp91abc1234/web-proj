import { ref, onScopeDispose } from 'vue'
import { debounce } from 'lodash-es'

/** 参考 Bootstrap 的响应式设计：992px 及以下为移动端 */
const MAX_MOBILE_WIDTH = 992

/** 移动设备 User Agent 正则 */
const MOBILE_USER_AGENT_REGEX =
  /ipad|iphone|midp|rv:1\.2\.3\.4|ucweb|android|windows ce|windows mobile/i

export function useMobile() {
  const isMobile = ref(false)

  /**
   * 根据屏幕宽度判断是否为移动端
   */
  const isMobileBySize = (): boolean => {
    const bodyWidth = document.body.getBoundingClientRect().width
    return bodyWidth <= MAX_MOBILE_WIDTH
  }

  /**
   * 根据 User Agent 判断是否为移动设备
   * @returns true: 移动设备, false: PC设备
   */
  const isMobileByUserAgent = (): boolean => {
    try {
      const userAgent = navigator.userAgent
      return MOBILE_USER_AGENT_REGEX.test(userAgent)
    } catch {
      // 异常情况默认为 PC
      return false
    }
  }

  /**
   * 综合判断设备类型
   * 优先级：User Agent > 屏幕尺寸
   */
  const checkIsMobile = debounce(() => {
    // 如果 UA 识别为移动设备，直接判定为移动端
    if (isMobileByUserAgent()) {
      isMobile.value = true
      return
    }

    // 否则根据屏幕尺寸判断
    isMobile.value = isMobileBySize()
  }, 150)

  // 监听窗口大小变化
  window.addEventListener('resize', checkIsMobile)

  // 清理事件监听
  onScopeDispose(() => {
    // 取消未执行的防抖调用
    checkIsMobile.cancel()
    window.removeEventListener('resize', checkIsMobile)
  })

  // 初始化判断
  checkIsMobile()

  return {
    isMobile
  }
}
