<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">公告管理</h3>
      <div class="flex space-x-2">
        <el-input
          v-model="searchQuery"
          placeholder="搜索公告"
          class="w-64 morandi-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="morandi-button" @click="handleCreateClick">
          <el-icon class="mr-1"><Plus /></el-icon>新建公告
        </el-button>
      </div>
    </div>

    <!-- 公告表格 -->
    <el-table
      :data="filteredAnnouncements"
      style="width: 100%"
      border
      stripe
      class="morandi-table"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="content" label="内容" min-width="250">
        <template #default="scope">
          <div class="truncate-text">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
            {{ scope.row.status === '1' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100">
        <template #default="scope">
          <el-rate
            v-model="scope.row.priority"
            disabled
            text-color="#A1A8C1"
            score-template="{value}"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            size="small"
            class="morandi-view-btn mr-2"
            @click="handleEditAnnouncement(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="small"
            class="morandi-disable-btn"
            @click="handleDeleteAnnouncement(scope.row)"
          >
            删除
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

    <!-- 公告编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公告' : '新建公告'"
      width="700px"
      class="morandi-dialog"
      append-to-body
    >
      <el-form :model="announcementForm" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="announcementForm.status">
            <el-radio label="0">草稿</el-radio>
            <el-radio label="1">发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="announcementForm.priority" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="dialogVisible = false">取消</el-button>
          <el-button class="morandi-confirm-btn" @click="submitForm" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认删除"
      width="400px"
      class="morandi-dialog"
      append-to-body
    >
      <div class="text-[#4A4A4A]">
        确定要删除公告 "{{ selectedAnnouncement?.title }}" 吗？此操作不可恢复。
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
          <el-button class="morandi-disable-btn" @click="confirmDelete" :loading="deleteLoading">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

// 定义属性和事件
const props = defineProps({
  announcements: {
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
  'fetch-announcements',
  'size-change',
  'current-change',
  'create-announcement',
  'update-announcement',
  'delete-announcement'
])

// 本地状态
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const isEdit = ref(false)
const selectedAnnouncement = ref(null)
const submitLoading = ref(false)
const deleteLoading = ref(false)
const formRef = ref(null)

// 表单数据
const announcementForm = ref({
  title: '',
  content: '',
  status: '0',
  priority: 0
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度应在 2 到 50 个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '内容长度应在 5 到 2000 个字符之间', trigger: 'blur' }
  ]
}

// 过滤公告列表
const filteredAnnouncements = computed(() => {
  if (!searchQuery.value) return props.announcements
  
  const query = searchQuery.value.toLowerCase()
  return props.announcements.filter(announcement => 
    announcement.title.toLowerCase().includes(query) || 
    announcement.content.toLowerCase().includes(query)
  )
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

// 处理创建公告点击
function handleCreateClick() {
  isEdit.value = false
  announcementForm.value = {
    title: '',
    content: '',
    status: '0',
    priority: 0
  }
  dialogVisible.value = true
}

// 处理编辑公告
function handleEditAnnouncement(announcement) {
  isEdit.value = true
  selectedAnnouncement.value = announcement
  announcementForm.value = {
    title: announcement.title,
    content: announcement.content,
    status: announcement.status,
    priority: announcement.priority
  }
  dialogVisible.value = true
}

// 处理删除公告
function handleDeleteAnnouncement(announcement) {
  selectedAnnouncement.value = announcement
  confirmDialogVisible.value = true
}

// 确认删除
async function confirmDelete() {
  if (!selectedAnnouncement.value) return
  
  deleteLoading.value = true
  try {
    emit('delete-announcement', selectedAnnouncement.value.id)
    confirmDialogVisible.value = false
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    deleteLoading.value = false
  }
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑模式
          emit('update-announcement', selectedAnnouncement.value.id, announcementForm.value)
        } else {
          // 创建模式
          emit('create-announcement', announcementForm.value)
        }
        dialogVisible.value = false
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    } else {
      return false
    }
  })
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

/* 单选按钮样式 */
:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #A1B5A1;
}

:deep(.el-radio__inner:hover) {
  border-color: #A1B5A1;
}

/* 评分组件样式 */
:deep(.el-rate__icon) {
  font-size: 18px;
  margin-right: 4px;
}

:deep(.el-rate__icon.hover) {
  transform: scale(1.1);
}

:deep(.el-rate__decimal) {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  overflow: hidden;
}

:deep(.el-rate__text) {
  font-size: 14px;
  vertical-align: middle;
  color: #6B7C93;
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