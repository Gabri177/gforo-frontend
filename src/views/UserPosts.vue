<template>
	<div
		class="w-full h-full flex-1 min-h-screen p-6 font-sans text-[#4A4A4A] bg-gradient-to-br from-[#dcd8d0]/70 to-[#eceae6]/70 backdrop-blur-lg">

		<!-- 帖子列表容器 -->
		<div class="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
			<h2 class="text-2xl font-bold text-[#6B7C93] mb-6">{{ postTitle }}</h2>

			<!-- 帖子列表 -->
			<div v-if="posts.length > 0" class="space-y-4">
				<div v-for="post in posts" :key="post.id"
					class="bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<h3 class="text-xl font-semibold text-[#6B7C93] mb-2 hover:text-[#A1A8C1] cursor-pointer"
								@click="goToPost(post.discussPosts.id, post.discussPosts.boardId)">
								{{ post.discussPosts.title }}
							</h3>

							<!-- 内容预览：去掉图片Markdown -->
							<p class="text-[#8B93B1] line-clamp-2">
								{{ stripMarkdown(post.discussPosts.content) }}
							</p>

							<div class="flex justify-between">
								<div class="mt-3 flex items-center space-x-4 text-sm text-[#6B7C93]">
									<span>{{ formatDate(post.discussPosts.createTime) }}</span>
									<span>{{ post.commentCount || 0 }} Comments</span>
									<span>{{ post.likeCount || 0 }} Likes</span>
								</div>
								<div>
									<el-button type="primary" class="morandi-disable-btn" v-if="ifShowDeleteBtn(post.discussPosts.boardId)"
										@click="handleDeletePost(post.discussPosts.id, post.discussPosts.boardId)">Delete</el-button>
									<el-button type="primary" class="morandi-view-btn"
										@click="goToPost(post.discussPosts.id, post.discussPosts.boardId)">View</el-button>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>

			<div v-else
				class="flex flex-col items-center justify-center py-12 text-[#6B7C93] bg-white/30 border border-white/30 rounded-xl shadow-md">
				<img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="No posts"
					class="w-24 h-24 mb-4 opacity-80" />
				<p class="text-lg font-semibold mb-2">You haven't posted anything yet 😶</p>
				<p class="text-sm text-[#8B93B1] mb-4">Why not head back and share your first thought?</p>
				<el-button type="primary" class="morandi-view-btn" @click="router.push('/')">Back to Home</el-button>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { HomeFilled, MoreFilled } from '@element-plus/icons-vue'
import { getUserPosts } from '~/api/userApi'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { deletePost } from '~/api/postApi'
import { adminDeletePost } from '~/api/adminApi'
import ReturnHome from '~/components/ReturnHome.vue';


const userStore = useUserStore()
const authStore = useAuthStore()
const userId = userStore.userInfo.id
const router = useRouter()
const route = useRoute()
const posts = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const otherUserId = route.params.userId

const ifShowDeleteBtn = (boardId) => {
	return authStore.hasPermission('post:delete:any') || 
		otherUserId === undefined || 
		authStore.hasPermission('post:delete:board') && authStore.hasBoardId(boardId)
}
// 格式化日期
const formatDate = (date) => {
	return new Date(date).toLocaleString()
}

const postTitle = computed(() => {
	if (!otherUserId || otherUserId == userStore.userInfo.id) {
		return 'My posts'
	}
	const otherUser = localStorage.getItem('lastVisitedUser')
	if (otherUser) {
		const otherUserInfo = JSON.parse(otherUser)
		return `${otherUserInfo.nickname || otherUserInfo.username}'s posts`
	}
	return 'User\'s posts'
})


// 获取帖子列表
const fetchPosts = async (userId) => {
	try {
		if (userId === undefined) {
			userId = userStore.userInfo.id
		} 
		// else {
		// 	let otherUserInfo;
		// 	const otherUser = localStorage.getItem('lastVisitedUser')
		// 	console.log("otherUser: ", otherUser)
		// 	if (otherUser) {
		// 		localStorage.removeItem('lastVisitedUser')
		// 		otherUserInfo = JSON.parse(otherUser)
		// 		console.log("otherUserInfo: ", otherUserInfo)
		// 	}
		// 	userId = otherUserInfo.id
		// }
		const res = await getUserPosts(userId, currentPage.value, pageSize.value, true)
		posts.value = res.discussPosts
		total.value = res.totalRows
		currentPage.value = res.currentPage
		pageSize.value = res.limit
		console.log("res: ", res)
	} catch (error) {
		ElMessage.error(error.message || 'Cannot get posts')
	}
}

const stripMarkdown = (content) => {
	return content
		?.replace(/!\[.*?\]\(.*?\)/g, '')  // 移除图片标签
		?.replace(/#+\s?/g, '')           // 移除标题符号
		?.replace(/[*_~`>[\]]/g, '')      // 移除其他markdown符号
		?.slice(0, 100) || ''             // 限制长度
}


// 跳转到帖子详情
const goToPost = (postId, boardId) => {
	console.log(`跳转到帖子详情：postId=${postId}, boardId=${boardId}`)
	router.push(`/board/${boardId}/post/${postId}/1`)
}


// 删除帖子
const handleDeletePost = async (postId, boardId) => {
	try {
		await ElMessageBox.confirm('Are you sure you wanna delete this post ？', 'Hint', {
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Cancel',
			type: 'warning'
		})
		console.log ("has permission: ", authStore.hasPermission('post:delete:any'))
		if (authStore.hasPermission('post:delete:any') || authStore.hasPermission('post:delete:board') && authStore.hasBoardId(boardId))
			await adminDeletePost(postId)
		else
			await deletePost(postId)
		posts.value = posts.value.filter(post => post.discussPosts.id != postId)
		ElMessage.success('Deleted successfully')
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error(error.message ? error.message : "Deleted failed")
		}
	}
}

const handleSizeChange = (val) => {
	pageSize.value = val
	fetchPosts()
}

const handleCurrentChange = (val) => {
	currentPage.value = val
	fetchPosts()
}

onMounted(async () => {

	fetchPosts(otherUserId)
})
</script>

<style scoped>
/* 滚动条样式 */
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

.text-subtle {
	color: #6B7C93;
}

.text-accent {
	color: #A1A8C1;
}

.bg-blur-box {
	@apply bg-white/60 backdrop-blur-md border border-[#DAD7D2];
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