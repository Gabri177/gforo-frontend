import axio from '~/axios/index'

export function registerUser(userdata){
	return axio.post('/register', userdata)
}

