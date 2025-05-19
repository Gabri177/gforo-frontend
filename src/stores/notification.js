
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  const hasUnread = ref(false)

  function setUnread(value) {
    hasUnread.value = value
  }

  return {
    hasUnread,
    setUnread,
  }
})
