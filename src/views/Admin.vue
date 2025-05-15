<template>
  <div class="w-full h-full flex-1 flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-3/4 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl">
        <div class="max-w-5xl mx-auto">
          <h2 class="text-2xl font-bold text-[#6B7C93] mb-8">Console</h2>

          <el-tabs class="morandi-tabs" @tab-click="handleTabClick" >

            <!-- 用户管理 -->
            <el-tab-pane label="User">
              <AdminUserManage v-if="activeTab == 'User'"/>
            </el-tab-pane>

            <!-- 数据统计 -->
            <el-tab-pane label="Data Analysis">
              <AdminUserAnalyse :statistics="statistics" v-if="activeTab == 'Data Analysis'"/>
            </el-tab-pane>
            
            <!-- 公告管理 -->
            <el-tab-pane label="Announcement" >
              <AdminAnnouncement 
                v-if="activeTab == 'Announcement'"
                :announcements="announcements" 
                :loading="announcementLoading"
                :total="totalAnnouncements"
                @fetch-announcements="fetchAnnouncements"
                @size-change="handleAnnouncementSizeChange"
                @current-change="handleAnnouncementCurrentChange"
                @create-announcement="handleCreateAnnouncement"
                @update-announcement="handleUpdateAnnouncement"
                @delete-announcement="handleDeleteAnnouncement"
              />
            </el-tab-pane>


            <!-- 权限管理 -->
            <el-tab-pane label="Permission">
              <AdminPermissionManage  v-if="activeTab == 'Permission'" />
            </el-tab-pane>

            <!-- 布局走马灯... -->
            <el-tab-pane label="Layout" v-if="authStore.isSuperAdmin">
              <AdminCarouselManage v-if="activeTab == 'Layout'"/>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { getUserInfo } from '~/api/userApi'
import AdminUserManage from '~/components/AdminUserManage.vue'
import AdminUserAnalyse from '~/components/AdminUserAnalyse.vue'
import AdminPermissionManage from '~/components/AdminPermissionManage.vue'
import AdminAnnouncement from '~/components/AdminAnnouncement.vue'
import AdminCarouselManage from '~/components/AdminCarouselManage.vue'
import {
  getUserList,
  changeUserPassword,
  activeUser,
  disableUser,
  deleteUser,
  logoutUser
} from '~/api/adminApi'

const authStore = useAuthStore()

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()


// 用户列表相关
const users = ref([])
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// 公告相关数据
const announcements = ref([])
const announcementLoading = ref(false)
const currentAnnouncementPage = ref(1)
const announcementPageSize = ref(10)
const totalAnnouncements = ref(0)

// 统计数据
const statistics = reactive({
  totalUsers: 0,
  activeUsers: 0,
  totalPosts: 0,
  totalComments: 0,
  userGrowthRate: 0,
  postGrowthRate: 0,
  commentGrowthRate: 0
})

// 标签页切换处理
const activeTab = ref('User')

function handleTabClick(tab) {
  activeTab.value = tab.props.label
  //console.log('Active tab:', tab.props.label)
}

// 获取用户列表
async function fetchUsers() {
  tableLoading.value = true
  try {
    // 这里应该调用获取用户列表的API
    // const response = await getUserList(currentPage.value, pageSize.value)
    // users.value = response.data
    // totalUsers.value = response.total
    // const res = await getUserList(0)
    // users.value = res.userInfoList
    // currentPage.value = res.currentPage
    // pageSize.value = res.pageSize
    // totalUsers.value = res.totalRows
    // console.log(res)
    // totalUsers.value = users.value.length
    // tableLoading.value = false
    
    // 模拟数据
    // setTimeout(() => {
    //   users.value = Array(20).fill().map((_, index) => ({
    //     id: index + 1,
    //     username: `user${index + 1}`,
    //     nickname: `用户${index + 1}`,
    //     email: `user${index + 1}@example.com`,
    //     createdAt: 'Sun Mar 23 22:48:09 CET 2023',
    //     status: index % 5 === 0 ? '0' : '1',
    //     headerUrl: '',
    //     postCount: Math.floor(Math.random() * 50),
    //     commentCount: Math.floor(Math.random() * 100),
    //     bio: index % 3 === 0 ? '这是用户的个人简介' : ''
    //   }))
    //   totalUsers.value = 100
      
    //   // 更新统计数据
    //   statistics.totalUsers = 100
    //   statistics.activeUsers = 85
    //   statistics.totalPosts = 1250
    //   statistics.totalComments = 3680
    //   statistics.userGrowthRate = 12.5
    //   statistics.postGrowthRate = 8.3
    //   statistics.commentGrowthRate = 15.7
      
    //   tableLoading.value = false
    // }, 1000)
  } catch (error) {
    console.error('Failed to fetch users:', error)
    ElMessage.error('获取用户列表失败')
    tableLoading.value = false
  }
}


