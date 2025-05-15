import axio from '~/axios/index'

export function getUserList(userId, currentPage, pageSize, isAsc) {
	let request = `/admin/user/info/${userId}`;
	if (currentPage !== undefined)
		request += '?currentPage=' + currentPage;
	if (pageSize !== undefined)
		request += '&pageSize=' + pageSize;
	if (isAsc !== undefined)
		request += '&isAsc=' + isAsc;
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

export function getDashboardStats() {
	return axio.get('/admin/statistics')
}
