<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">用户列表</h3>
      <div class="flex space-x-2">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户"
          class="w-64 morandi-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="morandi-button" @click="refreshUsers">刷新</el-button>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table
      :data="filteredUsers"
      style="width: 100%"
      border
      stripe
      class="morandi-table"
      v-loading="tableLoading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="nickname" label="昵称" width="120" />
      <el-table-column prop="email" label="邮箱" class-name="email-column" />
      <el-table-column prop="createdAt" label="注册时间" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
            {{ scope.row.status === '1' ? '已激活' : '未激活' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button
            size="small"
            class="morandi-view-btn mr-2"
            @click="handleViewUser(scope.row)"
          >
            查看
          </el-button>
          <el-button
            size="small"
            class="morandi-disable-btn"
            @click="handleDisableUser(scope.row)"
            :disabled="scope.row.status !== '1'"
          >
            禁用
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
        :total="totalUsers"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>
  </div>

  <!-- 用户详情对话框 -->
  <el-dialog 
    v-model="userDetailVisible" 
    title="用户详情" 
    width="500px" 
    class="morandi-dialog"
    append-to-body
  >
    <div v-if="selectedUser" class="user-detail">
      <div class="flex items-center mb-6">
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-[#A1A8C1]">
          <img :src="selectedUser.headerUrl || '/default-avatar.png'" alt="avatar" class="w-full h-full object-cover">
        </div>
        <div class="ml-4">
          <h3 class="text-xl font-bold text-[#4A4A4A]">{{ selectedUser.nickname }}</h3>
          <p class="text-[#6B7C93]">@{{ selectedUser.username }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex">
          <span class="text-[#8B93B1] w-24">用户ID:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.id }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">邮箱:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.email }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">注册时间:</span>
          <span class="text-[#4A4A4A]">{{ formatDateToYMD(selectedUser.createdAt) }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">状态:</span>
          <span class="text-[#4A4A4A]">
            <el-tag :type="selectedUser.status === '1' ? 'success' : 'danger'">
              {{ selectedUser.status === '1' ? '已激活' : '未激活' }}
            </el-tag>
          </span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">帖子数:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.postCount || 0 }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">评论数:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.commentCount || 0 }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">个人简介:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.bio || '暂无简介' }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button class="morandi-cancel-btn" @click="userDetailVisible = false">关闭</el-button>
        <el-button class="morandi-disable-btn" @click="handleDisableUser(selectedUser)" :disabled="!selectedUser || selectedUser.status !== '1'">
          禁用账户
        </el-button>
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
      确定要{{ confirmAction === 'disable' ? '禁用' : '启用' }}用户 "{{ selectedUser?.username }}" 吗？
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
        <el-button class="morandi-confirm-btn" @click="confirmOperation" :loading="operationLoading">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

// 定义属性和事件
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  tableLoading: {
    type: Boolean,
    default: false
  },
  totalUsers: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['fetch-users', 'size-change', 'current-change', 'disable-user'])

// 本地状态
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedUser = ref(null)
const userDetailVisible = ref(false)
const confirmDialogVisible = ref(false)
const confirmAction = ref('')
const operationLoading = ref(false)

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return props.users
  
  const query = searchQuery.value.toLowerCase()
  return props.users.filter(user => 
    user.username.toLowerCase().includes(query) || 
    user.nickname.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
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

// 用户操作
function handleViewUser(user) {
  selectedUser.value = user
  userDetailVisible.value = true
}

function handleDisableUser(user) {
  selectedUser.value = user
  confirmAction.value = 'disable'
  confirmDialogVisible.value = true
}

function refreshUsers() {
  emit('fetch-users')
}

function handleSizeChange(size) {
  pageSize.value = size
  emit('size-change', size)
}

function handleCurrentChange(page) {
  currentPage.value = page
  emit('current-change', page)
}

async function confirmOperation() {
  operationLoading.value = true
  try {
    // 发出禁用用户事件
    emit('disable-user', selectedUser.value.id, confirmAction.value)
    
    // 更新本地数据
    if (confirmAction.value === 'disable') {
      if (selectedUser.value) {
        selectedUser.value.status = '0'
      }
	  console.log("banded")
      //ElMessage.success('用户已禁用')
    } else {
      if (selectedUser.value) {
        selectedUser.value.status = '1'
      }
      ElMessage.success('用户已启用')
    }
    
    confirmDialogVisible.value = false
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    operationLoading.value = false
  }
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
.morandi-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #E3E0DB;
  padding-bottom: 15px;
}

.morandi-dialog :deep(.el-dialog__title) {
  color: #6B7C93;
  font-weight: 600;
}

.morandi-dialog :deep(.el-dialog__body) {
  padding: 20px;
  color: #4A4A4A;
}

.morandi-dialog :deep(.el-dialog__footer) {
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

:deep(.el-dialog) {
  position: relative !important;
  margin: 15vh auto 50px !important;
  background: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;
  max-width: 90% !important;
}

.morandi-dialog :deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #A1B5C1;
}

/* 美化用户详情样式 */
.user-detail {
  background-color: #FAFBFC;
  border-radius: 8px;
  padding: 16px;
}

.user-detail .flex {
  padding: 8px 0;
  border-bottom: 1px dashed #E3E0DB;
}

.user-detail .flex:last-child {
  border-bottom: none;
}

/* 输入框样式 */
.morandi-input :deep(.el-input__inner) {
  border-color: #C1B8A8;
}

.morandi-input :deep(.el-input__inner:focus) {
  border-color: #A1A8C1;
}

.morandi-input :deep(.el-input__prefix) {
  color: #8B93B1;
}
</style>