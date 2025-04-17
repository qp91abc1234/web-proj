import { defineStore } from 'pinia'

import { req } from '@/common/utils/request'
import { createStorageRef } from '@/common/utils/storage'

export const useUserStore = defineStore('user', () => {
  const token = createStorageRef('token', '')
  const refreshToken = createStorageRef('refresh_token', '')

  async function login(username, password) {
    const res = await req.post('/auth/login', {
      username: username,
      password: password
    })
    token.value = res.data.token || ''
    refreshToken.value = res.data.refreshToken || ''
  }

  async function refresh() {
    const res = await req.post('/auth/refresh', {
      refreshToken: refreshToken.value
    })
    token.value = res.data.token || ''
    refreshToken.value = res.data.refreshToken || ''
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
  }

  return {
    token,
    refreshToken,
    login,
    refresh,
    logout
  }
})
