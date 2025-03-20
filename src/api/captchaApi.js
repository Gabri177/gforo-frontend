import axio from '~/axios/index'

export function getCaptcha(){
	return axio.get('/captcha')
}

export function deleteCaptcha(captchaId){
	return axio.delete(`/captcha/${captchaId}`)
}

export function verifyCaptcha(code, id, username){
	return axio.post(`/captcha?code=${code}&id=${id}&username=${username}`)
}
