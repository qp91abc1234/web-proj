import { useRafFn } from '@vueuse/core'
import { ref, computed, onScopeDispose } from 'vue'

/** 倒计时状态 */
export type CountDownStatus = 'idle' | 'running' | 'paused'

export interface UseCountDownOptions {
  /** 倒计时秒数 */
  seconds?: number
  /** 倒计时结束时的回调函数 */
  onFinish?: () => void
  /** 倒计时开始时的回调函数 */
  onStart?: () => void
  /** 倒计时停止时的回调函数 */
  onStop?: () => void
}

/**
 * 倒计时 Hook
 *
 * @param options - 配置选项
 * @returns 倒计时控制方法和状态
 * - `remainingTime`: 剩余时间（秒，向上取整）
 * - `remainingTimeExact`: 剩余时间（秒，精确值）
 * - `status`: 倒计时状态（'idle' | 'running' | 'paused'）
 * - `isRunning`: 是否正在运行（computed）
 * - `isPaused`: 是否已暂停（computed）
 * - `isIdle`: 是否空闲状态（computed）
 * - `formattedTime`: 格式化的时间字符串 (mm:ss)
 * - `start`: 开始倒计时
 * - `stop`: 停止倒计时并重置
 * - `pause`: 暂停倒计时
 * - `resume`: 恢复倒计时
 * - `reset`: 重置倒计时
 *
 * @example
 * ```ts
 * // 基础用法
 * const { remainingTime, status, start, stop } = useCountDown({ seconds: 60 })
 * start()
 *
 * // 带回调
 * const countdown = useCountDown({
 *   seconds: 60,
 *   onFinish: () => console.log('倒计时结束！')
 * })
 *
 * // 使用格式化时间
 * const { formattedTime, start } = useCountDown({ seconds: 120 })
 * console.log(formattedTime.value) // "02:00"
 *
 * // 根据状态显示不同内容
 * const { status, isRunning, start, pause, resume } = useCountDown({ seconds: 60 })
 * if (status.value === 'running') pause()
 * if (isRunning.value) pause()  // 等价写法
 * ```
 */
export function useCountDown(options: UseCountDownOptions = {}) {
  const { seconds = 60, onFinish, onStart, onStop } = options

  const status = ref<CountDownStatus>('idle')
  let startTime = 0
  let pausedTime = 0
  let pausedAt = 0

  const remainingTimeExact = ref(seconds)
  const remainingTime = computed(() => Math.ceil(remainingTimeExact.value))

  // 状态派生属性
  const isRunning = computed(() => status.value === 'running')
  const isPaused = computed(() => status.value === 'paused')
  const isIdle = computed(() => status.value === 'idle')

  // 格式化时间为 mm:ss 格式
  const formattedTime = computed(() => {
    const total = remainingTime.value
    const mins = Math.floor(total / 60)
    const secs = total % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  // Raf: requestAnimationFrame
  const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
    () => {
      const elapsed = (Date.now() - startTime - pausedTime) / 1000
      remainingTimeExact.value = Math.max(0, seconds - elapsed)

      if (remainingTimeExact.value === 0) {
        status.value = 'idle'
        pauseRaf()
        onFinish?.()
      }
    },
    { immediate: false }
  )

  /**
   * 开始倒计时
   */
  function start() {
    if (status.value === 'running') {
      return
    }

    status.value = 'running'
    startTime = Date.now()
    pausedTime = 0
    remainingTimeExact.value = seconds
    resumeRaf()
    onStart?.()
  }

  /**
   * 停止倒计时并重置
   */
  function stop() {
    if (status.value === 'idle') {
      return
    }

    status.value = 'idle'
    remainingTimeExact.value = seconds
    pausedTime = 0
    pauseRaf()
    onStop?.()
  }

  /**
   * 暂停倒计时
   */
  function pause() {
    if (status.value !== 'running') {
      return
    }

    status.value = 'paused'
    pausedAt = Date.now()
    pauseRaf()
  }

  /**
   * 恢复倒计时
   */
  function resume() {
    if (status.value !== 'paused') {
      return
    }

    status.value = 'running'
    pausedTime += Date.now() - pausedAt
    resumeRaf()
  }

  /**
   * 重置倒计时到初始状态
   */
  function reset() {
    status.value = 'idle'
    remainingTimeExact.value = seconds
    pausedTime = 0
    pauseRaf()
  }

  onScopeDispose(() => {
    pauseRaf()
  })

  return {
    remainingTime,
    remainingTimeExact,
    formattedTime,
    status,
    isRunning,
    isPaused,
    isIdle,
    start,
    stop,
    pause,
    resume,
    reset
  }
}
