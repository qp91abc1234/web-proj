import { customAlphabet, nanoid as nanoId } from 'nanoid'
import { v4 as uuidV4 } from 'uuid'

/**
 * 唯一 ID 生成工具
 *
 * 提供多种 ID 生成方式，满足不同场景需求
 *
 * @module uniqueId
 */

/**
 * nanoid - 生成短小、安全、URL 友好的唯一 ID
 *
 * @description
 * - 默认长度 21 个字符
 * - 使用 URL 安全字符（A-Za-z0-9_-）
 * - 碰撞概率极低
 *
 * @example
 * ```ts
 * import { nanoid } from '@/common/utils/uniqueId'
 *
 * const id = nanoid()
 * // => "V1StGXR8_Z5jdHi6B-myT"
 *
 * const shortId = nanoid(10)
 * // => "IRFa-VaY2b"
 * ```
 */
export const nanoid = nanoId

/**
 * uuidv4 - 生成标准 UUID v4
 *
 * @description
 * - 标准 36 个字符（含连字符）
 * - 格式：xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * - 适用于需要标准 UUID 的场景
 *
 * @example
 * ```ts
 * import { uuidv4 } from '@/common/utils/uniqueId'
 *
 * const id = uuidv4()
 * // => "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
 * ```
 */
export const uuidv4 = uuidV4

/**
 * 创建自定义字符集的 ID 生成器
 *
 * @param alphabet - 自定义字符集
 * @param length - ID 长度，默认 21
 * @returns ID 生成函数
 *
 * @example
 * ```ts
 * import { createIdGenerator } from '@/common/utils/uniqueId'
 *
 * // 创建只包含数字和小写字母的生成器
 * const customId = createIdGenerator('0123456789abcdef', 8)
 * const id = customId()
 * // => "a3c5f2d9"
 *
 * // 创建表情符号 ID 生成器（有趣但不推荐生产使用）
 * const emojiId = createIdGenerator('😀😃😄😁😆😅😂🤣', 5)
 * const emoji = emojiId()
 * // => "😀😄😆😅😂"
 * ```
 */
export function createIdGenerator(alphabet: string, length = 21): () => string {
  return customAlphabet(alphabet, length)
}
