import axio from '~/axios/index'

export function getUserInfo(){
	return axio.get('/user/info')
}

// export function uploadAvatar(file) {
// 	const formData = new FormData()
// 	formData.append('file', file)
// 	return axio({
// 		url: '/user/avatar/upload',
// 		method: 'post',
// 		data: formData,
// 		headers: {
// 			'Content-Type': 'multipart/form-data'
// 		}
// 	})
// }

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

export function verifyEmail(userId,token){
	return axio.get(`/user/verify-email/${userId}/${token}`)
}

export function sendVerifyEmail(userinfo){
	return axio.post('/user/send-verify-email', userinfo)
}



