export const vTextTruncated = {
  mounted(el, binding) {
    const checkTruncated = () => {
      setTimeout(() => {
        // 延迟等待元素的样式计算
        const value = el.scrollWidth > el.clientWidth
        // 调用回调函数
        if (binding.value && typeof binding.value === 'function') {
          binding.value(value)
        }
      }, 0)
    }

    // 存储检查函数以便在 updated 钩子中使用
    el._checkTruncated = checkTruncated

    // 初始检查
    checkTruncated()
  },
  updated(el) {
    // 当元素更新时重新检查
    if (el._checkTruncated) {
      el._checkTruncated()
    }
  }
}
