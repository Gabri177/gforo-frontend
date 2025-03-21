import router from '~/router'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';


// 获取 access token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 设置 access token
export function setToken(token) {
  return localStorage.setItem(TOKEN_KEY, token);
}

// 移除 access token
export function removeToken() {
  return localStorage.removeItem(TOKEN_KEY);
}

// 获取 refresh token
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// 设置 refresh token
export function setRefreshToken(token) {
  return localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

// 移除 refresh token
export function removeRefreshToken() {
  return localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// 清除所有 token
export function clearTokens() {
  removeToken();
  removeRefreshToken();
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken() && !!getRefreshToken();
} 

export function logoutAndRedirect() {
  removeToken()
  removeRefreshToken()
  ElMessage.error('登录已过期，请重新登录')
  router.push('/login')
}