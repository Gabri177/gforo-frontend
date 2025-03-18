<template>
	<!-- 内容 -->
	<el-main class="main flex-grow">
		<div class="container mx-auto">
			<div class="flex justify-between">
				<!-- 筛选条件 -->
				<ul class="mb-3 flex">
					<li class="mr-3">
						<el-tag size="large" @click="setOrderMode(0)" :class="[
							'cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all',
							orderMode === 0
								? 'bg-[#A8B5A2] text-white'
								: 'bg-[#E3E0DB] text-[#6B6E70] hover:bg-[#CFCAC2]'
						]">
							Newest
						</el-tag>
					</li>
					<li>
						<el-tag size="large" @click="setOrderMode(1)" :class="[
							'cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all',
							orderMode === 1
								? 'bg-[#A3A8B0] text-white'
								: 'bg-[#E3E0DB] text-[#6B6E70] hover:bg-[#CFCAC2]'
						]">
							Hottest
						</el-tag>
					</li>
				</ul>
			</div>
			<!-- 弹出框 -->
			<!-- <el-dialog :visible.sync="publishModalVisible" title="新帖发布">
				<div>
					<el-form>
						<el-form-item label="标题">
							<el-input v-model="newPost.title"></el-input>
						</el-item>
						<el-form-item label="正文">
							<el-input type="textarea" v-model="newPost.content" rows="15"></el-input>
						</el-form-item>
					</el-form>
				</div>
				<span slot="footer" class="dialog-footer">
					<el-button @click="publishModalVisible = false">取消</el-button>
					<el-button type="primary" @click="publishPost">发布</el-button>
				</span>
			</el-dialog> -->
			<!-- 提示框 -->
			<!-- <el-dialog :visible.sync="hintModalVisible" title="提示">
				<div>发布完毕!</div>
			</el-dialog> -->
			<ul class="bg-gray-50 shadow-lg rounded-2xl p-4 space-y-3" v-if="discussPosts.length === 0">
				<li class="relative media pb-3 pt-3 mb-3 border-b">
					<el-skeleton :rows="3" animated />
				</li>
				<li class="relative media pb-3 pt-3 mb-3 border-b">
					<el-skeleton :rows="3" animated />
				</li>
				<li class="relative media pb-3 pt-3 mb-3 border-b">
					<el-skeleton :rows="3" animated />
				</li>
				<li class="relative media pb-3 pt-3 mb-3 border-b">
					<el-skeleton :rows="3" animated />
				</li>
				<li class="relative media pb-3 pt-3 mb-3 border-b">
					<el-skeleton :rows="3" animated />
				</li>
			</ul>
			<!-- 帖子列表 -->
			<ul class="bg-gray-50 shadow-lg rounded-2xl p-4 space-y-3" v-else>
				<li class="relative media pb-3 pt-3 mb-3 border-b " v-for="map in discussPosts" :key="map.post.id">

					<!-- 置顶标签 -->
					<div v-if="map.post.type == 1"
						class="absolute top-8 right-2 bg-[#C1B8A8] text-white text-xs px-2 py-1 rounded shadow-md transform -rotate-12 cursor-default">
						<span class="font-bold">TOP</span>
					</div>
					<!-- 精华标签 -->
					<div v-if="map.post.status == 1"
						class="absolute top-2 right-2 bg-[#A8B0AE] text-white text-xs px-2 py-1 rounded shadow-md transform rotate-12 cursor-default">
						<span class="font-bold">Essence</span>
					</div>
					<!-- 帖子内容 -->
					<div class="flex justify-start items-center mb-3">
						<!-- Avatar 动效 -->
						<div class="w-[5rem] flex items-center justify-center ml-2">
							<a @click="seeUserPrifile(map.user.id)">
								<el-avatar :src="map.user.headerUrl" size="large"
									class="mr-4 transform transition duration-300 ease-in-out hover:scale-110 hover:shadow-md hover:cursor-pointer">
									avatar
								</el-avatar>
							</a>
						</div>

						<!-- 标题动效 -->
						<div>
							<a @click="detailPostClicked(map.post.id)"
								class="text-xl font-medium text-gray-700 hover:text-[#7E8D85] transform transition duration-300 ease-in-out hover:-translate-y-1 hover:cursor-pointer">
								{{ map.post.title }}
							</a>
						</div>
					</div>


					<div>
						<div class="text-gray-600 text-sm">
							<div class="flex justify-between items-center">
								<div class="flex justify-between items-center">
									<div class="w-[5rem] flex items-center justify-center">
										<u class="text-center cursor-default">{{ map.user.username }}</u>
									</div>
									<div>
										<span class="font-bold cursor-default">Posted on &nbsp</span>
										<b class="text-blue-400 cursor-default">{{ formatDate(map.post.createTime) }}
										</b>
									</div>
								</div>

								<div>
									<ul class="inline float-right">
										<li class="inline ml-2">
											<el-button type="text">👍🏻 &nbsp; <span>{{ map.likeCount
													}}</span></el-button>
										</li>
										<li class="inline ml-2">|</li>
										<li class="inline ml-2">
											<el-button type="text">📝 &nbsp; <span>{{ map.post.commentCount
													}}</span></el-button>
										</li>
									</ul>
								</div>
							</div>



						</div>
					</div>
				</li>
			</ul>
			<!-- 分页 -->
			<div class="bottom-0 left-0 w-full flex justify-center items-center py-4 bg-white mt-3">
				<el-pagination v-if="page.rows > 0" background layout="prev, pager, next" :total="page.rows"
					:page-size="page.pageSize" :current-page="page.current"
					@current-change="handleChangePage"></el-pagination>
			</div>
		</div>
	</el-main>
	<!-- 固定 Post -->
	<div class="fixed bottom-10 right-10 z-50">
		<AddPost @add="addPostClicked" />
	</div>


	<Hint v-model:visible="isHintVisible" :confirmButton="false" title="this is the title"
		message="this is is the message" @confirm="console.log('confirm clicked')" />

	<NewPost ref="newPostRef" v-model:visible="isPostVisible" :confirmButton="false" @publish="publishPost" />
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import AddPost from '~/components/AddPost.vue';
import Hint from '~/tools/Hint.vue';
import NewPost from '~/tools/NewPost.vue';
import {
	getPostsByPage
} from '~/api/homeApi'

