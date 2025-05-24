<template>
	<div class="flex w-full h-full space-x-6 overflow-hidden">
		<!-- 左侧用户列表 -->
		<div class="w-1/3 border border-[#C1B8A8] rounded-xl p-4 overflow-auto">
			<h3 class="text-lg font-semibold text-[#6B7C93] mb-4">User List</h3>
			<el-input v-model="userSearch" placeholder="Search user by username" class="w-full morandi-input mb-4"
				clearable>
				<template #prefix>
					<el-icon>
						<Search />
					</el-icon>
				</template>
			</el-input>
			<el-scrollbar ref="scrollbarRef" class="h-[calc(100vh*2/5)]">
				<div v-for="user in users" :key="user.id" class="cursor-pointer" @click="selectUser(user)"
					:class="['p-2 rounded-md', selectedUser?.id === user.id ? 'bg-[#F0F4F8]' : 'hover:bg-[#F8FAFC]']">
					<div class="text-[#4A4A4A] font-medium">{{ user.nickname }}</div>
					<div class="text-sm text-[#8B93B1]">{{ user.email }}</div>
				</div>
			</el-scrollbar>

		</div>

		<!-- 右侧称号管理 -->
		<div class="flex-1 border border-[#C1B8A8] rounded-xl p-6">
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold text-[#6B7C93]">User Titles</h3>
				<el-button class="morandi-view-btn" @click="showAllTitleDialog = true">Manage All Titles</el-button>
			</div>

			<div v-if="selectedUser">
				<div class="mb-4">
					<span class="text-[#8B93B1]">User:</span>
					<span class="text-[#4A4A4A] font-semibold ml-2">{{ selectedUser.nickname }} ({{ selectedUser.email
					}})</span>
				</div>

				<div class="mb-4">
					<el-select v-model="selectedTitleId" placeholder="Select title to add" class="w-64 morandi-input">
						<el-option v-for="title in availableTitles" :key="title.id" :label="title.name"
							:value="title.id" />
					</el-select>
					<el-button class="morandi-button ml-2" @click="handleAddTitle">Add Title</el-button>
				</div>

				<el-table :data="userTitles" border stripe class="morandi-table">
					<el-table-column prop="name" label="Title Name" />
					<el-table-column prop="description" label="Description" />
					<el-table-column label="Operation" width="120">
						<template #default="scope">
							<el-button v-if="scope.row.buildin !== 1" size="small" class="morandi-disable-btn"
								@click="handleRemoveTitle(scope.row)">
								Remove
							</el-button>
							<el-button v-else size="small" class="morandi-disable-btn" disabled>
								BuildIn
							</el-button>

						</template>
					</el-table-column>
				</el-table>
			</div>
			<div v-else class="text-[#8B93B1]">Please select a user to manage titles.</div>
		</div>
	</div>

	<!-- 弹窗 -->
	<el-dialog v-model="showAllTitleDialog" title="Manage All Titles" width="600px" append-to-body align-center>
		<el-form :model="newTitle" inline class="mb-4">
			<el-form-item label="Name">
				<el-input v-model="newTitle.name" placeholder="Title name" class="morandi-input" />
			</el-form-item>
			<el-form-item label="Description">
				<el-input v-model="newTitle.description" placeholder="Description" class="morandi-input" />
			</el-form-item>
			<el-button type="primary" class="morandi-confirm-btn" @click="handleAddNewTitle">Add</el-button>
		</el-form>
		<el-table :data="allTitles" border stripe>
			<el-table-column prop="name" label="Title Name" />
			<el-table-column prop="description" label="Description" />
			<el-table-column label="Operation" width="100">
				<template #default="scope">
					<el-button class="morandi-disable-btn" size="small" type="danger" @click="handleDeleteTitle(scope.row)">Delete</el-button>
				</template>
			</el-table-column>
		</el-table>
	</el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getUserList, getUserListUsernameLike } from '~/api/adminApi'
import debounce from 'lodash/debounce'
import {
	getUserTitles,
	getTitleListWithoutExp,
	grantTitle,
	deleteTitle,
	addTitle
} from '~/api/titleApi'

const selectedUser = ref(null)
const userTitles = ref([])
const selectedTitleId = ref(null)
const showAllTitleDialog = ref(false)
const allTitles = ref([])
const newTitle = ref({ name: '', description: '' })

const scrollbarRef = ref(null)
const loadingUsers = ref(false)
const noMoreUsers = ref(false)

const userSearch = ref('')
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

const fetchUsersBySearch = async () => {
	loadingUsers.value = true
	try {
		const res = await getUserListUsernameLike(currentPage.value, pageSize.value, false, userSearch.value)
		users.value = res.userInfoList || []
		noMoreUsers.value = (res.userInfoList?.length || 0) < pageSize.value
	} catch (e) {
		console.error(e)
	} finally {
		loadingUsers.value = false
	}
}

