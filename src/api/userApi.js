import axio from '~/axios/index'

export function getUserInfo(){
	return axio.get('/user/info')
}

export function uploadAvatar(file) {
	const formData = new FormData()
	formData.append('file', file)
	return axio({
		url: '/user/avatar/upload',
		method: 'post',
		data: formData,
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	})
}

