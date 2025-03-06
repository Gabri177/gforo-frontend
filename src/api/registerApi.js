import axio from '~/axios/index'

export function registerUser(userdata){
	return axio.post('/register', userdata)
}

export function verifyEmail(userId,token){
	return axio.get(`/register/${userId}/${token}`)
}