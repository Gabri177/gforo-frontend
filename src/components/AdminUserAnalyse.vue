<template>
  <div>
    <!-- 数据概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 用户统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">All Users</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#E6F0EB]">
            <el-icon class="text-[#83B59D]" :size="28"><User /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#83B59D] font-medium">↑ {{ statistics.userGrowthRate }}%</span> This Month
        </div>
        <div class="mt-3 h-1 w-full bg-[#E3E0DB] rounded-full overflow-hidden">
          <div class="h-full bg-[#83B59D] rounded-full" :style="{width: `${Math.min(statistics.userGrowthRate * 5, 100)}%`}"></div>
        </div>
      </div>

      <!-- 帖子统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">All Posts</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalPosts }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#E6EDF5]">
            <el-icon class="text-[#6B8EB2]" :size="28"><Document /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#6B8EB2] font-medium">↑ {{ statistics.postGrowthRate }}%</span> This Month
        </div>
        <div class="mt-3 h-1 w-full bg-[#E3E0DB] rounded-full overflow-hidden">
          <div class="h-full bg-[#6B8EB2] rounded-full" :style="{width: `${Math.min(statistics.postGrowthRate * 5, 100)}%`}"></div>
        </div>
      </div>

      <!-- 评论统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">All Comments</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalComments }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#F0E9E9]">
            <el-icon class="text-[#B28E8E]" :size="28"><ChatDotRound /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#B28E8E] font-medium">↑ {{ statistics.commentGrowthRate }}%</span> This Month
        </div>
        <div class="mt-3 h-1 w-full bg-[#E3E0DB] rounded-full overflow-hidden">
          <div class="h-full bg-[#B28E8E] rounded-full" :style="{width: `${Math.min(statistics.commentGrowthRate * 5, 100)}%`}"></div>
        </div>
      </div>
    </div>

    <!-- 数据概览小卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 flex items-center justify-center rounded-full bg-[#E6F0EB] mr-3">
            <el-icon class="text-[#83B59D]" :size="20"><UserFilled /></el-icon>
          </div>
          <div>
            <p class="text-sm text-[#8B93B1]">Active Users</p>
            <p class="text-xl font-bold text-[#4A4A4A]">{{ statistics.activeUsers }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 flex items-center justify-center rounded-full bg-[#E6EDF5] mr-3">
            <el-icon class="text-[#6B8EB2]" :size="20"><View /></el-icon>
          </div>
          <div>
            <p class="text-sm text-[#8B93B1]">Visits Today</p>
            <p class="text-xl font-bold text-[#4A4A4A]">{{ todayVisits }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 flex items-center justify-center rounded-full bg-[#F0E9E9] mr-3">
            <el-icon class="text-[#B28E8E]" :size="20"><DocumentAdd /></el-icon>
          </div>
          <div>
            <p class="text-sm text-[#8B93B1]">Posts Today</p>
            <p class="text-xl font-bold text-[#4A4A4A]">{{ todayPosts }}</p>
          </div>
        </div>
      </div>
      
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 flex items-center justify-center rounded-full bg-[#EAE6F0] mr-3">
            <el-icon class="text-[#8E8EB2]" :size="20"><ChatLineRound /></el-icon>
          </div>
          <div>
            <p class="text-sm text-[#8B93B1]">Comments Today</p>
            <p class="text-xl font-bold text-[#4A4A4A]">{{ todayComments }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃度图表 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">User Activity</h3>
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white" style="height: 400px;">
        <div ref="activityChartRef" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 注册趋势图表 -->
    <div>
      <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">User Registration Trends</h3>
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white" style="height: 400px;">
        <div ref="registrationChartRef" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { getStatistics, getWeeklyActivity, getMonthlyRegistration } from '~/api/statisticsApi'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const statistics = ref({
  totalUsers: 0,
  activeUsers: 0,
  userGrowthRate: 0,
  totalPosts: 0,
  postGrowthRate: 0,
  totalComments: 0,
  commentGrowthRate: 0
})

const todayVisits = ref(0)
const todayPosts = ref(0)
const todayComments = ref(0)

const activityChartRef = ref(null)
const registrationChartRef = ref(null)

let activityChart = null
let registrationChart = null

const initCharts = (weeklyData, monthlyData) => {
  nextTick(() => {
    if (activityChartRef.value) {
      activityChart = echarts.init(activityChartRef.value)
      activityChart.setOption({
        title: {
          text: 'User Activity Statistics',
          left: 'center',
          textStyle: { color: '#6B7C93', fontWeight: 'normal', fontSize: 16 }
        },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Active Users', 'Number of posts', 'Number of comments'], bottom: '0%', textStyle: { color: '#6B7C93' } },
        xAxis: {
          type: 'category',
          data: weeklyData.map(i => i.date.slice(5)),
          axisLabel: { color: '#6B7C93' },
          axisLine: { lineStyle: { color: '#A1A8C1' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#6B7C93' },
          splitLine: { lineStyle: { color: '#E3E0DB' } },
          axisLine: { lineStyle: { color: '#A1A8C1' } }
        },
        series: [
          {
            name: 'Active Users', type: 'bar', data: weeklyData.map(i => i.activeUsers), itemStyle: { color: '#83B59D' }
          },
          {
            name: 'Number of posts', type: 'bar', data: weeklyData.map(i => i.postCount), itemStyle: { color: '#6B8EB2' }
          },
          {
            name: 'Number of comments', type: 'line', data: weeklyData.map(i => i.commentCount),
            smooth: true, lineStyle: { color: '#B28E8E', width: 3 }, itemStyle: { color: '#B28E8E' }
          }
        ]
      })
    }

    if (registrationChartRef.value) {
      registrationChart = echarts.init(registrationChartRef.value)
      registrationChart.setOption({
        title: {
          text: 'Trends In User Registration',
          left: 'center',
          textStyle: { color: '#6B7C93', fontWeight: 'normal', fontSize: 16 }
        },
        tooltip: { trigger: 'axis' },
        legend: { data: ['Registered User', 'Active Users'], bottom: '0%', textStyle: { color: '#6B7C93' } },
        xAxis: {
          type: 'category',
          data: monthlyData.map(i => i.month),
          axisLabel: { color: '#6B7C93' },
          axisLine: { lineStyle: { color: '#A1A8C1' } }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#6B7C93' },
          splitLine: { lineStyle: { color: '#E3E0DB' } },
          axisLine: { lineStyle: { color: '#A1A8C1' } }
        },
        series: [
          {
            name: 'Registered User',
            type: 'line',
            data: monthlyData.map(i => i.registeredUsers),
            smooth: true,
            lineStyle: { color: '#83B59D', width: 3 },
            itemStyle: { color: '#83B59D' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(131, 181, 157, 0.5)' },
                  { offset: 1, color: 'rgba(131, 181, 157, 0.1)' }
                ]
              }
            }
          },
          {
            name: 'Active Users',
            type: 'line',
            data: monthlyData.map(i => i.activeUsers),
            smooth: true,
            lineStyle: { color: '#6B8EB2', width: 3 },
            itemStyle: { color: '#6B8EB2' }
          }
        ]
      })
    }
  })
}

onMounted(async () => {
  try {
    const statRes = await getStatistics()
    statistics.value = {
      totalUsers: statRes.totalUsers,
      activeUsers: statRes.activeUsers,
      userGrowthRate: statRes.userGrowthPercent,
      totalPosts: statRes.totalPosts,
      postGrowthRate: statRes.postGrowthPercent,
      totalComments: statRes.totalComments,
      commentGrowthRate: statRes.commentGrowthPercent
    }
    todayVisits.value = statRes.visitToday
    todayPosts.value = statRes.newPostsToday
    todayComments.value = statRes.newCommentsToday

    const [weeklyRes, monthlyRes] = await Promise.all([
      getWeeklyActivity(),
      getMonthlyRegistration()
    ])

    initCharts(weeklyRes, monthlyRes)
    window.addEventListener('resize', handleResize)
  } catch (e) {
    ElMessage.error(e.message || '获取统计数据失败')
  }
})

const handleResize = () => {
  if (activityChart) activityChart.resize()
  if (registrationChart) registrationChart.resize()
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (activityChart) activityChart.dispose()
  if (registrationChart) registrationChart.dispose()
})
</script>


<style scoped>
.morandi-table :deep(.el-table__header) {
  background-color: #F8FAFC;
}

.morandi-table :deep(.el-table__row:hover > td) {
  background-color: #F0F4F8 !important;
}

.morandi-table :deep(.el-table__row) {
  transition: all 0.3s;
}

/* 确保图表容器正确显示 */
.echarts-container {
  width: 100%;
  height: 100%;
}
</style>