import axio from '~/axios/index'

export function getUserInfo(){
	return axio.get('/user/info')
}

