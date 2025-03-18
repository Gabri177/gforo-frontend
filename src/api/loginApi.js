import axio from '~/axios/index'

export function loginUser(userInfo, captchaCode, captchaId){

	return axio.post(`/login?code=${captchaCode}&id=${captchaId}`, userInfo)
}

export function getCaptcha(){
	return axio.get('/login')
}

export function deleteCaptcha(captchaId){
	return axio.delete(`/login/${captchaId}`)
}