import axio from '~/axios/index'

export function getUserInfo(){
	return axio.get('/user/info')
}

export function changeUsername(username){
	return axio.put('/user/change-username', {
		username: username
	})
}

// 修改密码
// 这里的data格式是{oldPassword: string, newPassword: string}
export function changePassword(data) {
	return axio.put('/user/change-password', data)
}

// 修改用户信息
// 这里的data格式是{username: string, headerUrl: string, bio: string}
export function updateUserInfo(data) {
	return axio.put('/user/info', data)
}

export function verifyEmail(sixDigitCode, email){
	return axio.post(`/user/verify-email`, {
		sixDigitCode: sixDigitCode,
		email: email
	})
}

export function sendVerifyEmail(email){
	return axio.post('/user/send-verify-email', {email: email})
}



