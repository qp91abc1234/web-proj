const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 创建匹配图片路径的正则表达式
 */
export function createImagePattern(fileName: string): RegExp {
  const escapedFileName = escapeRegExp(fileName)
  // 匹配各种可能的路径格式：
  // - "/assets/xxx.png" (绝对路径)
  // - "./assets/xxx.png" (当前目录相对路径)
  // - "../assets/xxx.png" (父级目录相对路径)
  // - "assets/xxx.png" (直接路径)
  return new RegExp(`(['"\`])(?:\\.\\./)*(?:\\./)?(/?)(${escapedFileName})\\1`, 'g')
}

/**
 * 创建匹配 CSS url() 引用的正则表达式
 */
export function createCssUrlPattern(fileName: string): RegExp {
  const escapedFileName = escapeRegExp(fileName)
  // 匹配 CSS 中的 url() 引用，支持各种路径格式
  return new RegExp(`url\\((['"\`]?)(?:\\.\\./)*(?:\\./)?(/?)(${escapedFileName})\\1\\)`, 'g')
}

/**
 * 并发控制：限制同时进行的上传任务数量
 */
export async function uploadWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const promise = task().then((result) => {
      results.push(result)
      // 从执行队列中移除已完成的任务
      executing.splice(executing.indexOf(promise), 1)
    })

    executing.push(promise)

    // 当达到并发限制时，等待其中一个任务完成
    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  // 等待所有剩余任务完成
  await Promise.all(executing)

  return results
}

/**
 * 匹配文件是否为图片且符合 include/exclude 规则
 */
export function isMatch(
  fileName: string,
  include?: string | RegExp | (string | RegExp)[],
  exclude?: string | RegExp | (string | RegExp)[]
): boolean {
  if (!IMAGE_REGEX.test(fileName)) return false

  // 如果指定了 include，必须匹配 include
  if (include) {
    const includes = Array.isArray(include) ? include : [include]
    const isIncluded = includes.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(fileName) : fileName.includes(pattern)
    )
    if (!isIncluded) return false
  }

  // 如果指定了 exclude，不能匹配 exclude
  if (exclude) {
    const excludes = Array.isArray(exclude) ? exclude : [exclude]
    const isExcluded = excludes.some((pattern) =>
      pattern instanceof RegExp ? pattern.test(fileName) : fileName.includes(pattern)
    )
    if (isExcluded) return false
  }

  return true
}
