<template>
	<!-- 内容 -->
	<div class="bg-[#E3E0DB] flex flex-col flex-1 w-full flex-grow min-h-full">

		<div class="flex flex-col flex-1 justify-between mx-7 my-5">

			<div class="flex flex-col justify-between h-full">
				<!-- 面包屑导航 -->
				<div
					class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] px-5 py-3 rounded-xl shadow mb-6 text-sm text-[#6B7C93]">
					<el-breadcrumb separator="/">
						<el-breadcrumb-item :to="{ path: '/' }">
							<div class="flex items-center gap-1">
								<el-icon>
									<HomeFilled />
								</el-icon>
								Home
							</div>
						</el-breadcrumb-item>
						<el-breadcrumb-item>{{ parentTitle }}</el-breadcrumb-item>
					</el-breadcrumb>
				</div>

				<!-- 筛选头部区域 -->
				<div class="flex items-center justify-between mb-4">
					<!-- 左侧标题，可改为搜索栏 -->
					<h2 class="text-lg font-semibold text-[#4A4A4A]">Posts List</h2>

					<!-- 右侧筛选标签 -->
					<div class="flex space-x-3">
						<el-tag size="large" @click="setOrderMode(0)" :class="[
							'cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
							orderMode === 0
								? 'bg-[#A1A8C1] text-white shadow-md hover:bg-[#7A87A8] hover:shadow-lg active:bg-[#6B7C93] active:shadow-sm'
								: 'bg-[#F8FAFC] text-[#6B7C93] border-[#C1B8A8] hover:bg-[#F1F5F9] hover:text-[#4A4A4A] hover:border-[#A1A8C1] hover:shadow-md active:bg-[#E3E0DB] active:shadow-sm'
						]">
							Newest
						</el-tag>
						<el-tag size="large" @click="setOrderMode(1)" :class="[
							'cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
							orderMode === 1
								? 'bg-[#A1A8C1] text-white shadow-md hover:bg-[#7A87A8] hover:shadow-lg active:bg-[#6B7C93] active:shadow-sm'
								: 'bg-[#F8FAFC] text-[#6B7C93] border-[#C1B8A8] hover:bg-[#F1F5F9] hover:text-[#4A4A4A] hover:border-[#A1A8C1] hover:shadow-md active:bg-[#E3E0DB] active:shadow-sm'
						]">
							Hottest
						</el-tag>
					</div>
				</div>

				<ul class="bg-white/60 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 space-y-3"
					v-if="waitResponse">

					<li class="relative media pb-3 pt-3 mb-3 border-b border-[#C1B8A8]" v-for="i in 5" :key="i">
						<el-skeleton :rows="3" animated />
					</li>
				</ul>
				<!-- 帖子列表 -->
				<ul class="bg-white/60 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 space-y-3"
					v-else>


					<li v-if="discussPosts.length === 0" class="text-center py-10 text-[#6B7C93]">
						<p class="text-lg">Oops, it's empty!</p>
						<p class="text-sm mt-2">Nobody has posted here yet. Start the conversation now! 🎉</p>

					</li>

					<li v-else class="relative media pb-3 pt-3 mb-3 border-b border-[#C1B8A8]"
						v-for="map in discussPosts" :key="map.discussPosts.id">

						<!-- 置顶标签 -->
						<div v-if="map.discussPosts.type == 1 || map.discussPosts.type == 3"
							class="absolute top-8 right-2 bg-[#A1A8C1] text-white text-xs px-2 py-1 rounded shadow-md transform -rotate-12 cursor-default">
							<span class="font-bold">TOP</span>
						</div>
						<!-- 精华标签 -->
						<div v-if="map.discussPosts.type == 2 || map.discussPosts.type == 3"
							class="absolute top-2 right-2 bg-[#A1A8C1] text-white text-xs px-2 py-1 rounded shadow-md transform rotate-12 cursor-default">
							<span class="font-bold">Essence</span>
						</div>

						<!-- 帖子内容 -->
						<div class="flex justify-start items-center mb-3">
							<!-- Avatar 动效 -->
							<div class="w-[5rem] flex items-center justify-center ml-2 ">
								<a @click="seeUserPrifile(map.user.id)">
									<el-avatar :src="map.user.headerUrl" size="large"
										class="border border-[#A1A8C1] mr-4 transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-md hover:cursor-pointer">
										avatar
									</el-avatar>
								</a>
							</div>

							<!-- 标题动效 -->
							<div>
								<a @click="detailPostClicked(map.discussPosts.id, map.discussPosts.title)"
									class="text-xl font-medium text-[#4A4A4A] hover:text-[#A1A8C1] transform transition duration-300 ease-in-out hover:-translate-y-1 hover:cursor-pointer">
									{{ map.discussPosts.title }}
								</a>
								<p class="text-[#6B7C93] text-sm mt-1">{{ stripMarkdown(map.discussPosts.content) }}</p>
							</div>
						</div>


						<div>
							<div class="text-[#6B7C93] text-sm">
								<div class="flex justify-between items-center">
									<div class="flex justify-between items-center">
										<div class="w-[5rem] flex items-center justify-center">
											<!-- <u class="text-center cursor-default truncate w-24">{{
												map.user?.nickname
											}}</u> -->
											<UserInfoCard :user="map.user" :boardId="boardId" placement="right" />

										</div>
										<div>
											<span class="font-bold cursor-default">&nbsp Posted on &nbsp</span>
											<b class="text-[#A1A8C1] cursor-default">{{
												formatDate(map.discussPosts.createTime)
											}}</b>
										</div>
									</div>

									<div>
										<ul class="inline float-right">
											<li class="inline ml-2">
												<span type="text" class="text-[#6B7C93] hover:text-[#A1A8C1]">
													<i class="pi pi-thumbs-up" style="font-size: 1rem"></i>
													&nbsp; <span>{{ map.likeCount }}</span></span>
											</li>
											<li class="inline ml-2 text-[#C1B8A8]">|</li>
											<li class="inline ml-2">
												<span type="text" class="text-[#6B7C93] hover:text-[#A1A8C1]">
													<i class="pi pi-comments" style="font-size: 1rem"></i>
													&nbsp;
													<span>{{ map.commentCount }}</span></span>
											</li>
										</ul>
									</div>
								</div>



							</div>
						</div>
					</li>
				</ul>
			</div>
			<!-- 分页 -->
			<div
				class="flex justify-center items-center py-4 bg-white/60 backdrop-blur-md border border-white/20 mt-3 rounded-2xl shadow-lg">

				<el-pagination v-if="page.rows > 0" background layout="prev, pager, next" :total="page.rows"
					:page-size="page.pageSize" :current-page="page.current"
					@current-change="handleChangePage"></el-pagination>
			</div>

			<!-- 固定 Post -->
			<div class="fixed bottom-10 right-10 z-50">
				<div class="flex flex-col gap-4">
					<div v-if="userStore.isLoggedInState" >
						<AddPost @add="addPostClicked" />
					</div>
					<div>
						<ReturnHome @return="handleReturn" />
					</div>
				</div>

			</div>


			<Hint v-model:visible="isHintVisible" :confirmButton="false" title="this is the title"
				message="this is is the message" @confirm="console.log('confirm clicked')" />

			<NewPost ref="newPostRef" v-model:visible="isPostVisible" :confirmButton="false"
				@publish="handlePublishPost" />
		</div>


	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import AddPost from '~/components/AddPost.vue';
