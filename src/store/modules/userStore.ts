import { computed } from 'vue'
import { defineStore } from 'pinia'

import { createStorageRef } from '@/common/utils/storage'
import { login as loginApi, refreshToken as refreshTokenApi } from '@/common/api/auth'

/**
 * 用户状态 Store
 * 管理用户认证相关的状态和操作，包括：
 * - Token 管理（访问令牌和刷新令牌）
 * - 登录/登出
 * - Token 刷新
 *
 * @example
 * ```ts
 * const userStore = useUserStore()
 *
 * // 登录
 * await userStore.login({ username: 'admin', password: '123456' })
 *
 * // 检查登录状态
 * if (userStore.isLoggedIn) {
 *   console.log('用户已登录')
 * }
 *
 * // 登出
 * userStore.logout()
 * ```
 */
export const useUserStore = defineStore('user', () => {
  // ==================== 认证状态 ====================
  /** 访问令牌 */
  const token = createStorageRef('token', '')

  /** 刷新令牌 */
  const refreshToken = createStorageRef('refreshToken', '')

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!token.value)

  // ==================== 认证操作 ====================
  /**
   * 用户登录
   * @param params - 登录参数
   * @throws 登录失败时抛出错误
   */
  async function login(params: { username: string; password: string }): Promise<void> {
    const res = await loginApi(params)

    // 保存令牌
    token.value = res?.token ?? ''
    refreshToken.value = res?.refreshToken ?? ''
  }

  /**
   * 刷新访问令牌
   * 使用刷新令牌获取新的访问令牌
   * @throws 刷新失败时抛出错误
   */
  async function refresh(): Promise<void> {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    const res = await refreshTokenApi({
      refreshToken: refreshToken.value
    })

    // 更新令牌
    token.value = res?.token ?? ''
    refreshToken.value = res?.refreshToken ?? ''
  }

  /**
   * 用户登出
   * 清除所有认证信息
   */
  function logout(): void {
    token.value = ''
    refreshToken.value = ''
  }

  return {
    // 状态
    /** 访问令牌 */
    token,
    /** 刷新令牌 */
    refreshToken,
    /** 是否已登录 */
    isLoggedIn,

    // 方法
    /** 登录 */
    login,
    /** 刷新令牌 */
    refresh,
    /** 登出 */
    logout
  }
})
