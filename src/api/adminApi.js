import axio from '~/axios/index'

export function getUserList(currentPage, pageSize, isAsc) {
	let request = `/admin/user/info`;
	if (currentPage !== undefined)
		request += '?currentPage=' + currentPage;
	if (pageSize !== undefined)
		request += '&pageSize=' + pageSize;
	if (isAsc !== undefined)
		request += '&isAsc=' + isAsc;
	return axio.get(request);
}

export function getUserListUsernameLike(currentPage, pageSize, isAsc, username) {
	let request = `/admin/user/info/username-like`;
	if (currentPage !== undefined)
		request += '?currentPage=' + currentPage;
	if (pageSize !== undefined)
		request += '&pageSize=' + pageSize;
	if (isAsc !== undefined)
		request += '&isAsc=' + isAsc;
	if (username!== undefined)
		request += '&username=' + username;
	return axio.get(request);
}

export function changeUserPassword(userId, password) {
	return axio.put('/admin/user/change-password/' + userId, {
		newPassword: password
	})
}

export function activeUser(userId) {
	return axio.put('/admin/user/activate/' + userId)
}

export function disableUser(userId) {
	return axio.put('/admin/user/disable/' + userId)
}

export function deleteUser(userId) {
	return axio.delete('/admin/user/delete/' + userId)
}

export function logoutUser(userId) {
	return axio.delete('/admin/user/logout/' + userId)
}

export function adminDeletePost(postId) {
	return axio.delete('/admin/post/delete/' + postId)
}

export function adminDeleteComment(commentId) {
	return axio.delete('/admin/comment/delete/' + commentId)
}

export function adminGetNotification(currentPage, pageSize, isAsc){
	return axio.get('/admin/notification', {
		params: {
			currentPage: currentPage !== undefined ? currentPage : 1,
			pageSize: pageSize !== undefined? pageSize : 10,
			isAsc: isAsc !== undefined? isAsc : true
		}
	})
}

export function adminDeleteNotification(notificationId){
	return axio.delete('/admin/notification/' + notificationId)
}

export function adminPublishNotification(notification){
	return axio.post('/admin/notification', notification)
}

export function adminUpdateNotification(notification){
	return axio.put('/admin/notification', notification)
}