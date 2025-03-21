import axio from '~/axios/index'
import pureAxios from '~/axios/pureAxios'

export function loginUser(userInfo){

	return axio.post(`/auth`, userInfo)
}

export function getNewToken(refreshToken){
	return pureAxios.post('/auth/refresh-token', null, {
		headers: {
		  Authorization: `Bearer ${refreshToken}`
		}
	})
}

