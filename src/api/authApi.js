import axio from '~/axios/index'
import pureAxios from '~/axios/pureAxios'

export function loginUser(userInfo){

	return axio.post(`/auth/login`, userInfo)
}

export function getNewToken(refreshToken){
	return pureAxios.post('/auth/refresh-token', null, {
		headers: {
		  Authorization: `Bearer ${refreshToken}`
		}
	})
}

export function logoutUser(){
	return axio.delete('/auth/logout')
}