// // 获取公告列表
// async function fetchAnnouncements() {
//   announcementLoading.value = true
//   try {
//     // 这里应该调用获取公告列表的API
//     // const response = await getAnnouncementList(currentAnnouncementPage.value, announcementPageSize.value)
//     // announcements.value = response.data
//     // totalAnnouncements.value = response.total
    
//     // 模拟数据
//     setTimeout(() => {
//       announcements.value = Array(10).fill().map((_, index) => ({
//         id: index + 1,
//         title: `公告标题 ${index + 1}`,
//         content: `这是公告内容 ${index + 1}，包含了一些重要信息...`,
//         createdAt: 'Sun Mar 23 22:48:09 CET 2023',
//         updatedAt: 'Sun Mar 23 22:48:09 CET 2023',
//         status: index % 3 === 0 ? '0' : '1', // 0: 草稿, 1: 已发布
//         author: '管理员',
//         priority: index % 5 // 0-4: 优先级从低到高
//       }))
//       totalAnnouncements.value = 30
      
//       announcementLoading.value = false
//     }, 1000)
//   } catch (error) {
//     console.error('Failed to fetch announcements:', error)
//     ElMessage.error('获取公告列表失败')
//     announcementLoading.value = false
//   }
// }

// // 公告分页处理
// function handleAnnouncementSizeChange(size) {
//   announcementPageSize.value = size
//   fetchAnnouncements()
// }

// function handleAnnouncementCurrentChange(page) {
//   currentAnnouncementPage.value = page
//   fetchAnnouncements()
// }

// // 创建公告
// async function handleCreateAnnouncement(announcement) {
//   try {
//     // 这里应该调用创建公告的API
//     // await createAnnouncement(announcement)
    
//     // 模拟API调用
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // 刷新公告列表
//     fetchAnnouncements()
    
//     ElMessage.success('公告创建成功')
//   } catch (error) {
//     console.error('创建公告失败:', error)
//     ElMessage.error('创建公告失败')
//   }
// }

// // 更新公告
// async function handleUpdateAnnouncement(id, announcement) {
//   try {
//     // 这里应该调用更新公告的API
//     // await updateAnnouncement(id, announcement)
    
//     // 模拟API调用
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // 更新本地数据
//     const index = announcements.value.findIndex(a => a.id === id)
//     if (index !== -1) {
//       announcements.value[index] = { ...announcements.value[index], ...announcement }
//     }
    
//     ElMessage.success('公告更新成功')
//   } catch (error) {
//     console.error('更新公告失败:', error)
//     ElMessage.error('更新公告失败')
//   }
// }

// // 删除公告
// async function handleDeleteAnnouncement(id) {
//   try {
//     // 这里应该调用删除公告的API
//     // await deleteAnnouncement(id)
    
//     // 模拟API调用
//     await new Promise(resolve => setTimeout(resolve, 1000))
    
//     // 更新本地数据
//     announcements.value = announcements.value.filter(a => a.id !== id)
    
//     ElMessage.success('公告删除成功')
//   } catch (error) {
//     console.error('删除公告失败:', error)
//     ElMessage.error('删除公告失败')
//   }
// }

