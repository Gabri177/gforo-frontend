<template>
	<el-header class="backdrop-blur-md bg-[#E3E0DB]/50 border-b border-[#C1B8A8] fixed top-0 left-0 right-0 z-50">
		<div class="container mx-auto px-4 h-full flex items-center justify-between">
			<!-- 左侧导航 -->
			<div class="flex items-center">
				<router-link to="/"
					class="text-2xl font-bold text-[#4A4A4A] hover:text-[#6B7C93] transition-colors duration-300">
					GForo
				</router-link>
				<nav class="ml-8 flex space-x-6">
					<router-link v-for="item in navItems" :key="item.path" :to="item.path || route.path"
						class="nav-link">
						{{ item.name }}
					</router-link>
				</nav>
			</div>

			<!-- 右侧搜索和用户信息 -->
			<div class="flex items-center space-x-6">
				<!-- 搜索框 -->
				<div class="relative">
					
					<el-input v-model="searchQuery" placeholder="Search Post ..." class="w-[300px]"
						@keyup.enter="handleSearch">
						<template #prefix>
							<el-icon class="text-[#6B7C93]">
								<Search />
							</el-icon>
						</template>
					</el-input>
				</div>

				<!-- 用户信息 -->
				<div v-if="userStore.isLoggedInState" class="flex items-center space-x-4">
					<el-dropdown trigger="click">
						<div class="flex items-center space-x-2 cursor-pointer">
							<el-badge is-dot :hidden="!notificationStore.hasUnread">
								<el-avatar :size="32"
									:src="userStore.userInfo.headerUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
									@error="() => true" />
							</el-badge>
							<span class="text-[#4A4A4A]">{{ userStore.userInfo?.nickname }}</span>
						</div>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item @click="router.push('/profile')">Profile</el-dropdown-item>
								<el-dropdown-item
									@click="router.push('/notification'); notificationStore.setUnread(false)"><span
										class="relative">
										Notice
										<span v-if="notificationStore.hasUnread"
											class="absolute top-2 -right-3 w-2 h-2 bg-red-500 rounded-full"></span>
									</span></el-dropdown-item>
								<el-dropdown-item @click="router.push('/settings')">Setting</el-dropdown-item>
								<el-dropdown-item v-if="isAdmin"
									@click="router.push('/admin')">Gestion</el-dropdown-item>
								<el-dropdown-item divided @click="handleLogout">Logout</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
				<div v-else class="flex items-center space-x-4">
					<router-link to="/login" class="nav-link">Login</router-link>
				</div>
			</div>
		</div>
	</el-header>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { useAuthStore } from '~/stores/auth';
import { Search } from '@element-plus/icons-vue';
import { logoutUser } from '~/api/authApi';
import { ElMessage } from 'element-plus';
import { useNotificationStore } from '~/stores/notification';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const searchQuery = ref('');

const handleSearch = () => {
  const keywordTrimmed = searchQuery.value.trim()
  if (!keywordTrimmed) {
    ElMessage.warning('Please enter a keyword')
    return
  }

  // 如果当前就在 search 页面，手动更改 query 参数
  if (route.path === '/search') {
    router.replace({ path: '/search', query: { keyword: keywordTrimmed } })
	searchQuery.value = ''
  } else {
    router.push({ path: '/search', query: { keyword: keywordTrimmed } })
	searchQuery.value = ''
  }
}



const isAdmin = computed(() => {
	return (authStore.hasPermission('user:info:any'))
});

// 根据登录状态显示不同的导航项
const navItems = computed(() => {
	const items = [
		{ name: 'Home', path: '/' },
		// { name: 'Message', path: '/message' },
	];

	if (route.path.startsWith('/post'))
		items.push({ name: 'Post' });
	if (route.path.startsWith('/profile'))
		items.push({ name: 'Profile' });
	if (route.path.startsWith('/settings'))
		items.push({ name: 'Settings' });
	if (route.path.startsWith('/register'))
		items.push({ name: 'Register' });
	if (route.path.startsWith('/notification'))
		items.push({ name: 'Notification' });
	if (route.path.startsWith('/forget-password'))
		items.push({ name: 'Forget Password' });

	return items;
});

