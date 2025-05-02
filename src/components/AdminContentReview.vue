<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">内容审核</h3>
      <div class="flex space-x-2">
        <el-input
          v-model="searchQuery"
          placeholder="搜索内容"
          class="w-64 morandi-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="typeFilter" placeholder="类型筛选" class="w-32">
          <el-option label="全部" value="" />
          <el-option label="帖子" value="帖子" />
          <el-option label="评论" value="评论" />
        </el-select>
        <el-button type="primary" class="morandi-button" @click="refreshContents">刷新</el-button>
      </div>
    </div>

    <!-- 内容表格 -->
    <el-table
      :data="filteredContents"
      style="width: 100%"
      border
      stripe
      class="morandi-table"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.type === '帖子' ? 'success' : 'info'">
            {{ scope.row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="150">
        <template #default="scope">
          <div v-if="scope.row.title">{{ scope.row.title }}</div>
          <div v-else class="text-[#8B93B1] italic">无标题</div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="200">
        <template #default="scope">
          <div class="truncate-text">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="authorName" label="作者" width="120" />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            size="small"
            class="morandi-view-btn mr-2"
            @click="handleViewContent(scope.row)"
          >
            查看
          </el-button>
          <el-button
            size="small"
            class="morandi-disable-btn"
            @click="handleRejectContent(scope.row)"
          >
            拒绝
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

    <!-- 内容详情对话框 -->
    <el-dialog
      v-model="contentDetailVisible"
      title="内容详情"
      width="600px"
      class="morandi-dialog"
      append-to-body
    >
      <div v-if="selectedContent" class="content-detail">
        <div class="p-4 bg-[#F8FAFC] rounded-lg mb-4">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center">
              <el-tag :type="selectedContent.type === '帖子' ? 'success' : 'info'" class="mr-2">
                {{ selectedContent.type }}
              </el-tag>
              <span class="text-[#6B7C93] text-sm">ID: {{ selectedContent.id }}</span>
            </div>
            <span class="text-[#8B93B1] text-sm">{{ formatDateToYMD(selectedContent.createdAt) }}</span>
          </div>
          
          <div v-if="selectedContent.title" class="mb-3">
            <div class="text-[#8B93B1] text-sm mb-1">标题：</div>
            <div class="p-3 bg-white border border-[#E3E0DB] rounded-md text-[#4A4A4A] font-medium">
              {{ selectedContent.title }}
            </div>
          </div>
          
          <div class="mb-3">
            <div class="text-[#8B93B1] text-sm mb-1">内容：</div>
            <div class="p-3 bg-white border border-[#E3E0DB] rounded-md text-[#4A4A4A] whitespace-pre-wrap">
              {{ selectedContent.content }}
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">作者：</div>
              <div class="text-[#4A4A4A]">{{ selectedContent.authorName }}</div>
            </div>
            <div>
              <div class="text-[#8B93B1] text-sm mb-1">作者ID：</div>
              <div class="text-[#4A4A4A]">{{ selectedContent.authorId }}</div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="contentDetailVisible = false">关闭</el-button>
          <el-button class="morandi-disable-btn" @click="handleRejectConfirm">拒绝</el-button>
          <el-button class="morandi-confirm-btn" @click="handleApproveConfirm">通过</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝原因"
      width="500px"
      class="morandi-dialog"
      append-to-body
    >
      <div class="reject-reason">
        <el-form :model="rejectForm" label-width="80px" :rules="rules" ref="rejectFormRef">
          <el-form-item label="拒绝原因" prop="reason">
            <el-select v-model="rejectForm.reason" placeholder="请选择拒绝原因" class="w-full">
              <el-option label="垃圾广告" value="垃圾广告" />
              <el-option label="政治敏感" value="政治敏感" />
              <el-option label="色情内容" value="色情内容" />
              <el-option label="暴力内容" value="暴力内容" />
              <el-option label="侮辱他人" value="侮辱他人" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明" prop="comment">
            <el-input
              v-model="rejectForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入详细说明..."
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="rejectDialogVisible = false">取消</el-button>
          <el-button class="morandi-disable-btn" @click="confirmReject" :loading="operationLoading">确认拒绝</el-button>
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
        确定要通过此内容吗？
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
          <el-button class="morandi-confirm-btn" @click="confirmApprove" :loading="operationLoading">确认</el-button>
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
  contents: {
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
  'fetch-contents',
  'size-change',
  'current-change',
  'approve-content',
  'reject-content'
])

// 本地状态
const searchQuery = ref('')
const typeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const contentDetailVisible = ref(false)
const rejectDialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const selectedContent = ref(null)
const operationLoading = ref(false)
const rejectFormRef = ref(null)

// 拒绝表单
const rejectForm = ref({
  reason: '',
  comment: ''
})

// 表单验证规则
const rules = {
  reason: [
    { required: true, message: '请选择拒绝原因', trigger: 'change' }
  ],
  comment: [
    { max: 200, message: '详细说明不能超过200个字符', trigger: 'blur' }
  ]
}

// 过滤内容列表
const filteredContents = computed(() => {
  let result = props.contents
  
  // 类型筛选
  if (typeFilter.value) {
    result = result.filter(content => content.type === typeFilter.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(content => 
      (content.title && content.title.toLowerCase().includes(query)) || 
      content.content.toLowerCase().includes(query) ||
      content.authorName.toLowerCase().includes(query)
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

// 查看内容详情
function handleViewContent(content) {
  selectedContent.value = content
  contentDetailVisible.value = true
}

// 拒绝内容
function handleRejectContent(content) {
  selectedContent.value = content
  rejectForm.value = {
    reason: '',
    comment: ''
  }
  rejectDialogVisible.value = true
}

// 处理通过确认
function handleApproveConfirm() {
  confirmDialogVisible.value = true
}

// 处理拒绝确认
function handleRejectConfirm() {
  rejectForm.value = {
    reason: '',
    comment: ''
  }
  rejectDialogVisible.value = true
}

// 确认通过
async function confirmApprove() {
  if (!selectedContent.value) return
  
  operationLoading.value = true
  try {
    emit('approve-content', selectedContent.value.id)
    confirmDialogVisible.value = false
    contentDetailVisible.value = false
    ElMessage.success('内容已通过审核')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    operationLoading.value = false
  }
}

// 确认拒绝
async function confirmReject() {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate(async (valid) => {
    if (valid) {
      operationLoading.value = true
      try {
        emit('reject-content', selectedContent.value.id, rejectForm.value)
        rejectDialogVisible.value = false
        contentDetailVisible.value = false
        ElMessage.success('内容已拒绝')
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      } finally {
        operationLoading.value = false
      }
    } else {
      return false
    }
  })
}

// 刷新内容列表
function refreshContents() {
  emit('fetch-contents')
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size
  emit('size-change', size)
}

function handleCurrentChange(page) {
  currentPage.value = page
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

.morandi-disable-btn:disabled {
  background-color: #E3E0DB;
  border-color: #E3E0DB;
  color: #A1A8C1;
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

.morandi-cancel-btn:active, .morandi-cancel-btn.is-active {
  background-color: #C7C0B6;
  border-color: #A59B8C;
  color: #3A4A60;
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

/* 表单样式 */
:deep(.el-form-item__label) {
  color: #6B7C93;
}

:deep(.el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #C1B8A8;
  box-shadow: none;
}

:deep(.el-input__wrapper:hover) {
  border-color: #A1A8C1;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #A1B5A1;
  box-shadow: 0 0 0 1px rgba(161, 181, 161, 0.2);
}

:deep(.el-textarea__inner) {
  background-color: #F8FAFC;
  border: 1px solid #C1B8A8;
}

:deep(.el-textarea__inner:hover) {
  border-color: #A1A8C1;
}

:deep(.el-textarea__inner:focus) {
  border-color: #A1B5A1;
  box-shadow: 0 0 0 1px rgba(161, 181, 161, 0.2);
}

/* 下拉菜单样式 */
:deep(.el-select .el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #C1B8A8;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #A1A8C1;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #A1B5A1;
  box-shadow: 0 0 0 1px rgba(161, 181, 161, 0.2);
}
</style>