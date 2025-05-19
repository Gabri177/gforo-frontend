<template>
  <div class="w-full h-full flex-1 bg-[#E3E0DB] min-h-screen p-6 font-sans text-[#4A4A4A]">
    <div class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] rounded-2xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-[#6B7C93]">My Notification</h2>
        <el-button type="primary" class="morandi-button" @click="markAllAsRead" :loading="markingAll">
          全部标记为已读
        </el-button>
      </div>

      <div class="mb-6">
        <el-radio-group v-model="activeType" class="flex space-x-4">
          <el-radio-button label="all">全部通知</el-radio-button>
          <el-radio-button label="unread">未读通知</el-radio-button>
          <el-radio-button label="read">已读通知</el-radio-button>
        </el-radio-group>
      </div>

      <div class="space-y-4" v-loading="loading">
        <div v-for="notification in filteredNotifications" :key="notification.id"
             class="border border-[#E3E0DB] rounded-xl p-4 hover:shadow-md transition-all duration-300"
             :class="{'bg-[#F8FAFC]': !notification.isRead}">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <el-tag :type="getNotificationType(notification.type)" class="mb-2">
                  {{ getNotificationTypeText(notification.type) }}
                </el-tag>
                <span v-if="!notification.isRead" class="bg-[#C1A1A1] px-2 py-0.5 rounded text-white text-xs">
                  新消息
                </span>
              </div>
              <p class="text-[#6B7C93] mb-2">
                <template v-if="notification.type !== 5">
                  用户 @<span class="text-[#4A5568] font-medium">{{ notification.author?.nickname || notification.author?.username }}</span>
                  <span v-if="notification.entityType === 1 && notification.type == 2">
                    点赞了你的帖子
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline" :href="`/board/${notification?.post?.boardId}/post/${notification.entityId}/1`">《{{ notification.post?.title || '你的帖子' }}》</a>
                  </span>
                  <span v-else-if="notification.entityType === 2 && notification.type == 2">
                    点赞了你的评论：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline" @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{ notification.comment?.content || '你的评论' }}</a>
                  </span>
                  <span v-else-if="notification.entityType === 1 && notification.type === 1">
                    回复了你的帖子：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline" @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{ notification.comment?.content || '你的评论' }}</a>
                  </span>
                  <span v-else-if="notification.entityType === 2 && notification.type === 1">
                    回复了你的评论：
                    <a class="text-[#6B7C93] hover:text-[#4A5568] underline" @click="handleToComment(notification?.post?.boardId, notification?.post?.id, notification?.comment?.id)">{{ notification.comment?.content || '你的评论' }}</a>
                  </span>
                </template>
                <template v-else>
                  {{ notification.content || '系统通知' }}
                </template>
              </p>
              <div class="flex items-center justify-between text-sm text-[#8B93B1]">
                <span>{{ formatDate(notification.createTime) }}</span>
                <!-- <el-button type="text" class="text-[#6B7C93]" @click="deleteNotification(notification.id)">
                  删除
                </el-button> -->
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="filteredNotifications.length === 0" description="暂无通知" />
      </div>

      <div class="mt-6 flex justify-center">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMyNotificationList } from '~/api/notificationApi'
import { 
	getCommentLocation
 } from '~/api/commentAPI'

const router = useRouter()
const loading = ref(false)
const markingAll = ref(false)
const activeType = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const notifications = ref([])

const handleToComment = async (boardId, postId, commentId) => {

  try {
    const res = await getCommentLocation(commentId)
    goToLocation(boardId, postId, res.page, res.entityId, res.targetId, res.isPostFloor)
  } catch (e) {
    ElMessage.error('获取评论位置失败')
  }
}

const filteredNotifications = computed(() => {
  if (activeType.value === 'unread') return notifications.value.filter(n => !n.isRead)
  if (activeType.value === 'read') return notifications.value.filter(n => n.isRead)
  return notifications.value
})

const goToLocation = (boardId, postId, page, entityId, targetId, isPostFloor) => {
	console.log(`/board/${boardId}/post/${postId}/${page}/location/${entityId}/${targetId}/${isPostFloor}`)
	router.push(`/board/${boardId}/post/${postId}/${page}/location/${entityId}/${targetId}/${isPostFloor}`)
}

const fetchNotifications = async () => {
  try {
    loading.value = true
    const res = await getMyNotificationList(currentPage.value, pageSize.value, false)
    console.log(res)
    notifications.value = res.notificationList || []
    total.value = res.totalRows || 0
  } catch (e) {
    ElMessage.error('加载通知失败')
  } finally {
    loading.value = false
  }
}


onMounted(async () => {
  fetchNotifications()
})

const getNotificationType = (type) => {
  const map = { 1: 'info', 2: 'success', 3: 'primary', 4: 'danger', 5: 'warning' }
  return map[type] || 'info'
}

const getNotificationTypeText = (type) => {
  const map = { 1: '评论', 2: '点赞', 3: '关注', 4: '私信', 5: '系统' }
  return map[type] || '通知'
}

const formatDate = (date) => new Date(date).toLocaleString()

const deleteNotification = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '提示', {
      confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
    })
    notifications.value = notifications.value.filter(n => n.id !== id)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const markAllAsRead = async () => {
  try {
    markingAll.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
    ElMessage.success('全部标记为已读')
  } finally {
    markingAll.value = false
  }
}


const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 改变页容量时最好重置页码
  fetchNotifications()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchNotifications()
}
</script>

<style scoped>
/* 自定义按钮样式 */
.morandi-button {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: white;
}

.morandi-button:hover {
  background-color: #8FA98F;
  border-color: #8FA98F;
}

/* 分页样式定制 */
:deep(.el-pagination) {
  --el-pagination-hover-color: #A1A8C1;
  --el-pagination-button-color: #6B7C93;
  --el-pagination-hover-color: #7A87A8;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #A1A8C1;
}

/* 标签样式定制 */
:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-radio-button__inner) {
  background-color: #F8FAFC;
  border-color: #C1B8A8;
  color: #6B7C93;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: white;
}
</style>