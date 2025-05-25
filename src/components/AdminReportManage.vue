<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">举报管理</h3>
      <el-select v-model="statusFilter" placeholder="状态筛选" class="w-32 morandi-select">
        <el-option label="全部" value="" />
        <el-option label="待处理" value="待处理" />
        <el-option label="已处理" value="已处理" />
        <el-option label="已忽略" value="已忽略" />
      </el-select>
    </div>

    <el-table
        :data="filteredReports"
        style="width: 100%"
        border
        stripe
        class="morandi-table"
        v-loading="loading"
    >
      <el-table-column label="举报内容" min-width="200">
        <template #default="scope">
          <el-tooltip effect="dark" :content="scope.row.targetContent" placement="top">
            <div class="morandi-link morandi-truncate" @click="jumpToTarget(scope.row)">
              {{ scope.row.targetContent }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="reportType" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.reportType)">
            {{ scope.row.reportType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="举报原因" width="120">
        <template #default="scope">
          <el-tooltip effect="dark" :content="scope.row.reason" placement="top">
            <div class="morandi-truncate">
              {{ scope.row.reason }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="reporterName" label="举报人" width="120" >
        <template #default="scope">
          <UserInfoCard :user="scope.row.reporterInfo" />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="举报时间" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <template v-if="scope.row.status === '待处理'">
            <el-button size="small" type="primary" class="morandi-view-btn" @click="handleApprove(scope.row)">处理</el-button>
            <el-button size="small" type="info" @click="handleIgnore(scope.row)">忽略</el-button>
          </template>
          <template v-else>
            <span class="text-gray-400">不可操作</span>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-4">
      <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'approve' ? '处理举报' : '忽略举报'" width="500px"
               align-center append-to-body>
      <div class="mb-3 text-[#4A4A4A]">请输入{{ dialogMode === 'approve' ? '处理意见' : '忽略理由' }}：</div>
      <el-input v-model="handleOpinion" type="textarea" :rows="4" placeholder="请输入..." />

      <template #footer>
        <el-button @click="dialogVisible = false" class="morandi-disable-btn">取消</el-button>
        <el-button type="primary" class="morandi-confirm-btn" @click="confirmHandle">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAllReport, handleReport } from '~/api/reportApi.js'
import { getCommentLocation } from '~/api/commentApi.js'
import UserInfoCard from '@/tools/UserInfoCard.vue'

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const reports = ref([])
const loading = ref(false)
const total = ref(0)

const router = useRouter()
const dialogVisible = ref(false)
const dialogMode = ref('')
const dialogTargetReport = ref(null)
const handleOpinion = ref('')

watch(statusFilter, () => {
  currentPage.value = 1
  fetchReports()
})

const fetchReports = async () => {
  loading.value = true
  try {
    let backendStatus = null
    switch (statusFilter.value) {
      case '待处理': backendStatus = 3; break
      case '已处理': backendStatus = 4; break
      case '已忽略': backendStatus = 5; break
    }
    const res = await getAllReport(currentPage.value, pageSize.value, backendStatus)
    console.log('reports', res)
    reports.value = res.reports.map(item => ({
      ...item,
      reportType: getReportTypeLabel(item.entityType),
      status: getStatusLabel(item.status),
      reporterName: item.reporterInfo?.nickname || item.reporterInfo?.username || `用户${item.reporterId}`,
      targetContent: item.entityType === 1 ? item.post?.title : item.comment?.content
    }))
    total.value = res.totalRows
  } catch (err) {
    ElMessage.error(err.message || '获取举报列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReports)

const filteredReports = computed(() => {
  return reports.value
})

function handleSizeChange(val) {
  pageSize.value = val
  currentPage.value = 1
  fetchReports()
}

function handleCurrentChange(val) {
  currentPage.value = val
  fetchReports()
}

function handleApprove(report) {
  dialogMode.value = 'approve'
  dialogTargetReport.value = report
  handleOpinion.value = ''
  dialogVisible.value = true
}

function handleIgnore(report) {
  dialogMode.value = 'ignore'
  dialogTargetReport.value = report
  handleOpinion.value = ''
  dialogVisible.value = true
}

async function confirmHandle() {
  const isApproved = dialogMode.value === 'approve'
  try {
    await handleReport(dialogTargetReport.value.id, isApproved, handleOpinion.value)
    ElMessage.success(isApproved ? '处理成功' : '已忽略举报')
    dialogVisible.value = false
    fetchReports()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

function getReportTypeLabel(type) {
  switch (type) {
    case 1: return '帖子'
    case 2: return '评论'
    default: return '未知类型'
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 3: return '待处理'
    case 4: return '已处理'
    case 5: return '已忽略'
    default: return '未知状态'
  }
}

function getTypeTagType(type) {
  switch (type) {
    case '帖子': return 'info'
    case '评论': return 'warning'
    case '用户': return 'danger'
    default: return 'info'
  }
}

function getStatusTagType(status) {
  switch (status) {
    case '待处理': return 'warning'
    case '已处理': return 'success'
    case '已忽略': return 'info'
    default: return 'info'
  }
}

function formatDateToYMD(datetime) {
  if (!datetime) return '未知'
  const date = new Date(datetime)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function jumpToTarget(report) {
  if (report.entityType === 1) {
    router.push(`/board/${report.post.boardId}/post/${report.post.id}/1`)
  } else if (report.entityType === 2) {
    handleToComment(report.post.boardId, report.comment.postId, report.comment.id)
  } else {
    ElMessage.error('无法跳转到目标内容')
  }
}

const handleToComment = async (boardId, postId, commentId) => {
  try {
    const res = await getCommentLocation(commentId)
    goToLocation(boardId, postId, res.page, res.entityId, res.targetId, res.isPostFloor)
  } catch (e) {
    ElMessage.error('The comment has been deleted !')
  }
}

const goToLocation = (boardId, postId, page, entityId, targetId, isPostFloor) => {
  router.push(`/board/${boardId}/post/${postId}/${page}/location/${entityId}/${targetId}/${isPostFloor}`)
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


/* 莫兰迪风格标签 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-tag--success) {
  background-color: #E8F0EB;
  border-color: #83B59D;
  color: #5C8D75;
}

:deep(.el-tag--success:hover) {
  background-color: #D5E5DD;
  border-color: #6FA189;
  color: #5C8D75;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-tag--danger) {
  background-color: #F0E8E8;
  border-color: #A87A7A;
  color: #845C5C;
}

:deep(.el-tag--danger:hover) {
  background-color: #E5D5D5;
  border-color: #946B6B;
  color: #845C5C;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 添加其他可能用到的标签样式 */
:deep(.el-tag--warning) {
  background-color: #F0EDE8;
  border-color: #C1B8A8;
  color: #8B7C6B;
}

:deep(.el-tag--warning:hover) {
  background-color: #E5E0D5;
  border-color: #B1A89A;
  color: #8B7C6B;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-tag--info) {
  background-color: #E8EBF0;
  border-color: #A1A8C1;
  color: #6B7C93;
}

:deep(.el-tag--info:hover) {
  background-color: #D5DDE5;
  border-color: #8B93B1;
  color: #6B7C93;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.morandi-select :deep(.el-input__inner) {
  background-color: #F2F0EB;
  border: 1px solid #C1B8A8;
  color: #6B7C93;
  border-radius: 8px;
  padding: 6px 12px;
  transition: all 0.3s ease;
}

.morandi-select :deep(.el-input__inner:hover) {
  background-color: #E5E3DD;
  color: #4A4A4A;
}

.morandi-link {
  color: #6B7C93;
  font-weight: 500;
  transition: color 0.3s ease;
}

.morandi-link:hover {
  color: #4A5568;
  text-decoration: underline;
}

.morandi-truncate {
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>