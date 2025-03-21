import axios from 'axios'
import { getNewToken } from '~/api/authApi'
import { getToken, getRefreshToken, setToken, removeToken, removeRefreshToken } from '~/utils/auth'
import { ERROR_CODE } from '~/error/errorCode'
import router from '~/router'
import { ElMessage } from 'element-plus'

const axio = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000
})

let isRefreshing = false
let refreshSubscribers = []

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

// 请求拦截器：自动携带 access_token
axio.interceptors.request.use(
  (config) => {
    const token = getToken()
    const refreshToken = getRefreshToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    } else if (refreshToken) {
      config.headers['Authorization'] = `Bearer ${refreshToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：处理 token 过期逻辑
axio.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    const originalRequest = error.config
    const code = error?.response?.data?.code
    const refreshToken = getRefreshToken()
    console.log("error", error, "code", code)

    if (code === ERROR_CODE.ACCESSTOKEN_UNAUTHORIZED) {
      removeToken()
      removeRefreshToken()
      ElMessage.error('Token is expired, please login again')
      router.push('/login')
      return Promise.reject(error.response.data)
    }

    if (code === ERROR_CODE.ACCESSTOKEN_EXPIRED && !originalRequest._retry) {
      console.log("accesstoken expired")
      originalRequest._retry = true

      if (!refreshToken) return Promise.reject(error.response.data)
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
            resolve(axio(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const res = await getNewToken(refreshToken)
        const newAccessToken = res.data.data.newAccessToken 
        setToken(newAccessToken)
        onTokenRefreshed(newAccessToken)

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return axio(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error.response.data)
  }
)

export default axio
