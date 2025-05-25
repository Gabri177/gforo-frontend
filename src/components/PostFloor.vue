<template>
  <div
      class="min-h-[400px] flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-md transition-all duration-300 bg-white/70 backdrop-blur-md border border-white/20">


    <!-- 左侧用户信息 -->
    <div class="w-full sm:w-48 flex-shrink-0 flex flex-col items-center justify-center user-info-card ">
      <div
          class="w-full p-4 rounded-lg backdrop-blur-sm bg-white/50 border border-[#E2E8F0] shadow-inner h-full flex flex-col justify-center">
        <div class="flex flex-col items-center">
          <el-avatar :size="50" :src="floor?.author?.headerUrl"/>
          <div
              class="mt-2 font-semibold text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-h-full user-name"
              :title="floor?.author.name">
            <!-- {{ floor?.author?.nickname }} -->
            <UserInfoCard v-if="floor?.author" :user="floor?.author" :boardId="boardId" placement="right"/>
          </div>
          <div class="mt-1 flex flex-col">
            <!-- 这里可以展示用户的成就以及其他信息 -->
            <el-tag size="small" class="bg-[#E8EBF0] text-[#6B7C93] border-[#D3D7DE]">{{
                floor?.authorTitle?.titleName
              }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容 -->
    <div
        class="w-full flex flex-col justify-between flex-grow p-4 rounded-lg backdrop-blur-md bg-white/60 border border-[#E2E8F0] shadow">

      <div
          class="flex-grow overflow-auto text-base leading-relaxed text-[#4A5568] min-h-[100px] max-h-[500px] custom-scrollbar">
        <div ref="contentRef"
             :class="{ 'content-wrapper': true, 'content-collapsed': !floor?.isExpanded && enableContentExpand && shouldShowExpandButton }">
          <v-md-editor :model-value="floor?.content" mode="preview"></v-md-editor>
        </div>
        <div v-if="shouldShowExpandButton && enableContentExpand" class="text-center mt-2">
          <el-button type="success" link size="small" @click="toggleExpand">
            {{ floor?.isExpanded ? 'Collapse' : 'Expand' }}
          </el-button>
        </div>
      </div>

      <!-- 回复列表 -->
      <div v-if="floor?.replies && floor?.replies.length > 0"
           class="mt-4 reply-area backdrop-blur-md bg-white/30 border border-[#E2E8F0]">
        <div ref="repliesContainerRef" class="max-h-[300px] overflow-y-auto replies-container">
          <div :id="`reply-${reply.id}`" v-for="reply in pagedReplies" :key="reply.id"
               class="mb-2 pb-2 border-b border-[#E5E7EB] last:border-b-0">
            <div class="flex items-start justify-between">
              <div class="flex-grow">
                <div class="flex items-start space-x-2 w-full">
                                    <span
                                        class="flex-shrink-0 max-w-[100px] truncate"
                                        :title="reply?.author?.nickname">
                                        <!-- {{ reply?.author?.nickname }} : -->
                                        <UserInfoCard :user="reply.author" :boardId="boardId" placement="right"
                                                      :addColon="true"/>
                                    </span>

                  <span v-if="reply.targetUserInfo != null"
                        class="flex-shrink-0 max-w-[100px] truncate"
                        :title="reply.targetUserInfo.nickname">
                                        <UserInfoCard :user="reply.targetUserInfo" :boardId="boardId" placement="right"
                                                      :addAt="true"/>
                                    </span>
                  <div class="flex-grow min-w-0">
                    <div :class="{ 'line-clamp-2': !reply?.isExpanded && enableContentExpand }"
                         class="whitespace-pre-wrap break-words break-all">
                      <!--                                            {{ reply.id }} == -->
                      {{ reply?.content }}
                    </div>
                    <div v-if="shouldShowReplyExpandButton(reply?.content) && enableContentExpand"
                         class="text-center mt-1">
                      <el-button type="success" link size="small"
                                 @click="toggleReplyExpand(reply)">
                        {{ reply?.isExpanded ? 'Collapse' : 'Expand' }}
                      </el-button>
                    </div>
                  </div>
                </div>
                <div class="text-xs text-[#718096] mt-1 flex items-center justify-between">
                  <div>{{ formatDate(reply?.createTime) }}</div>
                  <div>
                    <el-button v-if="!ifShowDeleteBtn(reply?.author?.id, !props.isPost)"
                               type="danger" link size="small" class="ml-4 self-start"
                               @click="$emit('report', reply, 1)">Report
                    </el-button>
                    <el-button v-if="ifShowDeleteBtn(reply?.author?.id, !props.isPost)"
                               type="danger" link size="small" class="ml-4 self-start"
                               @click="$emit('delete', reply, 1)">Delete
                    </el-button>
                    <el-button v-if="userStore.isLoggedInState && currentUserID == reply.author.id"
                               type="primary" link size="small" class="ml-4 self-start"
                               @click="$emit('edit', floor, 1, reply)">Edit
                    </el-button>
                    <el-button v-if="userStore.isLoggedInState" type="success" link size="small"
                               class="ml-4 self-start" @click="$emit('reply', floor, reply)">Reply
                    </el-button>

                    <el-button v-if="userStore.isLoggedInState" type="info" link size="small"
                               class="ml-4 self-start" @click="handleLikeComment(reply?.id)">
                      {{ reply?.isLike ? 'Liked' : 'Like' }} ({{ reply?.likeCount }})
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 展开/收起按钮 -->
        <div v-if="floor.replies.length > 3 && enableRepliesExpand"
             class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
          <el-button type="success" link size="small" @click="toggleReplies">
            {{ isExpanded ? 'Collapse' : `Expand(${floor?.replies.length})` }}
          </el-button>
        </div>

        <!-- 分页器 -->
        <div v-if="isExpanded && floor?.replies.length > replyPageSize && enableRepliesExpand"
             class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
          <el-pagination v-model:current-page="currentPage" :page-size="replyPageSize"
                         :total="floor?.replies.length" layout="prev, pager, next" small background/>
        </div>
      </div>

      <!-- 楼层信息 -->
      <div class="mt-2 text-sm text-[#718096] border-t pt-2 flex justify-between">
        <div class="flex items-center space-x-4">
          <span>{{ floorNum }} Floor</span>
          <span>{{ formatDate(floor?.createTime) }}</span>
        </div>

        <div>
          <!-- 自己不是主人 -->
          <el-button v-if="!ifShowDeleteBtn(props.floor?.author.id, !props.isPost) && userStore.isLoggedInState"
                     type="danger"
                     link @click="$emit('report', floor, 0)">Report
          </el-button>
          <!-- 自己是主人 -->
          <el-button v-if="ifShowDeleteBtn(props.floor?.author.id, !props.isPost)" type="danger"
                     link @click="$emit('delete', floor, 0)">Delete
          </el-button>
          <el-button v-if="userStore.isLoggedInState && currentUserID == props.floor?.author.id"
                     type="primary" link @click="$emit('edit', floor, 0)">Edit
          </el-button>

          <!-- 通用 -->
          <el-button v-if="userStore.isLoggedInState" type="success" link
                     @click="$emit('reply', floor)">Reply
          </el-button>
          <el-button v-if="userStore.isLoggedInState && !props.isPost" type="info" link
                     @click="handleLikeComment(props.floor?.id)">{{ props.floor?.isLike ? 'Liked' : 'Like' }}
            ({{ props.floor?.likeCount }})
          </el-button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, nextTick} from 'vue'
