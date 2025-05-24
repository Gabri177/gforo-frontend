<template>
	<el-popover :placement="props.placement" width="300" trigger="manual" :visible="visible"
		:popper-options="popperOptions" popper-class="morandi-user-popover">
		<template #reference>
			<span class=" user-name-ellipsis text-[#6B7C93] cursor-pointer hover:underline" @click.stop="handleClick">
				{{ props.addAt ? '@' : '' }}{{ basicUser?.nickname || basicUser?.username }}{{ props.addColon ? ' :' : ''
				}}
			</span>
		</template>

		<div v-if="loading" class="p-2 text-sm text-[#6B7C93]">Loading ...</div>

		<div v-else-if="detailedUser" @click.stop class="p-2">
			<!-- 头像和用户名 -->
			<div class="flex items-center gap-3 mb-3">
				<el-avatar :src="detailedUser.headerUrl || '/default-avatar.png'" size="large"
					class="border border-[#A1A8C1]" />
				<div>
					<div class="text-lg font-bold text-[#4A4A4A]">
						{{ detailedUser.nickname }}
					</div>
					<div class="text-sm text-[#6B7C93]">@{{ detailedUser.username }}</div>
				</div>
			</div>

			<!-- 身份 -->
			<div class="text-sm text-[#83B59D] mb-1 card">
				🧩 Identity: <span class="font-semibold">{{ userRoleLabel }}</span>
			</div>

			<!-- 状态 -->
			<div class="text-sm text-[#6B7C93] mb-1 card">
				⚠️ Status:
				<span
					:class="detailedUser.status === 2 ? 'text-orange-500' : detailedUser.status === 1 ? 'text-green-600' : 'text-red-500'">
					{{ detailedUser.status === 2 ? 'Disabled' : detailedUser.status === 1 ? 'Normal' : 'Deleted' }}
				</span>
			</div>
			<!-- 获得点赞数量 -->
			<div class="text-sm text-[#6B7C93] mb-1 card">
			❤️ Likes Received:
			<span class="font-semibold text-[#4A4A4A]">
				{{ detailedUser.getLikeCount ?? 0 }}
			</span>
			</div>
			<!-- Email -->
			<p v-if="detailedUser.email" class="text-sm text-[#6B7C93] mb-1 card">
				📧 Email:
				<span class="font-medium text-[#4A4A4A]">{{ detailedUser.email }}</span>
			</p>

			<!-- 注册时间 -->
			<p class="text-sm text-[#6B7C93] mb-1 card">
				🕒 Create Time:
				<span class="font-medium text-[#4A4A4A]">
					{{ formatDate(detailedUser.createdAt) }}
				</span>
			</p>

			<!-- 帖子和评论数量 - 毛玻璃卡片布局 -->
			<div class="flex justify-between gap-2 mt-2" v-show="!detailedUser.status == 0">
				<div class="glass-card flex-1 text-center" @click="handleViewOthersPosts(detailedUser)">
					📝 Posts<br />
					<span class="font-semibold text-[#4A4A4A] text-base">{{ detailedUser.postCount }}</span>
				</div>
				<div class="glass-card flex-1 text-center">
					💬 Comments<br />
					<span class="font-semibold text-[#4A4A4A] text-base">{{ detailedUser.commentCount }}</span>
				</div>
			</div>

			<!-- Bio -->
			<div v-if="detailedUser.bio" class="text-sm text-[#4A4A4A] mt-1 card bio-card">
				👤 Bio:
				<div class="mt-1 whitespace-pre-wrap">
					<span>{{ isBioExpanded ? detailedUser.bio : truncatedBio }}</span>
					<button v-if="detailedUser.bio.length > 30"
						class="ml-2 text-[#83B59D] hover:underline focus:outline-none text-xs font-medium"
						@click.stop="toggleBio">
						{{ isBioExpanded ? 'Collapse' : 'Expand' }}
					</button>
				</div>
			</div>


		</div>
	</el-popover>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '~/api/userApi'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
// 接收基础信息 + 当前板块 ID（用于判断是否为该板块版主）
const props = defineProps({
	user: Object,
	boardId: Number,
	placement: String,
	addAt: Boolean,
	addColon: Boolean
})

const popperOptions = {
	modifiers: [
		{
			name: 'flip',
			options: {
				fallbackPlacements: ['left', 'right', 'top', 'bottom']
			}
		},
		{
			name: 'preventOverflow',
			options: {
				padding: 8
			}
		}
	]
}


const basicUser = props.user
const visible = ref(false)
const detailedUser = ref(null)
const loading = ref(false)

