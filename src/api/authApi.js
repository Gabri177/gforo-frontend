import axio from '~/axios/index'
import pureAxios from '~/axios/pureAxios'

export function loginUser(userInfo){

	return axio.post(`/auth/login`, userInfo)
}

export function getNewToken(refreshToken){
	return pureAxios.post('/auth/refresh-token', {
		refreshToken,
		symbol: localStorage.getItem('deviceId') ? localStorage.getItem('deviceId') : 'USDT'
	})
}

export function logoutUser(){
	return axio.delete('/user/logout')
}

// 用来获取六位数的验证码 
// userinfo 包括username 和 email
export function forgetPassword(userinfo){
	return axio.post('/auth/forget-password/send-code', userinfo)
}

// 这里的userinfo 包括username 和 email
export function forgetPasswordVerifyCode(userinfo, code){
	return axio.post(`/auth/forget-password/${code}`, userinfo)
}

// 这里的userinfo 包括username 和 password
export function forgetPasswordResetPassword(userinfo){
	return axio.post('/auth/forget-password/reset', userinfo)
}




