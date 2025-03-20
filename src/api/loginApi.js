import axio from '~/axios/index'

export function loginUser(userInfo){

	return axio.post(`/login`, userInfo)
}

