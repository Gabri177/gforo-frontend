<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8" style="margin-top: 60px;">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-3/4 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl profile-container">
        <div class="flex flex-col">
          <!-- 个人资料头部 -->
          <div class="flex items-center mb-8 profile-header">
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-[#A1A8C1] avatar-container">
              <img 
                :src="userAvatar || '/default-avatar.png'" 
                alt="avatar"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="ml-6 user-info relative">
              <h2 class="text-2xl font-bold text-[#6B7C93]">{{ username }}</h2>
              <div class="relative group">
                <p class="text-[#8B93B1] mt-2 truncate max-w-[400px] cursor-pointer">
                  {{ bio || 'No bio yet' }}
                </p>
                <!-- 悬浮卡片 -->
                <div v-if="bio" 
                  class="bio-tooltip opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute left-0 top-full mt-2 p-4 rounded-xl backdrop-blur-md bg-white/90 border border-[#E3E0DB] shadow-lg transition-all duration-300 z-10 max-w-[500px] min-w-[300px]"
                >
                  <div class="relative">
                    <!-- 小箭头 -->
                    <div class="absolute -top-6 left-4 w-3 h-3 rotate-45 bg-white border-l border-t border-[#E3E0DB]"></div>
                    <!-- bio内容 -->
                    <p class="text-[#6B7C93] whitespace-pre-wrap break-words leading-relaxed">
                      {{ bio }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 个人信息卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 基本信息 -->
            <div class="p-6 border border-[#C1B8A8] rounded-xl info-card">
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
                    :disabled="isButtonDisabled"
                  >
                    Send Verify Email
                  </el-button>
                  <span v-if="countdown > 0 && status != 'Activated'" class="ml-2 text-[#8B93B1]">
                    ({{ formatCountdown }})
                  </span>
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="p-6 border border-[#C1B8A8] rounded-xl stats-card">
              <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">Statistics</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="stat-item">
                  <div class="text-2xl font-bold text-[#6B7C93]">{{ postsCount }}</div>
                  <div class="text-[#8B93B1] mt-1">Posts</div>
                </div>
                <div class="stat-item">
                  <div class="text-2xl font-bold text-[#6B7C93]">{{ commentsCount }}</div>
                  <div class="text-[#8B93B1] mt-1">Comments</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="mt-8 flex justify-end action-button">
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user'

import {
	getUserInfo,
	sendVerifyEmail
} from '~/api/userApi'

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
const postsCount = ref(userStore.userInfo.postsCount)
const commentsCount = ref(userStore.userInfo.commentsCount)
const sendVerifyEmailLoading = ref(false)
const countdown = ref(0)
const isButtonDisabled = ref(false)
let countdownTimer = null

window.addEventListener('storage', function (event) {
	console.log ("storage", event)
  if (event.key === 'emailVerified' && event.newValue === 'true') {
	console.log("Email verified")
	userStore.updateStatus('1')
    status.value = 'Activated'
	localStorage.removeItem('verifyEmailDisabledUntil')
	countdown.value = 0
	if (countdownTimer) {
		clearInterval(countdownTimer)
	}
  }
});

console.log("userInfo Profile", userStore.userInfo)

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

// 格式化倒计时显示
const formatCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60)
  const seconds = countdown.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const startCountdown = (initialValue = 60) => {
  countdown.value = initialValue
  isButtonDisabled.value = true

  // 保存禁用截止时间
  const disabledUntil = Date.now() + initialValue * 1000
  localStorage.setItem('verifyEmailDisabledUntil', disabledUntil.toString())

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      isButtonDisabled.value = false
      localStorage.removeItem('verifyEmailDisabledUntil')
    }
  }, 1000)
}

// 检查是否应该继续倒计时
const checkDisabledStatus = () => {
  const disabledUntil = localStorage.getItem('verifyEmailDisabledUntil')
  if (disabledUntil) {
    const remainingTime = Math.floor((parseInt(disabledUntil) - Date.now()) / 1000)
    if (remainingTime > 0) {
      startCountdown(remainingTime)
    } else {
      localStorage.removeItem('verifyEmailDisabledUntil')
    }
  }
}


