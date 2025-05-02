<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">举报管理</h3>
      <div class="flex space-x-2">
        <el-input
          v-model="searchQuery"
          placeholder="搜索举报内容"
          class="w-64 morandi-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="状态筛选" class="w-32">
          <el-option label="全部" value="" />
          <el-option label="待处理" value="待处理" />
          <el-option label="已处理" value="已处理" />
          <el-option label="已忽略" value="已忽略" />
        </el-select>
        <el-select v-model="typeFilter" placeholder="类型筛选" class="w-32">
          <el-option label="全部" value="" />
          <el-option label="帖子" value="帖子" />
          <el-option label="评论" value="评论" />
          <el-option label="用户" value="用户" />
        </el-select>
        <el-button type="primary" class="morandi-button" @click="refreshReports">刷新</el-button>
      </div>
    </div>

    <!-- 举报表格 -->
    <el-table
      :data="filteredReports"
      style="width: 100%"
      border
      stripe
      class="morandi-table"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="reportType" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.reportType)">
            {{ scope.row.reportType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="targetContent" label="举报内容" min-width="200">
        <template #default="scope">
          <div class="truncate-text">{{ scope.row.targetContent }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="举报原因" width="120" />
      <el-table-column prop="reporterName" label="举报人" width="120" />
      <el-table-column prop="createdAt" label="举报时间" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            size="small"
            class="morandi-view-btn mr-2"
            @click="handleViewReport(scope.row)"
          >
            查看
          </el-button>
          <el-button
            v-if="scope.row.status === '待处理'"
            size="small"
            class="morandi-disable-btn"
            @click="handleIgnoreReport(scope.row)"
          >
            忽略
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-center mt-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 举报详情对话框 -->
    <el-dialog
      v-model="reportDetailVisible"
      title="举报详情"
      width="600px"
      class="morandi-dialog"
      append-to-body
    >
      <div v-if="selectedReport" class="report-detail">
        <div class="p-4 bg-[#F8FAFC] rounded-lg mb-4">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center">
              <el-tag :type="getTypeTagType(selectedReport.reportType)" class="mr-2">
                {{ selectedReport.reportType }}
              </el-tag>
              <span class="text-[#6B7C93] text-sm">ID: {{ selectedReport.targetId }}</span>
            </div>
            <el-tag :type="getStatusTagType(selectedReport.status)">
              {{ selectedReport.status }}
            </el-tag>
          </div>
          
          <div class="mb-3">
            <div class="text-[#8B93B1] text-sm mb-1">举报内容：</div>
            <div class="p-3 bg-white border border-[#E3E0DB] rounded-md text-[#4A4A4A]">
              {{ selectedReport.targetContent }}
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">举报原因：</div>
              <div class="text-[#4A4A4A]">{{ selectedReport.reason }}</div>
            </div>
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">举报时间：</div>
              <div class="text-[#4A4A4A]">{{ formatDateToYMD(selectedReport.createdAt) }}</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">举报人：</div>
              <div class="text-[#4A4A4A]">{{ selectedReport.reporterName }}</div>
            </div>
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">举报人ID：</div>
              <div class="text-[#4A4A4A]">{{ selectedReport.reporterId }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="selectedReport.status === '待处理'">
          <div class="text-[#8B93B1] text-sm mb-2">处理意见：</div>
          <el-input
            v-model="handleOpinion"
            type="textarea"
            :rows="3"
            placeholder="请输入处理意见..."
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="reportDetailVisible = false">关闭</el-button>
          <template v-if="selectedReport && selectedReport.status === '待处理'">
            <el-button class="morandi-disable-btn" @click="handleIgnoreConfirm">忽略举报</el-button>
            <el-button class="morandi-confirm-btn" @click="handleApproveConfirm">处理举报</el-button>
          </template>
        </span>
      </template>
    </el-dialog>

    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认操作"
      width="400px"
      class="morandi-dialog"
      append-to-body
    >
      <div class="text-[#4A4A4A]">
        确定要{{ confirmAction === 'approve' ? '处理' : '忽略' }}此举报吗？
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
          <el-button class="morandi-confirm-btn" @click="confirmOperation" :loading="operationLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 定义属性和事件
const props = defineProps({
  reports: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'fetch-reports',
  'size-change',
  'current-change',
  'handle-report'
])

// 本地状态
const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const reportDetailVisible = ref(false)
const confirmDialogVisible = ref(false)
const selectedReport = ref(null)
const confirmAction = ref('')
const operationLoading = ref(false)
const handleOpinion = ref('')

// 过滤举报列表
const filteredReports = computed(() => {
  let result = props.reports
  
  // 状态筛选
  if (statusFilter.value) {
    result = result.filter(report => report.status === statusFilter.value)
  }
  
  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(report => report.reportType === typeFilter.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(report => 
      report.targetContent.toLowerCase().includes(query) || 
      report.reason.toLowerCase().includes(query) || 
      report.reporterName.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 格式化日期
function formatDateToYMD(dateString) {
  if (!dateString) return '未知'
  
  const parts = dateString.split(" ") // ["Sun", "Mar", "23", "22:48:09", "CET", "2025"]

  const monthMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  }

  const day = parts[2]
  const month = monthMap[parts[1]]
  const year = parts[5]

  if (!month) {
    console.warn("月份无法解析:", parts[1])
    return '未知'
  }

  return `${year}-${month}-${day.padStart(2, '0')}`
}

// 获取类型标签样式
function getTypeTagType(type) {
  switch (type) {
    case '帖子': return 'info'
    case '评论': return 'warning'
    case '用户': return 'danger'
    default: return 'info'
  }
}

// 获取状态标签样式
function getStatusTagType(status) {
  switch (status) {
    case '待处理': return 'warning'
    case '已处理': return 'success'
    case '已忽略': return 'info'
    default: return 'info'
  }
}

// 查看举报详情
function handleViewReport(report) {
  selectedReport.value = report
  handleOpinion.value = ''
  reportDetailVisible.value = true
}

// 忽略举报
function handleIgnoreReport(report) {
  selectedReport.value = report
  confirmAction.value = 'ignore'
  confirmDialogVisible.value = true
}

// 处理举报确认
function handleApproveConfirm() {
  confirmAction.value = 'approve'
  confirmDialogVisible.value = true
  reportDetailVisible.value = false
}

// 忽略举报确认
function handleIgnoreConfirm() {
  confirmAction.value = 'ignore'
  confirmDialogVisible.value = true
  reportDetailVisible.value = false
}

// 确认操作
async function confirmOperation() {
  operationLoading.value = true
  try {
    // 发出处理举报事件
    emit('handle-report', selectedReport.value.id, confirmAction.value, handleOpinion.value)
    
    // 更新本地数据
    if (confirmAction.value === 'approve') {
      ElMessage.success('举报已处理')
    } else {
      ElMessage.success('举报已忽略')
    }
    
    confirmDialogVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    operationLoading.value = false
  }
}

// 刷新举报列表
function refreshReports() {
  emit('fetch-reports')
}

// 分页处理
function handleSizeChange(size) {
  emit('size-change', size)
}

function handleCurrentChange(page) {
  emit('current-change', page)
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

.morandi-view-btn:hover, .morandi-view-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-view-btn:active, .morandi-view-btn.is-active {
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

.morandi-disable-btn:hover, .morandi-disable-btn:focus {
  background-color: #B28E8E;
  border-color: #B28E8E;
  color: #FFFFFF;
}

.morandi-disable-btn:active, .morandi-disable-btn.is-active {
  background-color: #A37A7A;
  border-color: #A37A7A;
  color: #FFFFFF;
}

.morandi-cancel-btn {
  background-color: #E3E0DB;
  border-color: #C1B8A8;
  color: #6B7C93;
  transition: all 0.3s ease;
}

.morandi-cancel-btn:hover, .morandi-cancel-btn:focus {
  background-color: #D5D0C8;
  border-color: #B3A99A;
  color: #4A5A70;
}

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-confirm-btn:hover, .morandi-confirm-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-confirm-btn:active, .morandi-confirm-btn.is-active {
  background-color: #7A957A;
  border-color: #7A957A;
  color: #FFFFFF;
}

/* 内容截断 */
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

/* 表格样式优化 */
.morandi-table :deep(.el-table__header) {
  background-color: #F8FAFC;
}

.morandi-table :deep(.el-table__row:hover > td) {
  background-color: #F0F4F8 !important;
}

.morandi-table :deep(.el-table__row) {
  transition: all 0.3s;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #E3E0DB;
  padding-bottom: 15px;
}

:deep(.el-dialog__title) {
  color: #6B7C93;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 20px;
  color: #4A4A4A;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #E3E0DB;
  padding-top: 15px;
}

/* 修复遮罩层问题 */
:deep(.el-overlay) {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  z-index: 2000 !important;
  height: 100% !important;
  width: 100% !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}
</style>