import {useUserStore} from '~/stores/user';
import {useAuthStore} from '~/stores/auth';
import {PERMISSIONS} from '~/constants/permissions'
import UserInfoCard from '~/tools/UserInfoCard.vue';
import {likePost, likeComment} from '~/api/likeApi';
import {ElMessage} from 'element-plus';

const userStore = useUserStore();
const authStore = useAuthStore();
const currentUserID = userStore.getBasicUserInfo().id
const repliesContainerRef = ref(null)

const props = defineProps({
  isPost: {
    type: Boolean,
    required: true
  },
  boardId: {
    type: Number,
    required: true
  },
  floorNum: {
    type: Number,
    required: true
  },
  floor: {
    type: Object,
    required: true
  },
  replyPageSize: {
    type: Number,
    default: 10
  },
  enableContentExpand: {
    type: Boolean,
    default: true
  },
  enableRepliesExpand: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['reply', 'delete', 'edit', 'report'])

const isExpanded = ref(false)
const currentPage = ref(1)
const contentRef = ref(null)
const shouldShowExpandButton = ref(false)

const handleLikeComment = async (commentId) => {
  console.log('commentId', commentId)
  try {
    await likeComment(commentId)
    // ElMessage.success('Like success')
    // 更新点赞状态
    pagedReplies.value.forEach(reply => {
      console.log("original isLike reply", reply, reply.isLike, reply.likeCount)
      if (reply.id == commentId) {
        reply.isLike = !reply.isLike
        reply.likeCount += reply.isLike ? 1 : -1
      }
    })
    if (props.floor.id == commentId) {
      console.log("original isLike floor", props.floor, props.floor.isLike, props.floor.likeCount)
      props.floor.isLike = !props.floor.isLike;
      props.floor.likeCount += props.floor.isLike ? 1 : -1;
    }

  } catch (error) {
    ElMessage.error(error.message ? error.message : 'Like failed')
  }
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

const ifShowDeleteBtn = (authorId, isComment) => {

  if (!userStore.isLoggedInState)
    return false
  if (currentUserID == authorId)
    return true
  else if (!isComment && (authStore.hasPermission('post:delete:any') ||
      authStore.hasPermission('post:delete:board') && authStore.hasBoardId(props.boardId)))
    return true
  else if (isComment && (authStore.hasPermission('comment:delete:any') ||
      authStore.hasPermission('comment:delete:board') && authStore.hasBoardId(props.boardId)))
    return true
  return false

}


// 计算当前页的回复
const pagedReplies = computed(() => {
  if (!isExpanded.value) {
    return props.floor.replies.slice(0, 3)
  }
  if (props.floor.replies.length <= props.replyPageSize) {
    return props.floor.replies
  }
  const start = (currentPage.value - 1) * props.replyPageSize
  return props.floor.replies.slice(start, start + props.replyPageSize)
})

// 检查内容高度是否需要展开按钮
const checkContentHeight = async () => {
  await nextTick()
  if (contentRef.value) {
    const contentHeight = contentRef.value.querySelector('.github-markdown-body')?.offsetHeight || 0
    shouldShowExpandButton.value = contentHeight > 150
  }
}

// 监听内容变化
onMounted(() => {
  checkContentHeight()
})

// 展开/收起回复列表
const toggleReplies = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    currentPage.value = 1
  }
}