const isHintVisible = ref(false);
const isPostVisible = ref(false);
const newPostRef = ref(null);
const allUnreadCount = ref(5);
const keyword = ref('');
const orderMode = ref(0);
const loginUser = ref({
	id: 1,
	username: 'testuser',
	headerUrl: 'https://via.placeholder.com/30'
});
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

const toggleDropdown = () => {
	dropdownOpen.value = !dropdownOpen.value;
};
const search = () => {
	// 搜索功能实现
};
const setOrderMode = (mode) => {
	console.log('set order mode', page.value.current);
	initPosts(mode, page.value.current);
	orderMode.value = mode;
};

const publishPost = (content) => {

	// console.log('publish post', content);
	// 发布帖子功能实现
	isPostVisible.value = false;
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
const handleSelect = (key, keyPath) => {
	console.log(key, keyPath);
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

const detailPostClicked = (id) => {
	console.log('detail post clicked', id);
}


const initPosts = (originalOrderVal, pageChanged) => {

	if (originalOrderVal === undefined)
		originalOrderVal = 0;
	if (pageChanged === undefined)
		pageChanged = page.value.current;
	// 获取帖子列表

	// console.log(page.value);
	getPostsByPage(pageChanged, orderMode.value, page.value.pageSize)
		.then((res) => {
			page.value.current = res.current;
			// console.log(res);
			if (res.discussPosts)
				discussPosts.value = res.discussPosts;
			if (res.totalRows)
				page.value.rows = res.totalRows;
			// console.log(page.value);
		})
		.catch((err) => {
			// console.log(err);
			ElMessage.error('Failed to get posts');
			if (originalOrderVal !== undefined) {
				orderMode.value = originalOrderVal;
			}
		});
};
initPosts(orderMode.value, page.value.current);
</script>

<style scoped>
/* 添加必要的样式 */
.main {
	flex-grow: 1;
}


/* 分页按钮默认背景 */
::v-deep(.el-pagination.is-background .el-pager li) {
	background-color: #E3E0DB;
	/* 雾米白 */
	color: #5C5F60;
	/* 深灰 */
	border: none;
	transition: all 0.3s;
}

/* 激活页 */
::v-deep(.el-pagination.is-background .el-pager li.is-active) {
	background-color: #A3A8B0;
	/* 青灰蓝 */
	color: #fff;
}

/* 上一页、下一页按钮 */
::v-deep(.el-pagination.is-background button) {
	background-color: #E3E0DB;
	/* 雾米白 */
	color: #5C5F60;
	/* 深灰 */
	border: none;
	transition: all 0.3s;
}

/* 悬停效果 */
::v-deep(.el-pagination.is-background button:hover),
::v-deep(.el-pagination.is-background .el-pager li:hover) {
	background-color: #C1C8C0;
	/* 浅青灰 */
	color: #fff;
}
</style>