// 在 onMounted 中添加获取公告列表的调用
onMounted(async () => {
  try {
    // 这里应该检查当前用户是否有管理员权限
    const info = await getUserInfo()
    userStore.setUserInfo(info)
    
    
    // 假设管理员角色ID为1，如果不是管理员则重定向
    // if (userInfo.role !== 1) {
    //   ElMessage.error('您没有管理员权限')
    //   router.push('/')
    //   return
    // }
    
    // 加载数据
    // fetchUsers()
    // fetchAnnouncements() // 添加获取公告列表
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    ElMessage.error('获取用户信息失败')
    router.push('/')
  }
})
</script>

<style scoped>


:deep(.morandi-table th) {
  background-color: #E3E0DB !important;
  color: #6B7C93;
  font-weight: 600;
  text-align: center !important;
  /* 表头居中 */
}

/* 表格内容居中 - 除了第一列（ID列）外的所有单元格 */
:deep(.morandi-table td:not(:first-child)) {
  text-align: center !important;
}

/* 邮箱过长时显示省略号 */
:deep(.morandi-table .email-column .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  /* 可以根据需要调整最大宽度 */
}

:deep(.morandi-table .el-table__row:nth-child(even)) {
  background-color: #F8FAFC;
}

/* 操作列居中 */
:deep(.morandi-table td:last-child) {
  text-align: center !important;
}

/* 或者如果您想要更精确地指定操作列，可以使用以下选择器 */
:deep(.morandi-table td.el-table_1_column_7) {
  text-align: center !important;
}


/* 莫兰迪风格按钮 */
:deep(.morandi-button) {
  background-color: #A1A8C1;
  border-color: #A1A8C1;
  color: white;
}

:deep(.morandi-button:hover),
:deep(.morandi-button:focus),
:deep(.morandi-button:active),
:deep(.el-button.morandi-button:focus-visible) {
  background-color: #8B93B1;
  border-color: #8B93B1;
  color: white !important;  /* 强制覆盖 Element Plus 的默认悬停颜色 */
}

:deep(.morandi-button:active) {
  background-color: #7A87A8;
  border-color: #7A87A8;
}

/* 莫兰迪风格主要按钮 */
.morandi-primary-btn {
  background-color: #83B59D;
  border-color: #83B59D;
  color: white;
}

.morandi-primary-btn:hover,
.morandi-primary-btn:focus,
.morandi-primary-btn:active,
:deep(.el-button.morandi-primary-btn:focus-visible) {
  background-color: #6FA189;
  border-color: #6FA189;
  color: white !important;
}

.morandi-primary-btn:active {
  background-color: #5C8D75;
  border-color: #5C8D75;
}

/* 莫兰迪风格危险按钮 */
.morandi-danger-btn {
  background-color: #A87A7A;
  border-color: #A87A7A;
  color: white;
}

.morandi-danger-btn:hover,
.morandi-danger-btn:focus,
.morandi-danger-btn:active,
:deep(.el-button.morandi-danger-btn:focus-visible) {
  background-color: #946B6B;
  border-color: #946B6B;
  color: white !important;
}

.morandi-danger-btn:active {
  background-color: #845C5C;
  border-color: #845C5C;
}

/* 禁用状态 */
.morandi-primary-btn:disabled,
.morandi-danger-btn:disabled {
  background-color: #E3E0DB;
  border-color: #C1B8A8;
  color: #8B93B1;
  opacity: 0.7;
}


/* 莫兰迪风格分页器 */
:deep(.el-pagination) {
  --el-pagination-button-color: #6B7C93;
  --el-pagination-button-bg-color: #F8FAFC;
  --el-pagination-button-disabled-color: #C1B8A8;
  --el-pagination-button-disabled-bg-color: #F1F5F9;
  --el-pagination-hover-color: white;
  --el-pagination-font-size: 14px;
  margin-top: 16px;
}

