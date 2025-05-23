<template>
  <div class="w-full h-full flex-1 bg-[#E3E0DB] p-6 font-sans text-main">
    <!-- Breadcrumb -->
    <div class="mb-10">
      <div class="bg-blur-box px-5 py-3 rounded-xl shadow flex items-center space-x-2 text-sm text-subtle">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">
            <div class="flex items-center gap-1">
              <el-icon><HomeFilled /></el-icon>
              Home
            </div>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- Carousel -->
    <div class="mb-10">
      <el-carousel height="320px" class="rounded-2xl overflow-hidden shadow-xl border border-[#DAD7D2]"
      :interval="4000">
      <el-carousel-item v-for="item in carouselItems" :key="item.id">
  <component :is="item.targetUrl ? 'a' : 'div'" 
             :href="item.targetUrl" 
             target="_blank" 
             class="block relative w-full h-full cursor-pointer">
    <img :src="item.imageUrl" class="w-full h-full object-cover" :alt="item.title" />
    <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-4 backdrop-blur-sm">
      <h3 class="text-xl font-semibold">{{ item.title }}</h3>
      <p class="text-sm mt-1">{{ item.description }}</p>
    </div>
  </component>
</el-carousel-item>

      </el-carousel>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div v-for="stat in statistics" :key="stat.title" class="bg-blur-box p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center ring-1 ring-white/20" :class="stat.bgColor">
            <div v-html="stat.icon"></div>
          </div>
          <div class="ml-3">
            <p class="text-sm text-subtle">{{ stat.title }}</p>
            <p class="text-xl font-bold text-accent">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Board List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-if="isLoading">
        <div v-for="n in 6" :key="n" class="bg-blur-box p-6 rounded-2xl shadow-lg">
          <el-skeleton animated>
            <template #template>
              <div class="flex items-center mb-4">
                <el-skeleton-item variant="image" style="width: 50px; height: 50px; border-radius: 6px;" />
                <div class="ml-4 flex-1">
                  <el-skeleton-item variant="text" style="width: 80%;" />
                  <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px;" />
                </div>
              </div>
              <el-skeleton-item variant="text" style="width: 100%; height: 16px;" />
              <el-skeleton-item variant="text" style="width: 70%; height: 16px; margin-top: 8px;" />
            </template>
          </el-skeleton>
        </div>
      </template>

      <template v-else>
        <div v-for="board in boards" :key="board.id" class="bg-blur-box p-6 rounded-2xl shadow-lg transition hover:scale-105 hover:ring-2 hover:ring-[#B4B8C5]">
          <div class="flex items-center mb-4">
            <el-avatar shape="square" :size="50" :src="board.iconUrl" />
            <div class="ml-4">
              <h3 class="text-xl font-semibold text-main mb-1">{{ board.name }}</h3>
              <p class="text-sm text-subtle">{{ board.description }}</p>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4 pt-4 border-t border-[#E3E0DB]">
            <div class="flex space-x-4">
              <div class="text-center">
                <p class="text-sm text-subtle">Posts</p>
                <p class="text-lg font-semibold text-accent">{{ board.postCount }}</p>
              </div>
              <div class="text-center">
                <p class="text-sm text-subtle">Comments</p>
                <p class="text-lg font-semibold text-accent">{{ board.commentCount }}</p>
              </div>
            </div>
            <el-button class="custom-button" @click="enterBoard(board.id, board.name)">
              Enter
            </el-button>
          </div>

          <div class="mt-4 pt-4 border-t border-[#E3E0DB]">
            <p class="text-sm text-subtle mb-2">Latest Post</p>
            <div v-if="board.latestPost" class="text-sm">
              <p class="truncate">{{ board.latestPost.discussPosts.title }}</p>
              <p class="text-xs text-subtle mt-1">
                {{ board.latestPost.user.nickname }} · {{ formatDate(board.latestPost.discussPosts.createTime) }}
              </p>
            </div>
            <p v-else class="text-sm text-subtle">No posts yet</p>
          </div>
        </div>
      </template>
    </div>

  </div>
  <div>
    {{ test }}
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBoardList } from '~/api/boardApi'
import { HomeFilled } from '@element-plus/icons-vue'
import { PERMISSIONS } from '~/constants/permissions'
import { getCarouselList} from '~/api/layoutApi'
import { getStatistics } from '~/api/statisticsApi'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(true)
const test = ref()
const isLogin = userStore.isLoggedInState

