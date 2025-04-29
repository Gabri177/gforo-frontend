import axio from '~/axios/index'

export function registerUser(userdata){
	return axio.post('/register', userdata)
}

export function activateAccount(sixDigitCode, email){
	return axio.post('/register/activate', {
		email: email,
		sixDigitCode: sixDigitCode
	})
}

