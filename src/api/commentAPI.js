import axio from '~/axios/index'

export function addCommentToPost(postId, content) {
	return axio.post("/comment/topost", {
		entityId: postId,
		content: content
	})
}

export function addCommentToComment(entityType, entityId, targetId, content, postId) {
	return axio.post("/comment/tocomment", {
		entityType: entityType,
		entityId: entityId,
		targetId: targetId,
		content: content,
		postId: postId
	})
}

export function deleteComment(commentId) {
	return axio.delete(`/comment/${commentId}`)
}

export function updateComment(commentId, content) {
	return axio.put(`/comment/update`, {
		id:commentId,
		content:content
	})
}