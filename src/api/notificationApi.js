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
	return axio.post(`/notification/${notificationId}`);
}