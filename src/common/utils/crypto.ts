import CryptoJS from 'crypto-js'

export interface CryptoOptions {
  /** 密钥 */
  secret: string
  /** 是否在加密/解密失败时抛出错误，默认 false */
  throwOnError?: boolean
}

/**
 * AES 加密工具类
 *
 * @description
 * 提供基于 AES 算法的数据加密和解密功能，支持任意可序列化的对象。
 * 使用 CryptoJS 库实现，确保数据传输和存储的安全性。
 *
 * @template T - 要加密/解密的数据类型（必须可 JSON 序列化）
 *
 * @example
 * ```ts
 * // 基础用法
 * const crypto = new Crypto<{ username: string; token: string }>({ secret: 'my-secret-key' })
 *
 * const data = { username: 'admin', token: 'abc123' }
 * const encrypted = crypto.encrypt(data)
 * console.log(encrypted) // "U2FsdGVkX1..."
 *
 * const decrypted = crypto.decrypt(encrypted)
 * console.log(decrypted) // { username: 'admin', token: 'abc123' }
 * ```
 *
 * @example
 * ```ts
 * // 静态方法快速使用
 * const encrypted = Crypto.quickEncrypt({ userId: 123 }, 'secret-key')
 * const decrypted = Crypto.quickDecrypt(encrypted, 'secret-key')
 * ```
 *
 * @example
 * ```ts
 * // 错误处理
 * const crypto = new Crypto<User>({ secret: 'key', throwOnError: true })
 * try {
 *   const result = crypto.decrypt('invalid-data')
 * } catch (error) {
 *   console.error('解密失败:', error.message)
 * }
 * ```
 */
export class Crypto<T extends object = any> {
  /** 密钥 */
  private readonly secret: string
  /** 是否在错误时抛出异常 */
  private readonly throwOnError: boolean

  constructor(options: CryptoOptions | string) {
    // 兼容旧版本：支持直接传入字符串作为 secret
    if (typeof options === 'string') {
      this.secret = options
      this.throwOnError = false
    } else {
      this.secret = options.secret
      this.throwOnError = options.throwOnError ?? false
    }

    if (!this.secret || this.secret.trim() === '') {
      throw new Error('Crypto: secret 不能为空')
    }
  }

  /**
   * 加密数据
   *
   * @param data - 要加密的数据对象
   * @returns 加密后的字符串
   * @throws 如果 throwOnError 为 true 且加密失败，则抛出错误
   *
   * @example
   * ```ts
   * const crypto = new Crypto<{ id: number }>({ secret: 'key' })
   * const encrypted = crypto.encrypt({ id: 123 })
   * ```
   */
  encrypt(data: T): string | null {
    if (!data || typeof data !== 'object') {
      return this.handleError('加密失败：数据必须是对象类型')
    }

    try {
      const dataString = JSON.stringify(data)
      const encrypted = CryptoJS.AES.encrypt(dataString, this.secret)
      return encrypted.toString()
    } catch (error) {
      return this.handleError(`加密失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 解密数据
   *
   * @param encrypted - 加密后的字符串
   * @returns 解密后的数据对象，失败时返回 null（除非 throwOnError 为 true）
   * @throws 如果 throwOnError 为 true 且解密失败，则抛出错误
   *
   * @example
   * ```ts
   * const crypto = new Crypto<{ id: number }>({ secret: 'key' })
   * const decrypted = crypto.decrypt('U2FsdGVkX1...')
   * if (decrypted) {
   *   console.log(decrypted.id)
   * }
   * ```
   */
  decrypt(encrypted: string): T | null {
    if (!encrypted || typeof encrypted !== 'string') {
      return this.handleError('解密失败：加密数据必须是非空字符串')
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.secret)
      const dataString = decrypted.toString(CryptoJS.enc.Utf8)

      if (!dataString) {
        return this.handleError('解密失败：无法解密数据，可能密钥不正确')
      }

      try {
        return JSON.parse(dataString) as T
      } catch {
        return this.handleError('解密失败：数据格式不正确，无法解析 JSON')
      }
    } catch (error) {
      return this.handleError(`解密失败：${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 验证加密数据是否有效（尝试解密）
   *
   * @param encrypted - 加密后的字符串
   * @returns 是否为有效的加密数据
   *
   * @example
   * ```ts
   * const crypto = new Crypto({ secret: 'key' })
   * if (crypto.isValid(encryptedData)) {
   *   const data = crypto.decrypt(encryptedData)
   * }
   * ```
   */
  isValid(encrypted: string): boolean {
    if (!encrypted || typeof encrypted !== 'string') {
      return false
    }

    try {
      const result = this.decrypt(encrypted)
      return result !== null
    } catch {
      return false
    }
  }

  /**
   * 处理错误
   * @private
   */
  private handleError(message: string): null {
    if (this.throwOnError) {
      throw new Error(message)
    }
    if (import.meta.env.DEV) {
      console.warn(message)
    }
    return null
  }

  // ==================== 静态方法 ====================

  /**
   * 快速加密（静态方法）
   *
   * @param data - 要加密的数据
   * @param secret - 密钥
   * @returns 加密后的字符串，失败返回 null
   *
   * @example
   * ```ts
   * const encrypted = Crypto.quickEncrypt({ userId: 123 }, 'my-secret')
   * ```
   */
  static quickEncrypt<T extends object>(data: T, secret: string): string | null {
    const crypto = new Crypto<T>({ secret })
    return crypto.encrypt(data)
  }

  /**
   * 快速解密（静态方法）
   *
   * @param encrypted - 加密后的字符串
   * @param secret - 密钥
   * @returns 解密后的数据，失败返回 null
   *
   * @example
   * ```ts
   * const decrypted = Crypto.quickDecrypt<User>(encrypted, 'my-secret')
   * ```
   */
  static quickDecrypt<T extends object = any>(encrypted: string, secret: string): T | null {
    const crypto = new Crypto<T>({ secret })
    return crypto.decrypt(encrypted)
  }

  /**
   * 验证加密数据是否有效（静态方法）
   *
   * @param encrypted - 加密后的字符串
   * @param secret - 密钥
   * @returns 是否为有效的加密数据
   *
   * @example
   * ```ts
   * if (Crypto.isValidEncrypted(data, 'secret')) {
   *   // 数据有效
   * }
   * ```
   */
  static isValidEncrypted(encrypted: string, secret: string): boolean {
    const crypto = new Crypto({ secret })
    return crypto.isValid(encrypted)
  }
}
