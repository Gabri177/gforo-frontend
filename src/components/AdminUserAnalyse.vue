<template>
  <div>
    <!-- 数据概览卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 用户统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">总用户数</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalUsers }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#E6F0EB]">
            <el-icon class="text-[#83B59D]" :size="28"><User /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#83B59D] font-medium">↑ {{ statistics.userGrowthRate }}%</span> 较上月增长
        </div>
        <div class="mt-3 h-1 w-full bg-[#E3E0DB] rounded-full overflow-hidden">
          <div class="h-full bg-[#83B59D] rounded-full" :style="{width: `${Math.min(statistics.userGrowthRate * 5, 100)}%`}"></div>
        </div>
      </div>

      <!-- 帖子统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">总帖子数</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalPosts }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#E6EDF5]">
            <el-icon class="text-[#6B8EB2]" :size="28"><Document /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#6B8EB2] font-medium">↑ {{ statistics.postGrowthRate }}%</span> 较上月增长
        </div>
        <div class="mt-3 h-1 w-full bg-[#E3E0DB] rounded-full overflow-hidden">
          <div class="h-full bg-[#6B8EB2] rounded-full" :style="{width: `${Math.min(statistics.postGrowthRate * 5, 100)}%`}"></div>
        </div>
      </div>

      <!-- 评论统计卡片 -->
      <div class="p-6 border border-[#C1B8A8] rounded-xl bg-[#F8FAFC] shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-[#6B7C93]">总评论数</h4>
            <p class="text-3xl font-bold text-[#4A4A4A] mt-2">{{ statistics.totalComments }}</p>
          </div>
          <div class="w-12 h-12 flex items-center justify-center rounded-full bg-[#F0E9E9]">
            <el-icon class="text-[#B28E8E]" :size="28"><ChatDotRound /></el-icon>
          </div>
        </div>
        <div class="mt-4 text-sm text-[#8B93B1]">
          <span class="text-[#B28E8E] font-medium">↑ {{ statistics.commentGrowthRate }}%</span> 较上月增长
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
            <p class="text-sm text-[#8B93B1]">活跃用户</p>
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
            <p class="text-sm text-[#8B93B1]">今日访问</p>
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
            <p class="text-sm text-[#8B93B1]">今日新帖</p>
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
            <p class="text-sm text-[#8B93B1]">今日评论</p>
            <p class="text-xl font-bold text-[#4A4A4A]">{{ todayComments }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 活跃度图表 -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">用户活跃度</h3>
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white" style="height: 400px;">
        <div ref="activityChartRef" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 注册趋势图表 -->
    <div>
      <h3 class="text-xl font-semibold text-[#6B7C93] mb-4">用户注册趋势</h3>
      <div class="p-4 border border-[#C1B8A8] rounded-xl bg-white" style="height: 400px;">
        <div ref="registrationChartRef" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue'
import { User, Document, ChatDotRound, UserFilled, View, DocumentAdd, ChatLineRound } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 属性定义
const props = defineProps({
  statistics: {
    type: Object,
    default: () => ({
      totalUsers: 0,
      activeUsers: 0,
      userGrowthRate: 0,
      totalPosts: 0,
      postGrowthRate: 0,
      totalComments: 0,
      commentGrowthRate: 0
    })
  }
})

// 今日数据（模拟数据）
const todayVisits = ref(Math.floor(Math.random() * 500) + 100)
const todayPosts = ref(Math.floor(Math.random() * 50) + 5)
const todayComments = ref(Math.floor(Math.random() * 100) + 20)

// 图表引用
const activityChartRef = ref(null)
const registrationChartRef = ref(null)

// 图表实例
let activityChart = null
let registrationChart = null

// 初始化图表
const initCharts = () => {
  // 确保DOM已经渲染完成
  nextTick(() => {
    // 初始化活跃度图表
    if (activityChartRef.value) {
      activityChart = echarts.init(activityChartRef.value, null, {
        renderer: 'canvas',
        useDirtyRect: false
      });
      const activityOption = {
        title: {
          text: '用户活跃度统计',
          left: 'center',
          textStyle: {
            color: '#6B7C93',
            fontWeight: 'normal',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#C1B8A8',
          borderWidth: 1,
          textStyle: {
            color: '#4A4A4A'
          }
        },
        legend: {
          data: ['活跃用户', '发帖数', '评论数'],
          bottom: '0%',
          textStyle: {
            color: '#6B7C93'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: {
            lineStyle: {
              color: '#A1A8C1'
            }
          },
          axisLabel: {
            color: '#6B7C93'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#A1A8C1'
            }
          },
          axisLabel: {
            color: '#6B7C93'
          },
          splitLine: {
            lineStyle: {
              color: '#E3E0DB'
            }
          }
        },
        series: [
          {
            name: '活跃用户',
            type: 'bar',
            data: [120, 200, 150, 80, 70, 110, 130],
            itemStyle: {
              color: '#83B59D'
            }
          },
          {
            name: '发帖数',
            type: 'bar',
            data: [60, 80, 100, 40, 35, 55, 65],
            itemStyle: {
              color: '#6B8EB2'
            }
          },
          {
            name: '评论数',
            type: 'line',
            data: [90, 120, 140, 60, 50, 80, 100],
            smooth: true,
            symbolSize: 8,
            lineStyle: {
              color: '#B28E8E',
              width: 3
            },
            itemStyle: {
              color: '#B28E8E'
            }
          }
        ]
      }
      activityChart.setOption(activityOption);
      activityChart.resize(); // 强制调整大小
    }

    // 初始化注册趋势图表
    if (registrationChartRef.value) {
      registrationChart = echarts.init(registrationChartRef.value, null, {
        renderer: 'canvas',
        useDirtyRect: false
      });
      const registrationOption = {
        title: {
          text: '用户注册趋势',
          left: 'center',
          textStyle: {
            color: '#6B7C93',
            fontWeight: 'normal',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#C1B8A8',
          borderWidth: 1,
          textStyle: {
            color: '#4A4A4A'
          }
        },
        legend: {
          data: ['注册用户', '活跃用户'],
          bottom: '0%',
          textStyle: {
            color: '#6B7C93'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
          axisLine: {
            lineStyle: {
              color: '#A1A8C1'
            }
          },
          axisLabel: {
            color: '#6B7C93'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#A1A8C1'
            }
          },
          axisLabel: {
            color: '#6B7C93'
          },
          splitLine: {
            lineStyle: {
              color: '#E3E0DB'
            }
          }
        },
        series: [
          {
            name: '注册用户',
            type: 'line',
            data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
            smooth: true,
            lineStyle: {
              color: '#83B59D',
              width: 3
            },
            itemStyle: {
              color: '#83B59D'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(131, 181, 157, 0.5)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(131, 181, 157, 0.1)'
                  }
                ]
              }
            }
          },
          {
            name: '活跃用户',
            type: 'line',
            data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
            smooth: true,
            lineStyle: {
              color: '#6B8EB2',
              width: 3
            },
            itemStyle: {
              color: '#6B8EB2'
            }
          }
        ]
      }
      registrationChart.setOption(registrationOption)
    }
  });
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (activityChart) {
    activityChart.resize();
  }
  if (registrationChart) {
    registrationChart.resize();
  }
}

onMounted(() => {
  // 延迟初始化，确保DOM已完全渲染
  setTimeout(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  }, 300);
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (activityChart) {
    activityChart.dispose()
    activityChart = null
  }
  if (registrationChart) {
    registrationChart.dispose()
    registrationChart = null
  }
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