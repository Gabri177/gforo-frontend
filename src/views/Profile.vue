<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8" style="margin-top: 60px;">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-3/4 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl">
        <div class="flex flex-col">
          <!-- 个人资料头部 -->
          <div class="flex items-center mb-8">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-[#A1A8C1]">
              <img 
                :src="userAvatar || '/default-avatar.png'" 
                alt="avatar"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="ml-6">
              <h2 class="text-2xl font-bold text-[#6B7C93]">{{ username }}</h2>
              <p class="text-[#8B93B1] mt-2">{{ bio || 'No bio yet' }}</p>
            </div>
          </div>

          <!-- 个人信息卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 基本信息 -->
            <div class="p-6 border border-[#C1B8A8] rounded-xl">
              <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">Basic Information</h3>
              <div class="space-y-4">
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">UserId:</span>
                  <span class="text-[#6B7C93]">{{ userId }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">Email:</span>
                  <span class="text-[#6B7C93]">{{ email }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">Join Date:</span>
                  <span class="text-[#6B7C93]">{{ joinDate }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">Status:</span>
                  <span class="text-[#6B7C93]">{{ status }}</span>
                  <el-button 
                    class="morandi-button-green ml-4" 
                    @click="handleSendVerifyEmail"
                    v-show="status != 'Activated'"
					:loading="sendVerifyEmailLoading"
                  >
                    Send Verify Email
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="p-6 border border-[#C1B8A8] rounded-xl">
              <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">Statistics</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-[#F8FAFC] rounded-lg">
                  <div class="text-2xl font-bold text-[#6B7C93]">{{ postsCount }}</div>
                  <div class="text-[#8B93B1] mt-1">Posts</div>
                </div>
                <div class="text-center p-4 bg-[#F8FAFC] rounded-lg">
                  <div class="text-2xl font-bold text-[#6B7C93]">{{ commentsCount }}</div>
                  <div class="text-[#8B93B1] mt-1">Comments</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-8 flex justify-end">
            <router-link 
              to="/settings" 
              class="px-6 py-2 bg-[#A1A8C1] text-white rounded-lg hover:bg-[#8B93B1] transition-colors duration-300"
            >
              Edit Profile
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'
import {
	sendVerifyEmail
} from '~/api/registerApi'

const router = useRouter()
const userStore = useUserStore()

// 使用 store 中的数据
const userId = ref(userStore.userInfo.id)
const username = ref(userStore.userInfo.username)
const email = ref(userStore.userInfo.email)
const bio = ref(userStore.userInfo.bio || 'No bio yet')
const userAvatar = ref(userStore.userInfo.headerUrl)
const joinDate = ref(formatDateToYMD(userStore.userInfo.createdAt))
const status = computed(() => userStore.userInfo.status == '1' ? 'Activated' : 'Inactive')
const postsCount = ref(0)
const commentsCount = ref(0)
const sendVerifyEmailLoading = ref(false)
window.addEventListener('storage', function (event) {
	console.log ("storage", event)
  if (event.key === 'emailVerified' && event.newValue === 'true') {
	console.log("Email verified")
	userStore.updateStatus('1')
    status.value = 'Activated'
  }
});


// console.log("createdAt", userStore.userInfo.createdAt)
console.log("userInfo Profile", userStore.userInfo)
// console.log("joinDate", formatDateToYMD(userStore.userInfo.createdAt))

function formatDateToYMD(dateString) {
  const parts = dateString.split(" "); // ["Sun", "Mar", "23", "22:48:09", "CET", "2025"]

  const monthMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };

  const day = parts[2];
  const month = monthMap[parts[1]];
  const year = parts[5];

  if (!month) {
    console.warn("月份无法解析:", parts[1]);
    return null;
  }

  return `${year}-${month}-${day.padStart(2, '0')}`;
}

const handleSendVerifyEmail = () => {
	console.log("userStore.userInfo", userStore.userInfo)
	sendVerifyEmailLoading.value = true
	sendVerifyEmail(userStore.userInfo)
	.then(res => {
		ElMessage.success('Verify email sent successfully, please check your email')
	})
	.catch(err => {
		ElMessage.error(err.message)
	})
	.finally(() => {
		sendVerifyEmailLoading.value = false
	})
}


onMounted(async () => {
  try {
	localStorage.removeItem("emailVerified")
    // TODO: 获取其他用户信息（如统计数据等）
    // const stats = await getUserStats()
    // postsCount.value = stats.posts
    // commentsCount.value = stats.comments
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
})
</script>

<style scoped>
/* 添加莫兰迪绿色按钮样式 */
.morandi-button-green {
  background-color: #83B59D !important;
  border-color: #83B59D !important;
  color: white !important;
  transition: all 0.3s ease !important;
}

.morandi-button-green:hover {
  background-color: #6FA189 !important;
  border-color: #6FA189 !important;
}

.morandi-button-green:active {
  background-color: #5C8C75 !important;
  border-color: #5C8C75 !important;
}

.morandi-button-green:disabled {
  background-color: #C5D6CE !important;
  border-color: #C5D6CE !important;
  cursor: not-allowed;
}
</style> 