const carouselItems = ref([
  { id: 1, imageUrl: 'https://picsum.photos/1200/300?random=1', title: 'Welcome to the Tech Community', description: 'Find like-minded peers and discuss technology together.' },
  { id: 2, imageUrl: 'https://picsum.photos/1200/300?random=2', title: 'Share Your Insights', description: 'Maximize the value of your knowledge.' },
  { id: 3, imageUrl: 'https://picsum.photos/1200/300?random=3', title: 'Latest Community Updates', description: 'Stay up to date with tech trends and activities.' }
])

const statistics = ref()

const boards = ref([])

const formatDate = (date) => new Date(date).toLocaleString()

const enterBoard = (boardId, boardName) => {
  localStorage.setItem('breadcrumb_parentTitle', boardName)
  localStorage.setItem('breadcrumb_postsPath', `/board/${boardId}`)
  router.push({ path: `/board/${boardId}` })
}

onMounted(async () => {

  
  try {
    const res = await getBoardList()
    const carouselInfo = await getCarouselList()
    const statisticsInfo = await getStatistics()
    //statistics.value = statisticsInfo
    statistics.value = [
      {
        title: 'Total Users',
        value: statisticsInfo.totalUsers.toLocaleString(),
        icon: '<i class="pi pi-user" style="font-size: 1rem"></i>',
        bgColor: 'bg-[#A1B0C2]'
      },
      {
        title: 'Total Posts',
        value: statisticsInfo.totalPosts.toLocaleString(),
        icon: '<i class="pi pi-pencil" style="font-size: 1rem"></i>',
        bgColor: 'bg-[#B6C2B9]'
      },
      {
        title: 'Online Users',
        value: statisticsInfo.activeUsers.toLocaleString(),
        icon: '<i class="pi pi-clock" style="font-size: 1rem"></i>',
        bgColor: 'bg-[#E1DCCF]'
      },
      {
        title: 'Visits Today',
        value: statisticsInfo.visitToday.toLocaleString(),
        icon: '<i class="pi pi-eye" style="font-size: 1rem"></i>',
        bgColor: 'bg-[#C4BDC3]'
      }
    ]
    
    if (carouselInfo.length > 0) {
      carouselItems.value = carouselInfo
    }
    boards.value = res.boardInfos
  } catch (error) {
    ElMessage.error(error?.message ? error?.message : 'Failed to fetch board list')
  } finally {
    isLoading.value = false
  }

})
</script>

<style scoped>

:root {
  --el-text-color-regular: #6B7C93;
  --main-font: 'Inter', 'Noto Sans SC', 'Helvetica Neue', sans-serif;
}

.font-sans {
  font-family: var(--main-font);
}

.text-main {
  color: #4A4A4A;
}

.text-subtle {
  color: #6B7C93;
}

.text-accent {
  color: #A1A8C1;
}

.bg-blur-box {
  @apply bg-white/60 backdrop-blur-md border border-[#DAD7D2];
}

:deep(.el-button.custom-button) {
  background-color: #A1A8C1;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 6px 16px;
  font-size: 14px;
  transition: all 0.2s ease-in-out;
}

:deep(.el-button.custom-button:hover) {
  background-color: #929BB5;
}

:deep(.el-button.custom-button:active) {
  background-color: #7A87A8;
  transform: scale(0.97);
}
</style>