// 展开/收起楼层内容
const toggleExpand = () => {
  props.floor.isExpanded = !props.floor.isExpanded
}

// 展开/收起回复内容
const toggleReplyExpand = (reply) => {
  reply.isExpanded = !reply.isExpanded
}

// 判断是否需要显示回复展开按钮
const shouldShowReplyExpandButton = (content) => {
  if (!content) return false
  // 假设每行大约50个字符，2行就是100个字符
  return content.length > 100
}

// 滚动到指定回复
const scrollToReplyWithPage = async (replyId) => {
  if (!props.floor.replies || props.floor.replies.length === 0) return;

  // 找到 replyId 在第几条
  const index = props.floor.replies.findIndex(reply => reply.id === replyId);
  if (index === -1) {
    console.warn(`Reply with id ${replyId} not found in current floor`);
    return;
  }

  // 计算它所在页数
  const targetPage = Math.floor(index / props.replyPageSize) + 1;
  if (currentPage.value !== targetPage) {
    currentPage.value = targetPage;
    await nextTick();
  }

  if (!isExpanded.value) {
    isExpanded.value = true // 展开楼层
  }

  await nextTick();

  // 等待页面渲染
  setTimeout(() => {
    const target = document.getElementById(`reply-${replyId}`);
    console.log("是否存在 postfloor 评论跳转 target: ", target)
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      highlightReply(replyId)
    } else {
      console.warn(`After page change, still cannot find reply-${replyId}`);
    }
  }, 200); // 给一点小延迟，确保渲染完成
}

// 滚动到最后一条回复
const scrollToLastReply = async () => {
  if (!isExpanded.value) {
    isExpanded.value = true // 展开楼层
  }
  await nextTick()

  if (props.floor.replies.length > props.replyPageSize) {
    const lastPage = Math.ceil(props.floor.replies.length / props.replyPageSize)
    if (currentPage.value !== lastPage) {
      currentPage.value = lastPage
      await nextTick()
    }
  }

  await nextTick()

  const repliesContainer = repliesContainerRef.value;
  console.log("是否有当前楼层: ", repliesContainer)
  if (repliesContainer) {
    repliesContainer.scrollTo({
      top: repliesContainer.scrollHeight,
      behavior: 'smooth'
    });
    highlightReply(props.floor.replies[props.floor.replies.length - 1]?.id);
  } else {
    console.warn('repliesContainer not found');
  }
}

const floorId = computed(() => props.floor?.id ?? null)

const highlightReply = async (replyId) => {
  await nextTick();
  const target = document.getElementById(`reply-${replyId}`);
  if (target) {
    target.classList.add('highlight-reply');

    // 3秒后开始淡出
    setTimeout(() => {
      target.classList.add('highlight-fadeout');
    }, 3000);

    // 5秒后彻底移除高亮相关class
    setTimeout(() => {
      target.classList.remove('highlight-reply', 'highlight-fadeout');
    }, 5000);
  }
};


