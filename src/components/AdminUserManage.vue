<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">User List</h3>
      <div class="flex space-x-2">
        <el-input v-model="searchQuery" placeholder="Search User" class="w-64 morandi-input" clearable>
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="morandi-button" @click="refreshUsers">Reload</el-button>
      </div>
    </div>

    <!-- 用户表格 -->
    <el-table :data="filteredUsers" style="width: 100%" border stripe class="morandi-table" v-loading="tableLoading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="User Name" width="120" />
      <el-table-column prop="nickname" label="Nick Name" width="120" />
      <el-table-column prop="email" label="Email" class-name="email-column" />
      <el-table-column prop="createTime" label="Create Time" width="180">
        <template #default="scope">
          {{ formatDateToYMD(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="Status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status == '1' ? 'success' : scope.row.status == '2' ? 'warning' : 'danger'">
            {{ scope.row.status == '1' ? 'Enabled' : scope.row.status == '2' ? 'Disabled' : 'Deleted' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Operation" width="200">
        <template #default="scope">

          <el-button size="small" class="morandi-view-btn mr-2" @click="handleViewUser(scope.row)">
            View
          </el-button>
          <el-button size="small" :class="getBtnClass(scope.row.status)" @click="handleChangeUserStatus(scope.row)">
            {{ scope.row.status == '1' ? 'Disable' : scope.row.status == '2' ? 'Enable' : 'Recover' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex justify-center mt-4">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" :total="totalUsers" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" background popper-class="morandi-select-dropdown" />
    </div>
  </div>

  <!-- 用户详情对话框 -->
  <el-dialog v-model="userDetailVisible" title="User details" width="500px" append-to-body :align-center="true"
    @close="selectedUser = []">
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
          <span class="text-[#8B93B1] w-24">User ID:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.id }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Email:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.email }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Create Time:</span>
          <span class="text-[#4A4A4A]">{{ formatDateToYMD(selectedUser.createTime) }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Status:</span>
          <span class="text-[#4A4A4A]">
            <el-tag :type="selectedUser.status == '1' ? 'success' : selectedUser.status == '2' ? 'warning' : 'danger'">
              {{ selectedUser.status == '1' ? 'Enabled' : selectedUser.status == '2' ? 'Disabled' : 'Deleted' }}
            </el-tag>
          </span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Roles:</span>
          <span class="text-[#4A4A4A]">
            <el-checkbox-group v-model="selectedRoles" @change="handleRoleCheckBoxChange">
              <el-checkbox v-for="role in roles" :key="role.name" :label="role.name" border />
            </el-checkbox-group>
          </span>
        </div>
        <div class="flex" v-show="isBoardRoleChecked">
          <span class="text-[#8B93B1] w-24">Boards:</span>
          <span class="text-[#4A4A4A]">
            <el-checkbox-group v-model="selectedBoards" @change="handleBoardCheckBoxChange">
              <el-checkbox v-for="board in boardPosterInfo" :key="board.name" :label="board.name" border />
            </el-checkbox-group>
          </span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Posts:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.postCount || 0 }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Comments:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.commentCount || 0 }}</span>
        </div>
        <div class="flex">
          <span class="text-[#8B93B1] w-24">Bio:</span>
          <span class="text-[#4A4A4A]">{{ selectedUser.bio || 'No introduction yet' }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer flex justify-between">
        <div>
          <el-button class="morandi-disable-btn" @click="handleDeleteUser(selectedUser)"
          :disabled="!selectedUser || selectedUser.status == 0" v-show="authStore.isSuperAdmin" >
          Delete
        </el-button>
        </div>
        <div>
          <el-button class="morandi-orange-btn" @click="userDetailVisible = false;selectedUser = []">Cancel</el-button>
          <el-button class="morandi-view-btn" @click="handleConfirmUserInfo(selectedUser)">Confirm</el-button>
        </div>

      </span>
    </template>
  </el-dialog>

  <!-- 确认对话框 -->
  <el-dialog v-model="confirmDialogVisible" title="Confirm Operation" width="400px" append-to-body :align-center="true">
    <div class="text-[#4A4A4A]">
      Are you sure you want to
      <span class="morandi-highlight">
        {{ confirmAction === 'disable' ? 'disable' : confirmAction === 'delete' ? 'delete' : 'enable' }}
      </span>
      user
      <span class="morandi-highlight">
        "{{ selectedUser?.username }}"
      </span>
      ?
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button class="morandi-disable-btn" @click="confirmDialogVisible = false">Cancel</el-button>
        <el-button class="morandi-confirm-btn" @click="confirmOperation" :loading="operationLoading">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getBoardList } from '~/api/boardApi'
import {
  getUserList,
  changeUserPassword,
  activeUser,
  disableUser,
  deleteUser,
  logoutUser
} from '~/api/adminApi'
import { getRoleDetailList, updateUserRole } from '~/api/permissionApi'
import { useAuthStore } from '~/stores/auth'
const users = ref([])
const tableLoading = ref(false)
const totalUsers = ref(0)
const authStore = useAuthStore()

// 本地状态
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const selectedUser = ref(null)
const userDetailVisible = ref(false)
const confirmDialogVisible = ref(false)
const confirmAction = ref('disable')
const operationLoading = ref(false)
const roles = ref([])
const isBoardRoleChecked = ref(false)
const boardPosterInfo = ref([])
const selectedRoles = ref([])
const selectedBoards = ref([])

const handleRoleCheckBoxChange = (val) => {

  if (val.includes('ROLE_BOARD')) {
    console.log('board role checked')
    isBoardRoleChecked.value = true
  } else {
    console.log('board role unchecked')
    isBoardRoleChecked.value = false
    selectedBoards.value = []
  }
  console.log('checkbox change:', val)
}

const handleBoardCheckBoxChange = (val) => {
  console.log('checkbox change:', val)
}

watch(
  () => selectedUser.value,
  (newUser) => {
    if (newUser?.accessControl?.roles) {
      selectedRoles.value = [...newUser.accessControl.roles]
      handleRoleCheckBoxChange(selectedRoles.value)
    } else {
      selectedRoles.value = []
    }
    if (newUser?.accessControl?.boardIds) {
      selectedBoards.value = boardPosterInfo.value.filter(board => newUser.accessControl.boardIds.includes(board.id)).map(board => board.name)
      console.log('selectedBoards: ', selectedBoards.value)
    } else {
      selectedBoards.value = []
    }
  },
  { immediate: true }
)

function arraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false
  if (arr1.length !== arr2.length) return false
  return arr1.every(item => arr2.includes(item)) && arr2.every(item => arr1.includes(item))
}



const handleConfirmUserInfo = async (curUser) => {

  selectedUser.value = curUser
  console.log('role original value: ', selectedUser.value.accessControl.roles)
  if (!curUser) {
    ElMessage.error('用户信息为空')
    return
  }


  console.log('checkbox group: ', selectedRoles.value)
  if (selectedRoles.value.length == 0) {
    ElMessage.error('请选择用户角色')
    return
  }
  if (selectedRoles.value.includes('ROLE_BOARD') && selectedBoards.value.length == 0) {
    ElMessage.error('请选择用户看板')
    return
  }
  if (arraysEqual(selectedRoles.value, selectedUser.value.accessControl.roles) &&
    arraysEqual(selectedBoards.value, boardPosterInfo.value
      .filter(board => selectedUser.value.accessControl.boardIds.includes(board.id))
      .map(board => board.name)
    )) {
    ElMessage.info('用户角色未发生变化')
    userDetailVisible.value = false;
    selectedUser.value = []
    return 
  }

  try {
    let roleIds = roles.value
    .filter(role => selectedRoles.value.includes(role.name))
    .map(role => role.id)
    console.log('roleIds: ', roleIds)
    let boardIds = boardPosterInfo.value
      .filter(board => selectedBoards.value.includes(board.name))
      .map(board => board.id)
    console.log('boardIds: ', boardIds)
    console.log('selectedUser.value.id: ', selectedUser.value.id)
    await updateUserRole(selectedUser.value.id, roleIds, boardIds)
    users.value = users.value.map(user => {
      if (user.id === selectedUser.value.id) {
        user.accessControl.roles = selectedRoles.value
        user.accessControl.boardIds = boardIds
      }
      return user
    })
    ElMessage.success('用户信息更新成功')
  } catch (error) {
    ElMessage.error('提交失败')
    console.error(error)
  }
  
  
  userDetailVisible.value = false;
  selectedUser.value = []
}


// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    // user.username.toLowerCase().includes(query) ||
    // user.nickname.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const initPage = async (pageNum, limit) => {
  try {
    const res = await getUserList(0, pageNum,
      limit,
      false
    )

    console.log('userList: ', res)
    users.value = res.userInfoList
    totalUsers.value = res.totalRows
    currentPage.value = res.currentPage
    pageSize.value = res.pageSize
    console.log('userList: ', res)
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error(error.message ? error.message : '获取用户列表失败')
  }
}

const fetchRoleData = async () => {
  try {
    const res = await getRoleDetailList()
    console.log('roleList: ', res)
    roles.value = res.roleDetailsList || []
  } catch (e) {
    ElMessage.error('获取权限数据失败')
    console.error(e)
  }
}

const fetchBoardPosterInfo = async () => {
  try {
    const res = await getBoardList()
    boardPosterInfo.value = res.boardInfos
    console.log('boardPosterInfo: ', boardPosterInfo.value)
  } catch (error) {
    console.error('获取板块信息失败:', error)
    ElMessage.error(error.message ? error.message : '获取板块信息失败')
  }
}

onMounted(async () => {

  initPage(currentPage.value, pageSize.value)
  fetchRoleData()
  fetchBoardPosterInfo()
})

// 格式化日期
function formatDateToYMD(dateString) {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '未知'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 用户操作
function handleViewUser(user) {
  console.log("view", user)
  selectedUser.value = user
  userDetailVisible.value = true
}

function handleDeleteUser(user) {
  selectedUser.value = user
  confirmAction.value = 'delete'
  confirmDialogVisible.value = true
}

function handleChangeUserStatus(user) {
  selectedUser.value = user
  confirmAction.value = user.status == 1 ? 'disable' : 'enable'
  confirmDialogVisible.value = true
}

function getBtnClass(status) {
  if (status == 0) return 'morandi-orange-btn'
  if (status == 1) return 'morandi-disable-btn'
  if (status == 2) return 'morandi-button'
  return 'morandi-cancel-btn'
}

function refreshUsers() {
  initPage(currentPage.value, pageSize.value)
}

function handleSizeChange(size) {
  pageSize.value = size
  initPage(currentPage.value, pageSize.value)
}

function handleCurrentChange(page) {
  currentPage.value = page
  initPage(currentPage.value)
}

async function confirmOperation() {
  console.log("selectedUser", selectedUser.value)
  const userStatus = selectedUser.value.status
  console.log("userStatus", userStatus)
  operationLoading.value = true
  try {
    // 发出禁用用户事件
    ////////////////////////////////
    if (confirmAction.value == 'enable')
      await activeUser(selectedUser.value.id)
    else if (confirmAction.value == 'disable')
      await disableUser(selectedUser.value.id)
    else if (confirmAction.value == 'delete')
      await deleteUser(selectedUser.value.id)

    ElMessage.success('操作成功')
    filteredUsers.value.forEach((item, index) => {
      if (item.id == selectedUser.value.id) {
        let newStatus;
        if (confirmAction.value == 'enable')
          newStatus = 1
        else if (confirmAction.value == 'disable')
          newStatus = 2
        else if (confirmAction.value == 'delete')
          newStatus = 0
        filteredUsers.value[index].status = newStatus
      }
    })
    //initPage(currentPage.value, pageSize.value)

    
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(error.message ? error.message : '操作失败')
  } finally {
    userDetailVisible.value = false
    operationLoading.value = false
    confirmDialogVisible.value = false
  }
}
</script>

<style scoped>
.morandi-highlight {
  color: #83B59D;
  font-weight: 600;
}


:deep(.el-dialog) {
  margin: 0 !important;
  top: 50% !important;
  left: 50%;
  transform: translate(-50%, -50%);
}

.morandi-orange-btn {
  background-color: #D8A373;
  /* 主色调：柔和橙 */
  border-color: #D8A373;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-orange-btn:hover,
.morandi-orange-btn:focus {
  background-color: #C68C5E;
  /* hover：偏深橙 */
  border-color: #C68C5E;
  color: #FFFFFF;
}

.morandi-orange-btn:active,
.morandi-orange-btn.is-active {
  background-color: #B07549;
  /* active：低饱和深橙 */
  border-color: #B07549;
  color: #FFFFFF;
}

.morandi-orange-btn:disabled {
  background-color: #EBD8C9;
  /* disabled：淡橙灰 */
  border-color: #EBD8C9;
  color: #A1A8C1;
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

/* 莫兰迪风格按钮样式 */
.morandi-view-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-view-btn:hover,
.morandi-view-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-view-btn:active,
.morandi-view-btn.is-active {
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

.morandi-disable-btn:hover,
.morandi-disable-btn:focus {
  background-color: #B28E8E;
  border-color: #B28E8E;
  color: #FFFFFF;
}

.morandi-disable-btn:active,
.morandi-disable-btn.is-active {
  background-color: #A37A7A;
  border-color: #A37A7A;
  color: #FFFFFF;
}

.morandi-disable-btn:disabled {
  background-color: #E3E0DB;
  border-color: #E3E0DB;
  color: #A1A8C1;
}

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-confirm-btn:hover,
.morandi-confirm-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-confirm-btn:active,
.morandi-confirm-btn.is-active {
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

/* 莫兰迪风格输入框 */
:deep(.morandi-input .el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #C1B8A8;
  box-shadow: none;
}

:deep(.morandi-input .el-input__wrapper:hover) {
  border-color: #A1A8C1;
}

:deep(.morandi-input .el-input__wrapper.is-focus) {
  border-color: #A1A8C1;
  box-shadow: 0 0 0 1px #A1A8C1;
}

/* 莫兰迪风格标签页 */
:deep(.morandi-tabs .el-tabs__item) {
  color: #6B7C93;
}

:deep(.morandi-tabs .el-tabs__item.is-active) {
  color: #4A4A4A;
}

:deep(.morandi-tabs .el-tabs__active-bar) {
  background-color: #83B59D;
}
</style>