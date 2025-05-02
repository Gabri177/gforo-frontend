<template>
  <div class="w-full h-full flex-1 bg-[#E3E0DB] min-h-screen p-6 font-sans text-[#4A4A4A]">
    <!-- 轮播图部分 -->
    <div class="mb-10">
      <el-carousel height="320px" class="rounded-2xl overflow-hidden shadow-xl border border-[#DAD7D2]">
        <el-carousel-item v-for="item in carouselItems" :key="item.id">
          <div class="relative w-full h-full">
            <img :src="item.imageUrl" class="w-full h-full object-cover" :alt="item.title">
            <div class="absolute bottom-0 left-0 right-0 bg-black/40 text-white p-4 backdrop-blur-sm">
              <h3 class="text-xl font-semibold">{{ item.title }}</h3>
              <p class="text-sm mt-1">{{ item.description }}</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 统计概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      <div v-for="stat in statistics" :key="stat.title"
           class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center ring-1 ring-white/20"
               :class="stat.bgColor">
            <span class="text-xl text-white">{{ stat.icon }}</span>
          </div>
          <div class="ml-3">
            <p class="text-sm text-[#6B7C93]">{{ stat.title }}</p>
            <p class="text-xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 板块列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="board in boards" :key="board.id"
           class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] rounded-2xl shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:ring-2 hover:ring-[#A1A8C1]/40">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded flex items-center justify-center">
            <el-avatar shape="square" :size="50" :src="board.iconUrl" />
          </div>
          <div class="ml-4">
            <h3 class="text-xl font-semibold mb-1">{{ board.name }}</h3>
            <p class="text-sm text-[#6B7C93]">{{ board.description }}</p>
          </div>
        </div>

        <!-- 板块统计信息 -->
        <div class="flex justify-between items-center mt-4 pt-4 border-t border-[#E3E0DB]">
          <div class="flex space-x-4">
            <div class="text-center">
              <p class="text-sm text-[#6B7C93]">帖子数</p>
              <p class="text-lg font-semibold text-[#A1A8C1]">{{ board.postCount }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-[#6B7C93]">评论数</p>
              <p class="text-lg font-semibold text-[#A1A8C1]">{{ board.commentCount }}</p>
            </div>
          </div>
          <el-button
            class="custom-button"
            @click="enterBoard(board.id)">
            进入板块
          </el-button>
        </div>

        <!-- 最新帖子预览 -->
        <div class="mt-4 pt-4 border-t border-[#E3E0DB]">
          <p class="text-sm text-[#6B7C93] mb-2">最新帖子</p>
          <div v-if="board.latestPost" class="text-sm">
            <p class="truncate">{{ board.latestPost.discussPosts.title }}</p>
            <p class="text-xs text-[#6B7C93] mt-1">
              {{ board.latestPost.user.nickname }} · {{ formatDate(board.latestPost.discussPosts.createTime) }}
            </p>
          </div>
          <p v-else class="text-sm text-[#6B7C93]">暂无帖子</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBoardList } from '~/api/boardApi'

const router = useRouter()

// 轮播图数据
const carouselItems = ref([
  {
    id: 1,
    imageUrl: 'https://picsum.photos/1200/300?random=1',
    title: '欢迎来到技术社区',
    description: '在这里，你可以找到志同道合的伙伴，一起探讨技术'
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/1200/300?random=2',
    title: '分享你的见解',
    description: '让知识的价值得到最大化的展现'
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/1200/300?random=3',
    title: '社区最新动态',
    description: '了解最新的技术趋势和社区活动'
  }
])

// 统计概览数据
const statistics = ref([
  {
    title: '总用户数',
    value: '1,234',
    icon: '👥',
    bgColor: 'bg-[#A1B0C2]'
  },
  {
    title: '今日发帖',
    value: '56',
    icon: '📝',
    bgColor: 'bg-[#B6C2B9]'
  },
  {
    title: '在线用户',
    value: '328',
    icon: '🟢',
    bgColor: 'bg-[#E1DCCF]'
  },
  {
    title: '总访问量',
    value: '12,345',
    icon: '👁️',
    bgColor: 'bg-[#C4BDC3]'
  }
])

const boards = ref([])

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// 跳转到板块详情
const enterBoard = (boardId) => {
  router.push(`/board/${boardId}`)
}

onMounted(async () => {
  try {
    const res = await getBoardList()
    boards.value = res.boardInfos
  } catch (error) {
    ElMessage.error(error.message || '获取板块信息失败')
  }
})
</script>


<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #A1A8C1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #7A87A8;
}

/* 轮播图样式优化 */
:deep(.el-carousel__item) {
  border-radius: 1rem;
}

:deep(.el-carousel__button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
}

:deep(.el-carousel__button:hover) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* 字体设置 */
.font-sans {
  font-family: 'Inter', 'Noto Sans SC', 'Helvetica Neue', sans-serif;
}


:deep(.el-button.custom-button) {
  background-color: #A1A8C1;
  color: #ffffff;
  border: none;
  border-radius: 9999px;
  padding: 6px 16px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;
}

:deep(.el-button.custom-button:hover) {
  background-color: #929BB5;
}

:deep(.el-button.custom-button:active) {
  background-color: #7A87A8;
  transform: scale(0.97);
}

:deep(.el-button.custom-button:focus) {
  outline: none;
  box-shadow: 0 0 0 3px rgba(193, 198, 204, 0.4);
}

:deep(.el-button.custom-button.is-disabled),
:deep(.el-button.custom-button:disabled) {
  background-color: #D9D9DD;
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.7;
}

</style>
