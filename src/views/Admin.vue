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

            <!-- 称号管理 -->
            <el-tab-pane label="Title" >
              <AdminTitleManagement v-if="activeTab == 'Title'"/>
            </el-tab-pane>

            <!-- 举报管理 -->
            <el-tab-pane label="Report">
              <AdminReportManage v-if="activeTab == 'Report'"/>
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
import AdminTitleManagement from '~/components/AdminTitleManagement.vue'
import AdminReportManage from "~/components/AdminReportManage.vue";


const authStore = useAuthStore()

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()


// 用户列表相关
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(10)

// 公告相关数据
const announcements = ref([])
const announcementLoading = ref(false)
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


// 在 onMounted 中添加获取公告列表的调用
onMounted(async () => {
  try {
    // 这里应该检查当前用户是否有管理员权限
    const info = await getUserInfo()
    userStore.setUserInfo(info)
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