:deep(.el-pagination .el-pager li) {
  background-color: #F8FAFC;
  color: #6B7C93;
  border: 1px solid #E3E0DB;
  transition: all 0.3s ease;
  margin: 0 2px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

:deep(.el-pagination .el-pager li:hover) {
  background-color: #A1A8C1;
  color: white !important;
  border-color: #A1A8C1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #83B59D !important;
  color: white !important;
  border-color: #83B59D !important;
  font-weight: 600;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: #F8FAFC;
  color: #6B7C93;
  border: 1px solid #E3E0DB;
  padding: 0 8px;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background-color: #A1A8C1;
  color: white !important;
  border-color: #A1A8C1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  background-color: #F1F5F9;
  color: #C1B8A8;
  border-color: #E3E0DB;
  cursor: not-allowed;
}

/* 页码大小选择器 */
:deep(.el-pagination .el-select .el-input) {
  --el-select-border-color-hover: #83B59D;
  --el-select-input-focus-border-color: #83B59D;
  margin: 0 8px;
}

:deep(.el-pagination .el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #E3E0DB !important;
  box-shadow: none !important;
  padding: 0 8px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-input__wrapper:hover) {
  border-color: #A1A8C1 !important;
}

:deep(.el-pagination .el-input__wrapper.is-focus) {
  border-color: #83B59D !important;
  box-shadow: 0 0 0 1px rgba(131, 181, 157, 0.2) !important;
}

:deep(.el-pagination .el-input__inner) {
  color: #6B7C93;
  height: 32px;
}

/* 跳转到页输入框 */
:deep(.el-pagination .el-pagination__jump) {
  color: #6B7C93;
  margin-left: 12px;
}

:deep(.el-pagination .el-pagination__editor.el-input) {
  width: 50px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pagination__editor.el-input .el-input__wrapper) {
  border: 1px solid #E3E0DB !important;
  border-radius: 4px;
  height: 32px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pagination__editor.el-input .el-input__wrapper:hover) {
  border-color: #A1A8C1 !important;
}

:deep(.el-pagination .el-pagination__editor.el-input .el-input__wrapper.is-focus) {
  border-color: #83B59D !important;
  box-shadow: 0 0 0 1px rgba(131, 181, 157, 0.2) !important;
}

:deep(.el-pagination .el-pagination__total) {
  color: #6B7C93;
  margin-right: 12px;
}

/* 下拉菜单莫兰迪风格 */
:deep(.el-select-dropdown__item) {
  color: #6B7C93;
}

:deep(.el-select-dropdown__item.selected) {
  color: #83B59D !important;
  font-weight: 600;
  background-color: rgba(131, 181, 157, 0.1) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(161, 168, 193, 0.1) !important;
}

/* 背景色 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled)) {
  background-color: #F8FAFC;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #83B59D !important;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  background-color: #A1A8C1;
}

:deep(.el-pagination.is-background .btn-prev, 
       .el-pagination.is-background .btn-next) {
  background-color: #F8FAFC;
}

:deep(.el-pagination.is-background .btn-prev:hover, 
       .el-pagination.is-background .btn-next:hover) {
  background-color: #A1A8C1;
}
/* 莫兰迪风格选中颜色 */
:deep(.el-table__row.current-row td) {
  background-color: rgba(131, 181, 157, 0.1) !important;
}

:deep(.el-table__row td.el-table__cell.hover-row) {
  background-color: rgba(131, 181, 157, 0.1) !important;
}

:deep(.el-table__body tr.hover-row > td.el-table__cell) {
  background-color: rgba(131, 181, 157, 0.1) !important;
}

/* 文本选中颜色 */
::selection {
  background-color: rgba(131, 181, 157, 0.3);
  color: #4A4A4A;
}

/* 下拉菜单莫兰迪风格 */
:deep(.el-select-dropdown__item.selected) {
  color: #83B59D !important;
  font-weight: 600;
  background-color: rgba(131, 181, 157, 0.1) !important;
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(161, 168, 193, 0.1) !important;
}

/* 修复 tabs 选中颜色 */
:deep(.el-tabs__item.is-active) {
  color: #83B59D !important;
}

:deep(.el-tabs__active-bar) {
  background-color: #83B59D !important;
}

:deep(.el-tabs__item:hover) {
  color: #6FA189 !important;
}
</style>