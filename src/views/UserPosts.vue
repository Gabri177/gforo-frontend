<template>
	<div class="w-full h-full flex-1 min-h-screen p-6 font-sans text-[#4A4A4A] bg-gradient-to-br from-[#dcd8d0]/70 to-[#eceae6]/70 backdrop-blur-lg">
  
	  <!-- 帖子列表容器 -->
	  <div class="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
		<h2 class="text-2xl font-bold text-[#6B7C93] mb-6">我的帖子</h2>
  
		<!-- 帖子列表 -->
		<div class="space-y-4">
		  <div v-for="post in posts" :key="post.id"
			   class="bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
			<div class="flex justify-between items-start">
			  <div class="flex-1">
				<h3 class="text-xl font-semibold text-[#6B7C93] mb-2 hover:text-[#A1A8C1] cursor-pointer"
					@click="goToPost(post.id)">
				  {{ post.title }}
				</h3>
				<p class="text-[#8B93B1] line-clamp-2">{{ post.content }}</p>
				<div class="mt-3 flex items-center space-x-4 text-sm text-[#6B7C93]">
				  <span>{{ formatDate(post.createTime) }}</span>
				  <span>{{ post.commentCount }} 评论</span>
				  <span>{{ post.likeCount }} 点赞</span>
				</div>
			  </div>
			  <el-dropdown trigger="click">
				<el-button type="text">
				  <el-icon><MoreFilled /></el-icon>
				</el-button>
				<template #dropdown>
				  <el-dropdown-menu>
					<el-dropdown-item @click="editPost(post.id)">编辑</el-dropdown-item>
					<el-dropdown-item @click="deletePost(post.id)" class="text-red-500">删除</el-dropdown-item>
				  </el-dropdown-menu>
				</template>
			  </el-dropdown>
			</div>
		  </div>
		</div>
  
		<!-- 分页 -->
		<div class="mt-6 flex justify-center">
		  <el-pagination
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			:total="total"
			:page-sizes="[10, 20, 30, 50]"
			layout="total, sizes, prev, pager, next"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
		  />
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { HomeFilled, MoreFilled } from '@element-plus/icons-vue'
  
  const router = useRouter()
  const posts = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  
  // 模拟帖子数据
  const mockPosts = [
	{
	  id: 1,
	  title: '分享一下Vue3和TypeScript的最佳实践',
	  content: '最近在项目中使用Vue3和TypeScript的组合，发现有一些很好的实践方式。首先是组合式API的类型推导变得更加智能，其次是...',
	  createTime: '2024-01-15T14:30:00',
	  commentCount: 23,
	  likeCount: 45
	},
	{
	  id: 2,
	  title: '浅谈前端性能优化的几个关键点',
	  content: '前端性能优化是一个永恒的话题，从网络请求、渲染性能到代码分割，每个环节都值得关注...',
	  createTime: '2024-01-14T09:15:00',
	  commentCount: 15,
	  likeCount: 32
	},
	{
	  id: 3,
	  title: '如何设计一个优雅的状态管理方案',
	  content: '随着前端应用越来越复杂，状态管理变得越来越重要。本文将分享一些关于状态管理的心得...',
	  createTime: '2024-01-13T16:45:00',
	  commentCount: 18,
	  likeCount: 27
	},
	{
	  id: 4,
	  title: '前端工程化实践总结',
	  content: '工程化对于现代前端开发来说非常重要，本文将分享一些在实际项目中的工程化实践经验...',
	  createTime: '2024-01-12T11:20:00',
	  commentCount: 12,
	  likeCount: 19
	},
	{
	  id: 5,
	  title: '聊聊组件设计原则',
	  content: '好的组件设计能够提高代码的可维护性和复用性。以下是我在组件设计方面的一些思考...',
	  createTime: '2024-01-11T15:30:00',
	  commentCount: 9,
	  likeCount: 24
	}
  ]
  
  // 格式化日期
  const formatDate = (date) => {
	return new Date(date).toLocaleString()
  }
  
  // 获取帖子列表
  const fetchPosts = async () => {
	try {
	  await new Promise(resolve => setTimeout(resolve, 500))
	  const start = (currentPage.value - 1) * pageSize.value
	  const end = start + pageSize.value
	  posts.value = mockPosts.slice(start, end)
	  total.value = mockPosts.length
	} catch (error) {
	  ElMessage.error('获取帖子列表失败')
	}
  }
  
  // 跳转到帖子详情
  const goToPost = (postId) => {
	router.push(`/post/${postId}`)
  }
  
  // 编辑帖子
  const editPost = (postId) => {
	router.push(`/post/edit/${postId}`)
  }
  
  // 删除帖子
  const deletePost = async (postId) => {
	try {
	  await ElMessageBox.confirm('确定要删除这篇帖子吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	  })
	  const index = mockPosts.findIndex(p => p.id === postId)
	  if (index > -1) {
		mockPosts.splice(index, 1)
		ElMessage.success('删除成功')
		await fetchPosts()
	  }
	} catch (error) {
	  if (error !== 'cancel') {
		ElMessage.error('删除失败')
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
  
  onMounted(() => {
	fetchPosts()
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
  </style>
  