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
                  <span class="text-[#8B93B1] w-24">Username:</span>
                  <span class="text-[#6B7C93]">{{ username }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">Email:</span>
                  <span class="text-[#6B7C93]">{{ email }}</span>
                </div>
                <div class="flex items-center">
                  <span class="text-[#8B93B1] w-24">Join Date:</span>
                  <span class="text-[#6B7C93]">{{ joinDate }}</span>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模拟数据，实际应该从API获取
const username = ref('Username')
const email = ref('user@example.com')
const bio = ref('This is a bio')
const userAvatar = ref(null)
const joinDate = ref('2024-03-20')
const postsCount = ref(0)
const commentsCount = ref(0)

onMounted(async () => {
  try {
    // TODO: 获取用户信息
    // const userInfo = await getUserProfile()
    // username.value = userInfo.username
    // ...
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
})
</script> 