// 用 debounce 包一层，避免频繁请求
const debouncedSearch = debounce(() => {
	currentPage.value = 1
	users.value = []
	fetchUsersBySearch()
}, 500)


// 监听搜索输入变化
watch(userSearch, () => {
	if (userSearch.value.trim() === '') {
		// 清空搜索，加载第一页所有用户（先清空 users）
		currentPage.value = 1
		noMoreUsers.value = false
		users.value = []
		loadMoreUsers()
	} else {
		debouncedSearch()
	}
})


// 加载更多用户
const loadMoreUsers = async () => {
	if (loadingUsers.value || noMoreUsers.value) return
	loadingUsers.value = true
	try {
		const res = await getUserList(currentPage.value, pageSize.value, false)
		const list = res?.userInfoList || []
		if (list.length < pageSize.value) noMoreUsers.value = true
		users.value.push(...list)
		currentPage.value++
	} catch (e) {
		ElMessage.error('Failed to load users')
	} finally {
		loadingUsers.value = false
	}
}


// 监听滚动事件
const handleScroll = () => {
	const el = scrollbarRef.value?.wrapRef
	if (!el) return
	const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
	if (scrollBottom < 50) {
		if (userSearch.value.trim() === '') {
			loadMoreUsers()
		} else {
			fetchUsersBySearch()
		}
	}
}



onMounted(() => {
	loadMoreUsers()
	fetchAllTitles() 
	nextTick(() => {
		scrollbarRef.value?.wrapRef?.addEventListener('scroll', handleScroll)
	})
})

onBeforeUnmount(() => {
	scrollbarRef.value?.wrapRef?.removeEventListener('scroll', handleScroll)
})

const availableTitles = computed(() => {
	const ownedIds = userTitles.value.map(t => t.id)
	return allTitles.value.filter(t => !ownedIds.includes(t.id))
})

const selectUser = async (user) => {
	selectedUser.value = user
	selectedTitleId.value = null
	const res = await getUserTitles(user.id)
	userTitles.value = res || []
}

const handleAddTitle = async () => {
	if (!selectedTitleId.value || !selectedUser.value) return
	try {
		await grantTitle(selectedUser.value.id, selectedTitleId.value)
		const added = allTitles.value.find(t => t.id === selectedTitleId.value)
		userTitles.value.push(added)
		selectedTitleId.value = null
		ElMessage.success('Title added')
	} catch (e) {
		ElMessage.error(e.message || 'Failed to add title')
	}
}

const handleRemoveTitle = async (title) => {
	if (!selectedUser.value) return
	try {
		await deleteTitle(title.id) // 如果有独立的 removeUserTitle API 替换此行
		userTitles.value = userTitles.value.filter(t => t.id !== title.id)
		ElMessage.success('Title removed')
	} catch (e) {
		ElMessage.error(e.message || 'Failed to remove title')
	}
}

const handleAddNewTitle = async () => {
	const { name, description } = newTitle.value
	if (!name || !description) return ElMessage.warning('Please input title info')
	try {
		await addTitle({ name, description })
		await fetchAllTitles()
		newTitle.value = { name: '', description: '' }
		ElMessage.success('Title created')
	} catch (e) {
		ElMessage.error(e.message || 'Failed to create title')
	}
}

const handleDeleteTitle = async (title) => {
	try {
		await deleteTitle(title.id)
		await fetchAllTitles()
		ElMessage.success('Title deleted')
	} catch (e) {
		ElMessage.error(e.message || 'Failed to delete title')
	}
}

const fetchAllTitles = async () => {
	allTitles.value = await getTitleListWithoutExp()
}




</script>

<style scoped>
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

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-confirm-btn:hover,
.morandi-confirm-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-confirm-btn:active,
.morandi-confirm-btn.is-active {
  background-color: #7A957A;
  border-color: #7A957A;
  color: #FFFFFF;
}

.morandi-input :deep(.el-input__inner) {
  border-color: #C1B8A8;
}

.morandi-input :deep(.el-input__inner:focus) {
  border-color: #A1A8C1;
}

.morandi-input :deep(.el-input__prefix) {
  color: #8B93B1;
}

/* 莫兰迪风格输入框 */
:deep(.morandi-input .el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #C1B8A8;
  box-shadow: none;
}

:deep(.morandi-input .el-input__wrapper:hover) {
  border-color: #A1A8C1;
}

:deep(.morandi-input .el-input__wrapper.is-focus) {
  border-color: #A1A8C1;
  box-shadow: 0 0 0 1px #A1A8C1;
}
</style>