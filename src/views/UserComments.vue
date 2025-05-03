<template>
	<div class="w-full h-full flex-1 min-h-screen p-6 font-sans text-[#4A4A4A] bg-gradient-to-br from-[#dcd8d0]/60 to-[#f1f1ef]/60 backdrop-blur-lg">
	  <!-- 面包屑导航 -->
	  <div class="mb-6">
		<el-breadcrumb separator="/">
		  <el-breadcrumb-item :to="{ path: '/' }">
			<el-icon class="mr-1"><HomeFilled /></el-icon>首页
		  </el-breadcrumb-item>
		  <el-breadcrumb-item :to="{ path: '/profile' }">个人主页</el-breadcrumb-item>
		  <el-breadcrumb-item>我的评论</el-breadcrumb-item>
		</el-breadcrumb>
	  </div>
  
	  <!-- 评论列表容器 -->
	  <div class="bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
		<h2 class="text-2xl font-bold text-[#6B7C93] mb-6">我的评论</h2>
  
		<!-- 评论列表 -->
		<div class="space-y-4">
		  <div v-for="comment in comments" :key="comment.id"
			   class="bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
			<div class="flex justify-between items-start">
			  <div class="flex-1">
				<div class="text-sm text-[#8B93B1] mb-2">
				  回复帖子：
				  <span class="text-[#6B7C93] hover:text-[#A1A8C1] cursor-pointer"
						@click="goToPost(comment.postId)">
					{{ comment.postTitle }}
				  </span>
				</div>
				<p class="text-[#6B7C93] mb-3">{{ comment.content }}</p>
				<div class="flex items-center space-x-4 text-sm text-[#8B93B1]">
				  <span>{{ formatDate(comment.createTime) }}</span>
				  <span>{{ comment.likeCount }} 点赞</span>
				</div>
			  </div>
			  <el-dropdown trigger="click">
				<el-button type="text">
				  <el-icon><MoreFilled /></el-icon>
				</el-button>
				<template #dropdown>
				  <el-dropdown-menu>
					<el-dropdown-item @click="editComment(comment.id)">编辑</el-dropdown-item>
					<el-dropdown-item @click="deleteComment(comment.id)" class="text-red-500">删除</el-dropdown-item>
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
  const comments = ref([])
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  
  // 模拟评论数据
  const mockComments = [
	{
	  id: 1,
	  postId: 101,
	  postTitle: '如何学习Vue3组合式API？',
	  content: '这篇文章写得非常详细，对新手很友好。我觉得Composition API比Options API更灵活。',
	  createTime: '2024-01-15T10:30:00',
	  likeCount: 15
	},
	{
	  id: 2,
	  postId: 102,
	  postTitle: 'TypeScript入门指南',
	  content: '类型系统确实能帮助我们避免很多运行时错误，建议结合实际项目来学习。',
	  createTime: '2024-01-14T16:45:00',
	  likeCount: 8
	},
	{
	  id: 3,
	  postId: 103,
	  postTitle: '前端性能优化实践',
	  content: '补充一点，使用虚拟列表处理大数据量的渲染也是一个很好的优化方向。',
	  createTime: '2024-01-13T09:20:00',
	  likeCount: 12
	},
	{
	  id: 4,
	  postId: 104,
	  postTitle: 'Vite构建工具详解',
	  content: '确实，Vite的热更新速度比webpack快很多，开发体验提升明显。',
	  createTime: '2024-01-12T14:15:00',
	  likeCount: 6
	},
	{
	  id: 5,
	  postId: 105,
	  postTitle: 'CSS Grid布局实战',
	  content: '网格布局真的很强大，特别是在响应式设计方面的表现。',
	  createTime: '2024-01-11T11:30:00',
	  likeCount: 9
	}
  ]
  
  // 格式化日期
  const formatDate = (date) => {
	return new Date(date).toLocaleString()
  }
  
  // 获取评论列表
  const fetchComments = async () => {
	try {
	  await new Promise(resolve => setTimeout(resolve, 500))
	  const start = (currentPage.value - 1) * pageSize.value
	  const end = start + pageSize.value
	  comments.value = mockComments.slice(start, end)
	  total.value = mockComments.length
	} catch (error) {
	  ElMessage.error('获取评论列表失败')
	}
  }
  
  // 跳转到帖子详情
  const goToPost = (postId) => {
	router.push(`/post/${postId}`)
  }
  
  // 编辑评论
  const editComment = (commentId) => {
	ElMessage.info('编辑功能开发中...')
  }
  
  // 删除评论
  const deleteComment = async (commentId) => {
	try {
	  await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	  })
	  const index = mockComments.findIndex(c => c.id === commentId)
	  if (index > -1) {
		mockComments.splice(index, 1)
		ElMessage.success('删除成功')
		await fetchComments()
	  }
	} catch (error) {
	  if (error !== 'cancel') {
		ElMessage.error('删除失败')
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
  </style>
  