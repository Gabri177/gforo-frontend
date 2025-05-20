import axio from '~/axios/index'


export function getBoardPostsPage(boardId, currentPage, pageSize, orderMode){
	
	let request = `/post/board/${boardId}`;
	if (currentPage || pageSize || orderMode)
		request += '?';	 
	if (currentPage)
		request += `currentPage=${currentPage}&`;
	if (pageSize)
		request += `pageSize=${pageSize}&`;
	if (orderMode)
		request += `orderMode=${orderMode}`;
	return axio.get(request);
}

// 获取帖子的详细信息
// limit 在后端指定默认为10
export function getPostByPage(postId, currentPage, pageSize, isAsc){  

	let request = `/post/detail/${postId}`;
	if (currentPage || pageSize || isAsc)
		request += '?';
	if (currentPage)
		request += `currentPage=${currentPage}&`;
	if (pageSize)
		request += `pageSize=${pageSize}&`;
	if (isAsc)
		request += `isAsc=${isAsc}`;
	return axio.get(request);
	
}

export function publishPost(boardId, title, content){

	return axio.post('/post/publish', {
		boardId: boardId ? boardId : 0,
		title,
		content
	});
}

export function deletePost(postId){
	return axio.delete(`/post/${postId}`);
}

export function updatePost(postId, title, content){
	return axio.put(`/post/update`, {
		id: postId,
		title,
		content
	});
}

export function changePostType(postId, type) {
	return axio.put(`/post/change-type/${postId}/${type}`);
}