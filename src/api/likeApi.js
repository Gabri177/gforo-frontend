import axio from '~/axios/index'
// 点赞

export function likePost(postId){
	return axio.post(`/like/post/${postId}`)
}

export function likeComment(commentId){
	return axio.post(`/like/comment/${commentId}`)
}