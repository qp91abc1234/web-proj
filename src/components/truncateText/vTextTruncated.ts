export const vTextTruncated = {
  mounted(el, binding) {
    const checkTruncated = () => {
      setTimeout(() => {
        // 延迟等待元素的样式计算
        let isTruncated = false

        // 对象：v-textTruncated="{ callback: (val) => xxx, lines: 2 }"
        const callback = binding.value?.callback
        const lines = binding.value?.lines || 1

        // 根据行数判断截断方式
        if (lines === 1) {
          // 单行截断：比较宽度
          isTruncated = el.scrollWidth > el.clientWidth
        } else {
          // 多行截断：比较高度
          // 添加容差值避免精度问题（浏览器渲染可能有 1-2px 的误差）
          const tolerance = 2
          isTruncated = el.scrollHeight > el.clientHeight + tolerance
        }

        // 调用回调函数
        if (callback && typeof callback === 'function') {
          callback(isTruncated)
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