const handleLogout = () => {

	logoutUser()
		.then((res) => {
			ElMessage.success("Logout successfully")
		})
		.catch((err) => {
			ElMessage.error(err.message)
		})
		.finally(() => {
			userStore.clearUserInfo();
			authStore.clearAuthInfo();
			router.push('/login');
		});
};

const search = () => {
	// 搜索功能实现
	console.log('search');
};
</script>

<style scoped>
/* 导航链接样式 */
.nav-link {
	@apply text-[#6B7C93] transition-all duration-300 relative;
	padding: 0.5rem 1rem;
	border-radius: 6px;
}

/* 鼠标移入效果 */
.nav-link:hover {
	color: #4A4A4A;
	background-color: #F1F5F9;
}

/* 点击效果 */
.nav-link:active {
	background-color: #bccdb9;
	transform: scale(0.98);
}

/* 选中效果 */
.nav-link.router-link-active {
	color: #4A4A4A;
	background-color: #8cb29cd4;
	font-weight: 500;
}

.nav-link.router-link-active::after {
	content: '';
	position: absolute;
	bottom: -2px;
	left: 50%;
	transform: translateX(-50%);
	width: 20px;
	height: 2px;
	background-color: #161313;
	border-radius: 2px;
}

/* 搜索框样式 */
:deep(.el-input__wrapper) {
	background-color: #F8FAFC;
	border: 1px solid #C1B8A8;
	border-radius: 8px;
	box-shadow: none;
	transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
	border-color: #A1A8C1;
	background-color: #F1F5F9;
}

:deep(.el-input__wrapper.is-focus) {
	border-color: #A1A8C1;
	box-shadow: 0 0 0 1px #A1A8C1;
}

:deep(.el-input__inner) {
	color: #4A4A4A;
}

:deep(.el-input__inner::placeholder) {
	color: #6B7C93;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
	background-color: #E3E0DB !important;
	border: 1px solid #acbad6 !important;
	border-radius: 8px !important;
	box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-dropdown-menu__item),
:deep([data-el-collection-item]) {
	color: #666 !important;
	padding: 8px 16px !important;
	transition: all 0.3s ease !important;
}

:deep(.el-dropdown-menu__item:hover),
:deep([data-el-collection-item]:hover) {
	background-color: #a4ccb1 !important;
	color: #fff !important;
}

:deep(.el-dropdown-menu__item:active),
:deep([data-el-collection-item]:active) {
	background-color: #8ab39c !important;
}

:deep(.el-dropdown-menu__item--divided),
:deep([data-el-collection-item].el-dropdown-menu__item--divided) {
	border-top: 1px solid #acbad6 !important;
}

:deep(.el-dropdown-menu__item--divided:before),
:deep([data-el-collection-item].el-dropdown-menu__item--divided:before) {
	background-color: #acbad6 !important;
}

:deep(.el-dropdown-menu__item--divided:hover),
:deep([data-el-collection-item].el-dropdown-menu__item--divided:hover) {
	background-color: #a4ccb1 !important;
	color: #fff !important;
}

:deep(.el-dropdown-menu__item--divided:active),
:deep([data-el-collection-item].el-dropdown-menu__item--divided:active) {
	background-color: #8ab39c !important;
}

/* 头像样式 */
:deep(.el-avatar) {
	border: 2px solid #C1B8A8;
	transition: all 0.3s ease;
}

:deep(.el-avatar:hover) {
	border-color: #A1A8C1;
	transform: scale(1.05);
}

/* 添加一个占位元素，防止内容被固定定位的header遮挡 */
:deep(.el-header) {
	height: 60px;
}

</style>