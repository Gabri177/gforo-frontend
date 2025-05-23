import axio from '~/axios/index'


export function getMyNotificationList(currentPage, pageSize, isAsc){
	return axio.get('/notification', {
		params: {
			currentPage: currentPage !== undefined?currentPage:1,
			pageSize: pageSize !== undefined?pageSize:10,
			isAsc: isAsc !== undefined?isAsc:true
		}
	});
}

export function readNotification(notificationId){
	return axio.put(`/notification/${notificationId}`);
}

export function readAllNotification(){
	return axio.put('/notification');
}

export function getMyUnreadNotificationList(currentPage, pageSize){
	return axio.get('/notification/unread', {
		params: {
			currentPage: currentPage !== undefined?currentPage:1,
			pageSize: pageSize !== undefined?pageSize:10
		}
	});
}

export async function isUnreadNotification(){
	try {
		await axio.get('/notification/is-unread');
		return true;
	} catch {
		return false;
	}
}

export function getMyReadNotificationList(currentPage, pageSize){
	return axio.get('/notification/read', {
		params: {
			currentPage: currentPage !== undefined?currentPage:1,
			pageSize: pageSize !== undefined?pageSize:10
		}
	});
}