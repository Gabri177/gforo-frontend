// src/directives/permission.ts
import { useAuthStore } from '@/stores/auth'

// 封装成函数式指令，使用时自动访问 store
const permissionDirective = {
  mounted(el, binding) {
    const authStore = useAuthStore()
    const requiredPermission = binding.value

    if (!authStore.hasPermission(requiredPermission)) {
      el.remove() // 没权限就移除元素
    }
  }
}

export default permissionDirective
