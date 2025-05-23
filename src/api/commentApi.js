import axio from '~/axios/index'

export function addCommentToPost(postId, content, toPostUserId) {
	return axio.post("/comment/topost", {
		entityId: postId,
		content: content,
		toPostUserId: toPostUserId
	})
}

export function addCommentToComment(entityType, entityId, targetId, content, postId, toCommentUserId) {
	return axio.post("/comment/tocomment", {
		entityType: entityType,
		entityId: entityId,
		targetId: targetId,
		content: content,
		postId: postId,
		toCommentUserId: toCommentUserId
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

export function getCommentLocation(commentId) {
	return axio.get(`/comment/location/${commentId}`)
}