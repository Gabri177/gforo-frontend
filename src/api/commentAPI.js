import axio from '~/axios/index'

export function addCommentToPost(postId, content) {
	return axio.post("/comment/topost", {
		entityId: postId,
		content: content
	})
}

export function addCommentToComment(entityType, entityId, targetId, content) {
	return axio.post("/comment/tocomment", {
		entityType: entityType,
		entityId: entityId,
		targetId: targetId,
		content: content
	})
}