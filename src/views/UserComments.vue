<template>
	<div
		class="w-full h-full flex-1 min-h-screen p-6 font-sans text-[#4A4A4A] bg-gradient-to-br from-[#dcd8d0]/60 to-[#f1f1ef]/60 backdrop-blur-lg">


		<!-- 评论列表容器 -->
		<div class="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
			<h2 class="text-2xl font-bold text-[#6B7C93] mb-6">My Comments</h2>

			<!-- 评论列表 -->
			<div class="space-y-4">
				<div v-for="item in comments" :key="item.commentInfo.id"
					class=" bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<div class="flex justify-between">
								<div class="flex-1 w-full">
									<!-- 所属帖子 -->
									<div class="text-sm text-[#8B93B1] font-medium">
										<span>Reply in: </span>
										<span
											class="text-[#6B7C93] text-base font-semibold hover:text-[#A1A8C1] cursor-pointer"
											@click="goToPost(item.postInfo.id, item.postInfo.boardId)">
											{{ item.postInfo?.title }}
										</span>
									</div>

									<!-- 评论内容 -->
									<!-- 评论内容 -->
									<div class="text-[#4A4A4A] leading-relaxed">
										<p class="whitespace-pre-wrap break-words">
											<span v-if="item.commentInfo.targetUserInfo"
												class="text-[#A1A8C1] font-medium">
												回复 @{{ item.commentInfo.targetUserInfo.nickname }}：
											</span>
											{{ item.commentInfo.content }}
										</p>
									</div>

								</div>

								<div></div>
							</div>

							<div class="flex justify-between">
								<div class="flex items-center space-x-4 text-sm text-[#8B93B1]">
									<span>{{ formatDate(item.commentInfo.createTime) }}</span>
									<!-- 如需展示点赞数 -->
									<!-- <span>{{ item.commentInfo.likeCount || 0 }} 点赞</span> -->
								</div>

								<div>
									<el-button type="primary" class="morandi-disable-btn"
									@Click="handleDeleteComment(item.commentInfo.id)">
									Delete
									</el-button>
									<el-button type="primary" class="morandi-view-btn"
									@Click="handleGetLocation(item.commentInfo.id, item.postInfo.boardId, item.postInfo.id)">
									Go to Comment
									</el-button>
								</div>

								
							</div>

						</div>

					</div>
				</div>
			</div>

			<!-- 分页 -->
			<div class="mt-6 flex justify-center">
				<el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
					:page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next"
					@size-change="handleSizeChange" @current-change="handleCurrentChange" />
			</div>
		</div>
	</div>

	<!-- 固定 Post -->
	<div class="fixed bottom-10 right-10 z-50">
				
				<div>
					<ReturnHome @return="router.back()" />
				</div>
			</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, MoreFilled } from '@element-plus/icons-vue'
import { getUserComments } from '~/api/userApi'
import ReturnHome from '~/components/ReturnHome.vue';

import { 
	getCommentLocation,
	deleteComment,
	updateComment
 } from '~/api/commentAPI'

const router = useRouter()
const comments = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const handleGetLocation = async (commentId, boardId, postId) => {

	try {
		const res = await getCommentLocation(commentId)
		console.log("评论位置 ", res)
		goToLocation(boardId, postId, res.page, res.entityId, res.targetId, res.isPostFloor)
	} catch (error) {
		ElMessage.error('Cannot get comment location, Go to Home instead')
		router.push('/')
	}
	// 这里可以添加获取评论位置的逻辑，例如调用后端接口，然后更新评论的位置信息
	console.log("commentId: ", commentId)
}

// 格式化日期
const formatDate = (date) => {
	return new Date(date).toLocaleString()
}

// 获取评论列表
const fetchComments = async () => {
	try {
		const res = await getUserComments(currentPage.value, pageSize.value, false)
		console.log(res)
		comments.value = res.commentsList
		total.value = res.totalRows
		currentPage.value = res.currentPage
		pageSize.value = res.pageSize
	} catch (error) {
		ElMessage.error(error.measage ? error.message : "Cannot get comments")
	}
}

// 跳转到帖子详情

const goToPost = (postId, boardId) => {
	console.log(`跳转到帖子详情：postId=${postId}, boardId=${boardId}`)
	router.push(`/board/${boardId}/post/${postId}/1`)
}

const goToLocation = (boardId, postId, page, entityId, targetId, isPostFloor) => {
	console.log(`/board/${boardId}/post/${postId}/${page}/location/${entityId}/${targetId}/${isPostFloor}`)
	router.push(`/board/${boardId}/post/${postId}/${page}/location/${entityId}/${targetId}/${isPostFloor}`)
}



// 删除评论
const handleDeleteComment = async (commentId) => {
	try {
		await ElMessageBox.confirm('Are you sure you wanna delete this comment ?', 'Hint', {
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Cancel',
			type: 'warning'
		})
		// 真实情况这里调用后端删除接口
		await deleteComment(commentId)
		ElMessage.success('Delete success')
		await fetchComments()
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error(error.message ? error.message : "Delete failed")
		}
	}
}

// 分页处理
const handleSizeChange = (val) => {
	pageSize.value = val
	fetchComments()
}

const handleCurrentChange = (val) => {
	currentPage.value = val
	fetchComments()
}

onMounted(() => {
	fetchComments()
})
</script>

<style scoped>
.text-subtle {
	color: #6B7C93;
}

.text-accent {
	color: #A1A8C1;
}

.bg-blur-box {
	@apply bg-white/60 backdrop-blur-md border border-[#DAD7D2];
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
	width: 8px;
}

::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 4px;
}

::-webkit-scrollbar-thumb {
	background: #A1A8C1;
	border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
	background: #7A87A8;
}

/* 分页样式定制 */
:deep(.el-pagination) {
	--el-pagination-hover-color: #A1A8C1;
	--el-pagination-button-color: #6B7C93;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
	background-color: #A1A8C1;
}


/* 使用深度穿透来修改 Element Plus 的 dropdown item 样式 */
:deep(.el-dropdown-menu__item.morandi-green) {
	color: #5D7F71;
}

:deep(.el-dropdown-menu__item.morandi-green):hover {
	background-color: #A7C4A0 !important;
	color: white !important;
}

:deep(.el-dropdown-menu__item.morandi-red) {
	color: #8C5955;
}

:deep(.el-dropdown-menu__item.morandi-red):hover {
	background-color: #D9A5A5 !important;
	color: white !important;
}

/* 莫兰迪风格按钮样式 */
.morandi-view-btn {
	background-color: #A1B5A1;
	border-color: #A1B5A1;
	color: #FFFFFF;
	transition: all 0.3s ease;
}

.morandi-view-btn:hover,
.morandi-view-btn:focus {
	background-color: #8CA58C;
	border-color: #8CA58C;
	color: #FFFFFF;
}

.morandi-view-btn:active,
.morandi-view-btn.is-active {
	background-color: #7A957A;
	border-color: #7A957A;
	color: #FFFFFF;
}

.morandi-disable-btn {
	background-color: #C1A1A1;
	border-color: #C1A1A1;
	color: #FFFFFF;
	transition: all 0.3s ease;
}

.morandi-disable-btn:hover,
.morandi-disable-btn:focus {
	background-color: #B28E8E;
	border-color: #B28E8E;
	color: #FFFFFF;
}

.morandi-disable-btn:active,
.morandi-disable-btn.is-active {
	background-color: #A37A7A;
	border-color: #A37A7A;
	color: #FFFFFF;
}

.morandi-disable-btn:disabled {
	background-color: #E3E0DB;
	border-color: #E3E0DB;
	color: #A1A8C1;
}
</style>