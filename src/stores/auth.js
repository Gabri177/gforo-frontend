// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// 从 localStorage 获取存储的权限信息
const savedAuth = JSON.parse(localStorage.getItem('authInfo') || '{}');

export const useAuthStore = defineStore('auth', () => {
  const permissions = ref(savedAuth.permissions || []);
  const roles = ref(savedAuth.roles || []);
  const boardIds = ref(savedAuth.boardIds || []);
  const isSuperAdmin = computed(() => {
    return roles.value.includes('ROLE_SUPER_ADMIN');
  });
  const isAdmin = computed(() => {
    return roles.value.includes('ROLE_ADMIN');
  });

  // 设置权限信息
  function setAuthInfo(res) {
    const ac = res?.accessControl || {};
    permissions.value = ac.permissions || [];
    roles.value = ac.roles || [];
    boardIds.value = ac.boardIds || [];

    // 保存到 localStorage
    localStorage.setItem('authInfo', JSON.stringify({
      permissions: permissions.value,
      roles: roles.value,
      boardIds: boardIds.value,
      isSuperAdmin: isSuperAdmin.value
    }));
  }

  // 清除权限信息
  function clearAuthInfo() {
    permissions.value = [];
    roles.value = [];
    boardIds.value = [];
    localStorage.removeItem('authInfo');
  }

  // 判断是否拥有某个权限
  function hasPermission(code) {
    if (!code) return false;
    return permissions.value.includes(code.trim());
  }

  // 判断是否为某个板块的板主
  function hasBoardId(id) {
    const boardId = Number(id);
    return boardIds.value.includes(boardId);
  }

  // 判断是否拥有某个角色
  function hasRole(role) {
    return roles.value.includes(role);
  }

  return {
    permissions,
    roles,
    boardIds,
    setAuthInfo,
    clearAuthInfo,
    hasPermission,
    hasBoardId,
    hasRole,
    isSuperAdmin
  };
});
