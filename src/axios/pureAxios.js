// ~/axios/pureAxios.js
import axios from 'axios'
import { removeToken, removeRefreshToken, logoutAndRedirect } from '~/utils/auth'
import { ERROR_CODE } from '~/error/errorCode'
import router from '~/router'
import { ElMessage } from 'element-plus'

const pureAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 5000
})

// 响应拦截器：专门处理 refresh token 无效/过期
pureAxios.interceptors.response.use(
  response => response, // 正常返回
  error => {
    const code = error?.response?.data?.code

    if (code === ERROR_CODE.REFRESHTOKEN_UNAUTHORIZED || code === ERROR_CODE.REFRESHTOKEN_EXPIRED) {
		logoutAndRedirect()
    }

    return Promise.reject(error)
  }
)

export default pureAxios