defineExpose({
  floorId,
  scrollToLastReply,
  scrollToReplyWithPage
})
</script>

<style scoped>

:deep(.el-button.is-link) {
  transition: all 0.3s ease;
}

/* 默认字体颜色 */
:deep(.el-button--primary.is-link) {
  color: #A1A8C1;
}

/* 悬停时字体颜色 */
:deep(.el-button--primary.is-link:hover) {
  color: #7A87A8;
}

/* 按下时字体颜色 */
:deep(.el-button--primary.is-link:active) {
  color: #5A6788;
}


/* 评论高亮动画 */
.highlight-reply {
  background-color: #D8D3CD;
  /* 柔和莫兰迪浅灰紫色 */
  transition: background-color 0.5s ease;
  border-radius: 8px;
}

/* 高亮渐隐 */
.highlight-fadeout {
  background-color: transparent;
  transition: background-color 2s ease;
}

/* 所有文字按钮的基础样式 */
:deep(.el-button--text) {
  color: #8B9E8B;
  transition: all 0.3s;
}

:deep(.el-button--text:hover) {
  color: #6B7C6B;
}

/* 举报按钮样式 */
:deep(.el-button--danger.is-link) {
  color: #A87A7A;
}

:deep(.el-button--danger.is-link:hover) {
  color: #8B5E5E;
}

/* 展开/回复按钮样式 */
:deep(.el-button--success.is-link) {
  color: #8B9E8B;
}

:deep(.el-button--success.is-link:hover) {
  color: #6B7C6B;
}

/* 回复分页按钮 */
:deep(.el-pagination.is-background .el-pager li) {
  background-color: #E3E0DB;
  color: #4A4A4A;
  border: none;
  transition: all 0.3s;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #A1A8C1;
  color: #fff;
}

:deep(.el-pagination.is-background button) {
  background-color: #E3E0DB;
  color: #4A4A4A;
  border: none;
  transition: all 0.3s;
}

:deep(.el-pagination.is-background button:hover),
:deep(.el-pagination.is-background .el-pager li:hover) {
  background-color: #C1B8A8;
  color: #fff;
}

/* 回复对话框 */
:deep(.el-dialog) {
  background-color: #E3E0DB;
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #C1B8A8;
}

:deep(.el-dialog__title) {
  color: #4A4A4A;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #C1B8A8;
  padding: 15px 20px;
}

/* 输入框样式 */
:deep(.el-textarea__inner) {
  background-color: #F8FAFC;
  border-color: #C1B8A8;
  border-radius: 4px;
}

:deep(.el-textarea__inner:focus) {
  border-color: #A1A8C1;
}

/* 按钮样式 */
:deep(.el-button--default) {
  background-color: #E3E0DB;
  border-color: #C1B8A8;
  color: #4A4A4A;
}

:deep(.el-button--default:hover) {
  background-color: #C1B8A8;
  border-color: #A87A7A;
  color: #4A4A4A;
}

:deep(.el-button--primary) {
  background-color: #A1A8C1;
  border-color: #7A87A8;
}

:deep(.el-button--primary:hover) {
  background-color: #7A87A8;
  border-color: #5A6788;
}

/* 文本截断样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 内容包装器样式 */
.content-wrapper {
  position: relative;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

:deep(.github-markdown-body) {
  background-color: #FDFDFD;
}

.content-wrapper.content-collapsed :deep(.github-markdown-body) {
  max-height: 150px;
  overflow: hidden;
  position: relative;
}

.content-wrapper.content-collapsed :deep(.github-markdown-body)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none;
  z-index: 1;
}

/* 用户信息卡片样式 */


html {
  background-color: #E3E0DB; /* 柔和底色 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}


/* 回复区域样式 */
.reply-area {
  background-color: rgba(250, 250, 249, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease-in-out;
}

.reply-area:hover {
  background-color: rgba(255, 255, 251, 0.6);
}

/* 滚动条样式 */
.max-h-\[300px\] {
  scrollbar-width: thin;
  scrollbar-color: #A1A8C1 transparent;
}

.max-h-\[300px\]::-webkit-scrollbar {
  width: 6px;
}

.max-h-\[300px\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[300px\]::-webkit-scrollbar-thumb {
  background-color: #A1A8C1;
  border-radius: 3px;
}

/* 确保内容区域不会超出屏幕 */
.text-base {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (max-width: 640px) {
  .user-name {
    font-size: 14px;
    text-align: center;
  }

  .floor {
    padding: 12px;
  }

  .el-avatar {
    width: 36px !important;
    height: 36px !important;
  }
}

</style>