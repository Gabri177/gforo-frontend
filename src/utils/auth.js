import router from '~/router'
import { ElMessage } from 'element-plus'
import { getNewToken } from '~/api/authApi';

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
  // console.log("getRefreshToken=================")
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
  ElMessage.error('Login has expired, please login again')
  router.push('/login')
}

// 封装自动刷新 AccessToken 的逻辑
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    logoutAndRedirect();
    return Promise.reject(new Error('RefreshToken 不存在'));
  }

  try {
    const res = await getNewToken(refreshToken);
    const data = res.data;

    if (data && data.accessToken && data.refreshToken) {
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      console.log('🔁 已自动刷新 Token');
      return data;
    } else {
      throw new Error('返回数据格式错误');
    }

  } catch (err) {
    console.warn('🚫 Token刷新失败：', err);
    logoutAndRedirect();
    return Promise.reject(err);
  }
}