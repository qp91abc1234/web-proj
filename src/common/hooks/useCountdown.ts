import { useRafFn } from '@vueuse/core'
import { ref, computed, onScopeDispose } from 'vue'

export function useCountDown(seconds: number = 60, cb?: () => void) {
  let isRunning = false
  let startTime = 0

  const _remainingTime = ref(seconds)
  const remainingTime = computed(() => Math.ceil(_remainingTime.value))

  const { pause: pauseRaf, resume: resumeRaf } = useRafFn(
    () => {
      _remainingTime.value = seconds - (Date.now() - startTime) / 1000
      _remainingTime.value = Math.max(0, _remainingTime.value)
      if (_remainingTime.value === 0) {
        isRunning = false
        pauseRaf()
        cb?.()
      }
    },
    { immediate: false }
  )

  function start() {
    if (isRunning) {
      pauseRaf()
    }

    startTime = Date.now()
    _remainingTime.value = seconds
    resumeRaf()
  }

  function stop() {
    isRunning = false
    _remainingTime.value = seconds
    pauseRaf()
  }

  onScopeDispose(() => {
    pauseRaf()
  })

  return {
    remainingTime,
    start,
    stop
  }
}
