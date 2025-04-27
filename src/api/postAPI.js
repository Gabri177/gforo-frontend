import axio from '~/axios/index'


// 获取帖子的详细信息
// limit 在后端指定默认为10
export function getPostByPage(postId, currentPage){  

	return axio.get(`/post/${postId}/${currentPage}`);
}

export function publishPost(title, content){

	return axio.post('/post/publish', {
		title,
		content
	});
}