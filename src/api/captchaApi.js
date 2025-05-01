import axio from '~/axios/index'

export function getCaptcha(){
	return axio.get('/captcha')
}

export function deleteCaptcha(captchaId){
	return axio.delete(`/captcha/${captchaId}`)
}

export function verifyCaptcha(code, id, scene){
	const deviceId = localStorage.getItem('deviceId')
	return axio.post(`/captcha`, {
		verCode: code,
		captchaId: id,
		scene: scene,
		symbol: deviceId
	})
}