const handleSendVerifyEmail = () => {
    console.log("userStore.userInfo", userStore.userInfo)
    sendVerifyEmailLoading.value = true
    sendVerifyEmail(userStore.userInfo)
    .then(res => {
        ElMessage.success('Verify email sent successfully, please check your email')
		startCountdown()
    })
    .catch(err => {
        ElMessage.error(err.message || 'Failed to send verification email')
    })
    .finally(() => {
        sendVerifyEmailLoading.value = false
    })
}



onMounted(async () => {
  try {
	localStorage.removeItem("emailVerified")
	const countdownValue = localStorage.getItem("countdownValue")
	if(countdownValue) {
		countdown.value = countdownValue
	}

	const userInfo = await getUserInfo()
	userStore.setUserInfo({
		id: userInfo.id,
		username: userInfo.username,
		email: userInfo.email,
		bio: userInfo.bio,
		headerUrl: userInfo.headerUrl,
		createdAt: userInfo.createdAt,
		status: userInfo.status,
    postsCount: userInfo.postsCount,
    commentsCount: userInfo.commentsCount
	})
    // TODO: 获取其他用户信息（如统计数据等）
    // const stats = await getUserStats()
    // postsCount.value = stats.posts
    // commentsCount.value = stats.comments
    checkDisabledStatus()
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
	if (countdownTimer) {
		console.log("countdownTimer", countdownTimer)
		clearInterval(countdownTimer)
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

/* 修改容器动画和悬浮效果 */
.profile-container {
  animation: fadeIn 0.6s ease-out;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
}

.profile-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(120deg, #E3E0DB, #C1B8A8);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.profile-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(193, 184, 168, 0.2);
  border-color: #A1A8C1;
}

.profile-container:hover::before {
  opacity: 0.1;
}

/* 添加微妙的光影效果 */
.profile-container::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(120deg, rgba(255,255,255,0.2), rgba(255,255,255,0));
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.profile-container:hover::after {
  opacity: 1;
}

/* 头像容器动画 */
.avatar-container {
  animation: slideInAndRotate 0.8s ease-out;
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

/* 用户信息动画 */
.user-info {
  animation: slideInRight 0.6s ease-out;
}

/* 信息卡片动画 */
.info-card {
  animation: slideInUp 0.6s ease-out 0.2s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 统计卡片动画 */
.stats-card {
  animation: slideInUp 0.6s ease-out 0.4s both;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 按钮动画 */
.action-button {
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

/* 定义动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInAndRotate {
  from {
    opacity: 0;
    transform: translateX(-50px) rotate(-180deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 统计项样式 */
.stat-item {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
  border: 1px solid #E3E0DB;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(161, 168, 193, 0.1), rgba(193, 184, 168, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  border-color: #A1A8C1;
  box-shadow: 0 4px 12px rgba(193, 184, 168, 0.1);
}

.stat-item:hover::before {
  opacity: 1;
}

/* 数字动画效果 */
.stat-item .text-2xl {
  transition: all 0.3s ease;
}

.stat-item:hover .text-2xl {
  transform: scale(1.1);
  color: #6B7C93;
}

/* 文字动画效果 */
.stat-item div:nth-child(2) {
  transition: all 0.3s ease;
}

.stat-item:hover div:nth-child(2) {
  color: #A1A8C1;
}

.user-info p {
  @apply transition-all duration-200;
  line-height: 1.5;
}

.user-info p:hover {
  @apply text-[#6B7C93];
}

.bio-tooltip {
  transform-origin: top left;
  animation: tooltipFadeIn 0.3s ease;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 悬浮卡片的阴影和边框效果 */
.bio-tooltip {
  box-shadow: 
    0 4px 6px -1px rgba(193, 184, 168, 0.1),
    0 2px 4px -1px rgba(193, 184, 168, 0.06);
}

.bio-tooltip:hover {
  border-color: #C1B8A8;
  box-shadow: 
    0 10px 15px -3px rgba(193, 184, 168, 0.1),
    0 4px 6px -2px rgba(193, 184, 168, 0.05);
}

/* 确保悬浮框内容样式 */
.bio-tooltip p {
  font-size: 0.95rem;
  color: #6B7C93;
}

/* 添加滚动条样式，以防内容过长 */
.bio-tooltip {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #A1A8C1 transparent;
}

.bio-tooltip::-webkit-scrollbar {
  width: 4px;
}

.bio-tooltip::-webkit-scrollbar-track {
  background: transparent;
}

.bio-tooltip::-webkit-scrollbar-thumb {
  background-color: #A1A8C1;
  border-radius: 2px;
}
</style> 