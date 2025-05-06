// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    permissions: []
  }),
  actions: {
    setPermissions(perms) {
      this.permissions = perms
    },
    clearPermissions() {
      this.permissions = []
    },
    hasPermission(code) {
      return this.permissions.includes(code)
    }
  }
})
