<template>
	<el-header class=" sticky top-0 px-0 z-50" v-if="loginUser">
		<div class="flex items-center">
			<!-- 导航 -->
			<div class="h-full w-full">
				<el-menu :default-active="activeIndex" mode="horizontal" @select="handleSelect"
				class="backdrop-blur-md bg-black/30 shadow-md"
				background-color="#545c64" text-color="#fff"
				:ellipsis="false"
				>
					<el-menu-item index="1">
						<span class="font-semibold text-xl tracking-tight text-white">GForo</span>
					</el-menu-item>
					<el-menu-item index="2">
						<span class="font-semibold text-xl tracking-tight text-white">Message</span>
					</el-menu-item>
					<el-menu-item index="3" >
						<span class="font-semibold text-xl tracking-tight text-white">Login</span>
					</el-menu-item>
					<el-menu-item index="4" >  <!-- v-if="loginUser" -->
						Register
						<!-- <span class="badge badge-danger" v-if="allUnreadCount != 0">{{ allUnreadCount }}</span> -->
					</el-menu-item>
					<el-sub-menu index="5">
						<template #title><el-avatar :src="loginUser.headerUrl"></el-avatar></template>
						<el-menu-item index="5-1">Profile</el-menu-item>
						<el-menu-item index="5-2">Setting</el-menu-item>
						<el-menu-item index="5-3">Logout</el-menu-item>
					</el-sub-menu>
					<el-menu-item index="6" class="flex-grow-0 flex-shrink-0" >
						<el-input v-model="input3" style="max-width: 600px; width:100%" placeholder="Please input"
							class="input-with-selec mr-4">
							<template #append>
								<el-button type="primary" @click="search">
									<el-icon>
										<Search />
									</el-icon>
								</el-button>
							</template>
						</el-input>
					</el-menu-item>


				</el-menu>
			</div>

		</div>
	</el-header>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const loginUser = ref({
	id: 1,
	username: 'testuser',
	headerUrl: 'https://via.placeholder.com/30'
});
const allUnreadCount = ref(5);
const keyword = ref('');
const activeIndex = ref('1');


watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/') {
      activeIndex.value = '1';
    } else if (newPath.startsWith('/message')) {
      activeIndex.value = '2';
    } else if (newPath.startsWith('/login')) {
      activeIndex.value = '3';
    } else if (newPath.startsWith('/register')) {
      activeIndex.value = '4';
    } else if (newPath.startsWith('/profile') || newPath.startsWith('/setting')) {
      activeIndex.value = '5';
    }
  },
  { immediate: true }
);

const search = () => {
	// 搜索功能实现
	console.log('search');
};
const handleSelect = (key, keyPath) => {
	console.log(key, keyPath);
	// console.log('handleSelect', key);
	switch (key) {
		case '1':
			router.push('/');
			break;
		case '2':
			router.push('/message');
			break;
		case '3':
			router.push('/login');
			break;
		case '4':
			router.push('/register');
			break;
		case '5-1':
			router.push('/profile');
			break;
		case '5-2':
			router.push('/setting');
			break;
		case '5-3':
			router.push('/logout');
			break;
		case '6':
			search();
			break;
		default:
			break;
	}

};
</script>

<style scoped>
.el-menu--horizontal>.el-menu-item:nth-child(4) {
	margin-right: auto;
}
</style>