import Hint from '~/tools/Hint.vue';
import NewPost from '~/tools/NewPost.vue';
import ReturnHome from '~/components/ReturnHome.vue';
import UserInfoCard from '~/tools/UserInfoCard.vue';

import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user';
import { publishPost, getBoardPostsPage } from '@/api/postApi.js';

const user = {
	id: 1,
	username: 'user1',
	nickname: '用户一',
	email: 'user1@example.com',
	headerUrl: '',
	createTime: '2024-03-20T10:00:00Z',
	status: '1'
}

const route = useRoute();
const boardId = ref(route.params.boardId);
const parentTitle = computed(() =>
	localStorage.getItem('breadcrumb_parentTitle') || '默认父级'
)

const userStore = useUserStore();
const router = useRouter();
const isHintVisible = ref(false);
const isPostVisible = ref(false);
const newPostRef = ref(null);
const keyword = ref('');
const orderMode = ref(parseInt(localStorage.getItem('order_mode')) || 0);
const waitResponse = ref(false);
const newPost = ref({
	title: '',
	content: ''
});
const discussPosts = ref([]);
const page = ref({
	rows: 0,
	pageSize: 10,
	current: 1
});

const dropdownOpen = ref(false);

const handleReturn = () => {
	router.back();
}

const stripMarkdown = (content) => {
	return content
		?.replace(/!\[.*?\]\(.*?\)/g, '')  // 移除图片标签
		?.replace(/#+\s?/g, '')           // 移除标题符号
		?.replace(/[*_~`>[\]]/g, '')      // 移除其他markdown符号
		?.slice(0, 100) || ''             // 限制长度
}
const setOrderMode = (mode) => {
	console.log('set order mode', mode);
	orderMode.value = mode;
	localStorage.setItem('order_mode', mode); // 同步保存
	initPosts(mode, page.value.current);
};

const handlePublishPost = (content) => {

	const post = newPostRef.value.getContent()
	waitResponse.value = true;
	publishPost(boardId.value, post.title, post.content)
		.then((res) => {
			ElMessage.success('Publish successfully');
			//isHintVisible.value = true;
			initPosts(orderMode.value, page.value.current);
		})
		.catch((err) => {
			ElMessage.error(err.message);
		})
		.finally(() => {
			waitResponse.value = false;
		});

	// 发布帖子功能实现
	isPostVisible.value = false;
	//const html = newPostRef.value.getHtml(content.content);
	//console.log('html', html);
};
const handleChangePage = (newPage) => {
	// console.log('newPage', newPage);
	initPosts(orderMode.value, newPage);
	window.scrollTo(0, 0);
};
const formatDate = (date) => {
	// 日期格式化功能实现
	return new Date(date).toLocaleString();
};
const addPostClicked = () => {
	isPostVisible.value = !isPostVisible.value;
	if (newPostRef.value) {
		newPostRef.value.clearForm();
	}
	console.log('add post clicked');
}

const seeUserPrifile = (id) => {
	console.log('see user profile', id);
}

const detailPostClicked = (id, title) => {
	console.log('detail post clicked', id);
	localStorage.setItem('breadcrumb_postsTitle', title);
	router.push({
		path: `/board/${boardId.value}/post/${id}/1`
	})

}
const initPosts = (originalOrderVal, pageChanged) => {

	if (originalOrderVal === undefined)
		originalOrderVal = 0;
	if (pageChanged === undefined)
		pageChanged = page.value.current;
	// 获取帖子列表
	// console.log(page.value);
	getBoardPostsPage(boardId.value ? boardId.value : 0, pageChanged, 10, orderMode.value)
		.then((res) => {
			console.log('res', res);
			page.value.current = res.currentPage;
			// console.log(res);
			if (res.discussPosts)
				discussPosts.value = res.discussPosts;
			if (res.totalRows)
				page.value.rows = res.totalRows;
			// console.log(page.value);
		})
		.catch((err) => {
			ElMessage.error('Failed to get posts');
			if (originalOrderVal !== undefined) {
				orderMode.value = originalOrderVal;
			}
		});
};
initPosts(orderMode.value, page.value.current);
</script>

<style scoped>

/* 分页按钮默认背景 */
:deep(.el-pagination.is-background .el-pager li) {
	background-color: #E3E0DB;
	color: #4A4A4A;
	border: none;
	transition: all 0.3s;
}

/* 激活页 */
:deep(.el-pagination.is-background .el-pager li.is-active) {
	background-color: #A1A8C1;
	color: #fff;
}

/* 上一页、下一页按钮 */
:deep(.el-pagination.is-background button) {
	background-color: #E3E0DB;
	color: #4A4A4A;
	border: none;
	transition: all 0.3s;
}

/* 悬停效果 */
:deep(.el-pagination.is-background button:hover),
:deep(.el-pagination.is-background .el-pager li:hover) {
	background-color: #C1B8A8;
	color: #fff;
}

/* 按钮样式 */
:deep(.el-button--text) {
	color: #6B7C93;
}

:deep(.el-button--text:hover) {
	color: #A1A8C1;
}

/* 面包屑统一样式优化 */
:deep(.el-breadcrumb) {
	--el-text-color-regular: #6B7C93;
	font-size: 14px;
	font-weight: 500;
}

:deep(.el-breadcrumb__item) {
	display: flex;
	align-items: center;
}

:deep(.el-breadcrumb__separator) {
	margin: 0 6px;
	color: #A1A8C1;
}

:deep(.el-breadcrumb__inner.is-link) {
	color: #6B7C93;
	transition: color 0.2s ease;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
	color: #A1A8C1;
	text-decoration: underline;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
	color: #4A4A4A;
	font-weight: 600;
}
</style>
