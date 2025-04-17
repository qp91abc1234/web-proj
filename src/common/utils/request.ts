import Axios from 'axios'

import { useUserStore } from '@/store/modules/userStore'

interface PendingTask {
  succ: () => void
  fail: () => void
}
let refreshing = false
const queue: PendingTask[] = []

const instance = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 3000
})

instance.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.authorization = 'Bearer ' + userStore.token
  }
  return config
})

instance.interceptors.response.use((response) => {
  const userStore = useUserStore()
  const { data, config } = response

  if (data.status === 401) {
    if (!refreshing) {
      refreshing = true
      userStore
        .refresh()
        .then(() => {
          queue.forEach(({ succ }) => {
            succ()
          })
        })
        .catch(() => {
          userStore.logout()
          queue.forEach(({ fail }) => {
            fail()
          })
        })
        .finally(() => {
          refreshing = false
        })
    }

    return new Promise((resolve, reject) => {
      queue.push({
        succ: () => resolve(instance(config)),
        fail: () => reject(response)
      })
    })
  }

  if (data.status !== 200) {
    return Promise.reject(response)
  }
  return response.data
})

export const req = instance
