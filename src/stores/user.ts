import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    token: '',
    isLoggedIn: false,
  }),
  actions: {
    login(username: string, password: string) {
      // 模拟登录
      if (username && password) {
        this.username = username
        this.token = 'mock-token-123'
        this.isLoggedIn = true
      }
    },
    logout() {
      this.username = ''
      this.token = ''
      this.isLoggedIn = false
    },
  },
  persist: [
      {
        key: 'user-store',
        storage: localStorage, // 也可以换成 sessionStorage
      }
    ]
})