const isBioExpanded = ref(false)
const toggleBio = () => {
	isBioExpanded.value = !isBioExpanded.value
}

const truncatedBio = computed(() => {
	if (!detailedUser.value?.bio) return ''
	return detailedUser.value.bio.length > 30
		? detailedUser.value.bio.slice(0, 30) + '...'
		: detailedUser.value.bio
})


const userRoleLabel = computed(() => {
	if (!detailedUser.value) return ''

	const roles = detailedUser.value?.accessControl?.roles || []
	const boardIds = detailedUser.value?.accessControl?.boardIds || []
	console.log("roles", roles)
	console.log("boardIds", boardIds)
	console.log("boardId", props.boardId)
	if (detailedUser.value.status == 0) return 'GHOST'
	const currentBoardId = Number(props.boardId)
	// ==============================================
	// 这里有问题 需要修改
	// ==============================================
	if (roles.includes('ROLE_SUPER_ADMIN')) return 'Super Admin'
	if (roles.includes('ROLE_ADMIN')) return 'Admin'
	if (roles.includes('ROLE_BOARD') && boardIds.includes(currentBoardId)) return 'Moderator'
	return 'User'
})


// 控制只显示一个 popover
const eventBus = window.__userPopoverBus__ || (window.__userPopoverBus__ = new EventTarget())

function handleClick() {
	if (!userStore.isLoggedInState)
		return ;
	if (!visible.value) {
		eventBus.dispatchEvent(new Event('close-all'))
		loadUser()
		visible.value = true
	} else {
		visible.value = false
	}
}

const handleViewOthersPosts = (user) => {
	localStorage.setItem('lastVisitedUser', JSON.stringify(user))
	console.log("user", user)
	window.location.href = `/profile/posts/${user.id}`
	
}

async function loadUser() {
	if (!basicUser?.id) return
	loading.value = true
	try {
		const res = await getUserInfo(basicUser.id)
		detailedUser.value = res
		console.log(detailedUser.value)
	} catch (err) {
		detailedUser.value = {
			...props.user,
			status: 0
		}
		ElMessage.error(err.message ? err.message : 'Failed to load user info')
	} finally {
		loading.value = false
	}
}

function close() {
	visible.value = false
}

function formatDate(date) {
	const d = new Date(date)
	return isNaN(d) ? 'Unknown' : d.toLocaleDateString()
}

onMounted(() => {
	eventBus.addEventListener('close-all', close)
	document.addEventListener('click', close)
})

onBeforeUnmount(() => {
	eventBus.removeEventListener('close-all', close)
	document.removeEventListener('click', close)
})
</script>

<style scoped>
.bio-card {
	max-height: 120px;
	overflow-y: auto;
	overflow-x: hidden;
	white-space: pre-wrap;
	word-break: break-word;
}

/* 可选滚动条美化 */
.bio-card::-webkit-scrollbar {
	width: 6px;
}

.bio-card::-webkit-scrollbar-thumb {
	background-color: #C1B8A8;
	border-radius: 3px;
}

.user-name-ellipsis {
	display: inline-block;
	max-width: 100px;
	/* 可根据设计适当调整 */
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	vertical-align: baseline;
  line-height: 1.5;
}

.card {
	background-color: rgba(255, 255, 255, 0.25);
	backdrop-filter: blur(10px) saturate(180%);
	-webkit-backdrop-filter: blur(10px) saturate(180%);
	border: 1px solid rgba(200, 200, 200, 0.3);
	border-radius: 10px;
	padding: 8px 12px;
	color: #6B7C93;
	font-size: 14px;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 4px 10px rgba(193, 184, 168, 0.2);
	cursor: pointer;
	user-select: none;
}

.glass-card {
	background-color: rgba(255, 255, 255, 0.25);
	backdrop-filter: blur(10px) saturate(180%);
	-webkit-backdrop-filter: blur(10px) saturate(180%);
	border: 1px solid rgba(200, 200, 200, 0.3);
	border-radius: 10px;
	padding: 8px 12px;
	color: #6B7C93;
	font-size: 14px;
	transition: all 0.2s ease-in-out;
	box-shadow: 0 4px 10px rgba(193, 184, 168, 0.2);
	cursor: pointer;
	user-select: none;
}

.glass-card:hover {
	background-color: rgba(255, 255, 255, 0.35);
	box-shadow: 0 6px 14px rgba(193, 184, 168, 0.3);
	transform: translateY(-2px);
}

.glass-card:active {
	transform: scale(0.97) translateY(0);
	box-shadow: 0 2px 6px rgba(193, 184, 168, 0.2);
}
</style>