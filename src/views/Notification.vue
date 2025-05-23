<template>
  <div class="w-full h-full flex-1 bg-[#E3E0DB] min-h-screen p-6 font-sans text-[#4A4A4A]">
    <div class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-[#6B7C93]">My Notification</h2>
        <el-button type="primary" class="morandi-button" @click="markAllAsRead" :loading="markingAll">
          Mark All As Read
        </el-button>
      </div>

      <div class="mb-6">
        <el-radio-group v-model="activeType" class="flex space-x-4">
          <el-radio-button label="all">All</el-radio-button>
          <el-radio-button label="unread">Unread</el-radio-button>
          <el-radio-button label="read">Read</el-radio-button>
        </el-radio-group>
      </div>

      <div class="space-y-4" v-loading="loading">
        <div v-for="notification in filteredNotifications" :key="notification.id"
          class="border border-[#E3E0DB] rounded-xl p-4 transition-all duration-300" :class="[
            { 'bg-[#F8FAFC]': !notification.isRead },
            { 'hover:bg-[#F1F5F9] cursor-pointer': notification.type === 5 || notification.type === 6 }
          ]"
          @click="(notification.type === 5 || notification.type === 6) && handleSystemNotificationClick(notification)">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <el-tag :type="getNotificationType(notification.type)" class="mb-2">
                  {{ getNotificationTypeText(notification.type) }}
                </el-tag>
                <span v-if="!notification.isRead" class="bg-[#C1A1A1] px-2 py-0.5 rounded text-white text-xs">
                  New Notification
                </span>
              </div>
              <p class="text-[#6B7C93] mb-2">
                {{ notification.id }}
                <template v-if="notification.type !== 5">
                  User @<span class="text-[#4A5568] font-medium">{{ notification.author?.nickname ||
                    notification.author?.username }}</span>
                  <span v-if="notification.entityType === 1 && notification.type == 2">
                    Likes your Post:
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline"
                      :href="`/board/${notification?.post?.boardId}/post/${notification.entityId}/1`">《{{
                        notification.post?.title || 'Your Post (Deleted)' }}》</a>
                  </span>
                  <span v-else-if="notification.entityType === 2 && notification.type == 2">
                    Likes your comment：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline"
                      @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{
                        notification.comment?.content || 'Your Comment (Deleted)' }}</a>
                  </span>
                  <span v-else-if="notification.type === 1">
                    Reply your post：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline"
                      @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{
                        notification.comment?.content || '你的评论' }}</a>
                  </span>
                  <span v-else-if="notification.type === 0">
                    Replay your comment：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline"
                      @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{
                        notification.comment?.content || 'Your Comment' }}</a>
                  </span>
                  <span v-else-if="notification.type === 6 && notification.entityType == 0">
                    : {{ notification.title || 'Your Comment' }}
                  </span>
                  <span v-else-if="notification.type === 6 && notification.entityType == 3">
                    : {{ notification.title || 'New title has been granted' }}
                  </span>
                </template>
                <template v-else>
                  {{ notification.title || 'Sys notification' }}
                </template>
              </p>
              <div class="flex items-center justify-between text-sm text-[#8B93B1]">
                <span>{{ formatDate(notification.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredNotifications.length === 0" description="No notification yet  " />
      </div>

      <div class="mt-6 flex justify-center">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
          :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>

    <!-- 系统通知弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" center append-body align-center>
      <div class="text-[#4A4A4A] whitespace-pre-wrap">{{ dialogContent }}</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getMyNotificationList,
  getMyUnreadNotificationList,
  getMyReadNotificationList,
  readNotification,
  readAllNotification
} from '~/api/notificationApi'
import { getCommentLocation } from '~/api/commentAPI'
import UserInfoCard from '~/tools/UserInfoCard.vue';

const router = useRouter()
const loading = ref(false)
const markingAll = ref(false)
const activeType = ref('all') // all, unread, read
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const isAsc = ref(false)
const notifications = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')

const handleSystemNotificationClick = async (notification) => {
  try {
    await readNotification(notification.id)
    dialogTitle.value = notification.title || 'System Notification'
    dialogContent.value = notification.content || 'No content available'
    dialogVisible.value = true
    if (activeType.value == 'unread') {
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
    } else {
      notifications.value = notifications.value.map(n =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    }

  } catch (error) {
    ElMessage.error(error.message ? error.message : 'Cannot load notification')
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

const filteredNotifications = computed(() => {
  return notifications.value
})

const fetchNotifications = async () => {
  try {
    loading.value = true
    let res
    if (activeType.value === 'unread') {
      res = await getMyUnreadNotificationList(currentPage.value, pageSize.value, isAsc.value)
    } else if (activeType.value === 'read') {
      res = await getMyReadNotificationList(currentPage.value, pageSize.value, isAsc.value)
    } else {
      res = await getMyNotificationList(currentPage.value, pageSize.value, isAsc.value)
    }
    console.log("res: ", res)
    notifications.value = res.notificationList || []
    total.value = res.totalRows || 0
  } catch (e) {
    ElMessage.error(e.message ? e.message : 'Cannot load notification')
  } finally {
    loading.value = false
  }
}

const markAllAsRead = async () => {
  try {
    markingAll.value = true
    await readAllNotification()
    if (activeType.value == 'unread') {
      notifications.value = notifications.value.filter(n => n.type == 5)
    } else {
      notifications.value = notifications.value.map(n => {
        if (n.type !== 5) {
          return { ...n, isRead: true };
        }
        return n;
      });

    }
    ElMessage.success('Marked as read successfully')
  } catch (e) {
    ElMessage.error(e.message ? e.message : 'Mark as read failed')
  } finally {
    markingAll.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchNotifications()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchNotifications()
}

watch(activeType, () => {
  currentPage.value = 1
  fetchNotifications()
})

onMounted(fetchNotifications)

const getNotificationType = (type) => {
  const map = { 1: 'info', 2: 'success', 3: 'primary', 4: 'danger', 5: 'warning' }
  return map[type] || 'info'
}

const getNotificationTypeText = (type) => {
  const map = { 1: 'Comment', 2: 'Like', 3: 'Follow', 4: 'Message', 5: 'System', 6: 'Admin' }
  return map[type] || 'Notification'
}

const formatDate = (date) => new Date(date).toLocaleString()
</script>


<style scoped>
.morandi-button {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: white;
}

.morandi-button:hover {
  background-color: #8FA98F;
  border-color: #8FA98F;
}

:deep(.el-pagination) {
  --el-pagination-hover-color: #A1A8C1;
  --el-pagination-button-color: #6B7C93;
  --el-pagination-hover-color: #7A87A8;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #A1A8C1;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-radio-group) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-radio-button) {
  margin-left: 0 !important;
  /* 移除默认间距 */
}

:deep(.el-radio-button__inner) {
  background-color: #F2F0EB;
  /* 莫兰迪淡灰米色 */
  border: 1px solid #C1B8A8;
  color: #6B7C93;
  border-radius: 0 !important;
  padding: 10px 20px;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__inner:hover) {
  background-color: #E5E3DD;
  /* 鼠标悬停淡暖灰 */
  color: #4A4A4A;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #A1B5A1 !important;
  /* 莫兰迪绿色主色 */
  border-color: #A1B5A1 !important;
  color: white !important;
  font-weight: bold;
  z-index: 1;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
  background-color: #8FA98F !important;
  border-color: #8FA98F !important;
}

:deep(.el-radio-button__inner:focus) {
  box-shadow: none !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}
</style>
