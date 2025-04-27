<template>
    <div :id="floor?.id ? `floor-${floor.id}` : undefined" class="min-h-[400px] flex gap-4 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md bg-white/60 border border-white/20 shadow-lg rounded-xl p-6 from-[#F8FAFC] to-[#F1F5F9] border border-[#E3E0DB] hover:border-[#C1B8A8]">
        <!-- 左侧用户信息 -->
        <div class="w-48 flex-shrink-0 flex flex-col items-center justify-center user-info-card ">
            <div class="w-full p-4 rounded-lg backdrop-blur-sm bg-white/50 border border-[#E2E8F0] shadow-inner h-full flex flex-col justify-center border border-[#E2E8F0] shadow">
                <div class="flex flex-col items-center">
                    <el-avatar :size="50" :src="floor?.author.avatar" />
                    <div class="mt-2 font-semibold text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-h-full user-name" :title="floor?.author.name">
                        {{ floor?.author.name }}
                    </div>
                    <div class="mt-1">
                        <el-tag size="small" class="bg-[#E8EBF0] text-[#6B7C93] border-[#D3D7DE]">知名人士</el-tag>
                    </div>
                </div>
            </div>
        </div>

        <!-- 右侧内容 -->
        <div class="flex flex-col justify-between flex-grow p-4 rounded-lg backdrop-blur-md bg-white/60 border border-[#E2E8F0] shadow">

            <div class="flex-grow overflow-auto max-h-[500px] text-base leading-relaxed text-[#4A5568] min-h-[100px] max-h-[500px] custom-scrollbar">
                <div ref="contentRef" :class="{'content-wrapper': true, 'content-collapsed': !floor?.isExpanded && enableContentExpand && shouldShowExpandButton}">
                    <v-md-editor :model-value="floor?.content" mode="preview"></v-md-editor>
                </div>
                <div v-if="shouldShowExpandButton && enableContentExpand" class="text-center mt-2">
                    <el-button type="success" link size="small" @click="toggleExpand">
                        {{ floor?.isExpanded ? 'Collapse' : 'Expand' }}
                    </el-button>
                </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="floor?.replies && floor?.replies.length > 0" class="mt-4 reply-area backdrop-blur-md bg-white/30 border border-[#E2E8F0]">
                <div class="max-h-[300px] overflow-y-auto replies-container">
                    <div v-for="reply in pagedReplies" :key="reply.id" 
                        class="mb-2 pb-2 border-b border-[#E5E7EB] last:border-b-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-grow">
                                <div class="flex items-start space-x-2">
                                    <span class="text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-w-[120px] min-w-[50px]" :title="reply.author.name">
                                        {{ reply?.author.name }} :
                                    </span>
                                    <span v-if="reply.targetUserInfo != null" class="text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-w-[120px] min-w-[50px]" :title="reply.author.name">
                                        @{{ reply?.targetUserInfo?.name }}
                                    </span>
                                    <div class="text-[#4A5568] flex-grow">
                                        <div :class="{'line-clamp-2': !reply?.isExpanded && enableContentExpand}" class="whitespace-pre-wrap break-words break-all">{{ reply?.content }}</div>
                                        <div v-if="shouldShowReplyExpandButton(reply?.content) && enableContentExpand" class="text-center mt-1">
                                            <el-button type="success" link size="small" @click="toggleReplyExpand(reply)">
                                                {{ reply?.isExpanded ? 'Collapse' : 'Expand' }}
                                            </el-button>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-xs text-[#718096] mt-1">
                                    <span>{{ formatDate(reply?.createTime) }}</span>
                                </div>
                            </div>
                            <el-button v-if="userStore.isLoggedInState" type="success" link size="small" class="ml-4 self-start" @click="$emit('reply', floor, reply)">Reply</el-button>
                        </div>
                    </div>
                </div>

                <!-- 展开/收起按钮 -->
                <div v-if="floor.replies.length > 3 && enableRepliesExpand" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
                    <el-button type="success" link size="small" @click="toggleReplies">
                        {{ isExpanded ? 'Collapse' : `Expand(${floor?.replies.length})` }}
                    </el-button>
                </div>

                <!-- 分页器 -->
                <div v-if="isExpanded && floor?.replies.length > replyPageSize && enableRepliesExpand" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
                    <el-pagination
                        v-model:current-page="currentPage"
                        :page-size="replyPageSize"
                        :total="floor?.replies.length"
                        layout="prev, pager, next"
                        small
                        background
                    />
                </div>
            </div>

            <!-- 楼层信息 -->
            <div class="mt-2 text-sm text-[#718096] border-t pt-2 flex justify-between">
                <div class="flex items-center space-x-4">
                    <span>{{ floorNum }} Floor</span>
                    <span>{{ formatDate(floor?.createTime) }}</span>
                </div>

                <div>
                    <el-button v-if="userStore.isLoggedInState" type="danger" link>Report</el-button>
                    <el-button v-if="userStore.isLoggedInState" type="success" link @click="$emit('reply', floor)">Reply</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import VMdEditor from '@kangc/v-md-editor';
import { useUserStore } from '~/stores/user';

const userStore = useUserStore();

const props = defineProps({
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

const emit = defineEmits(['reply'])

const isExpanded = ref(false)
const currentPage = ref(1)
const contentRef = ref(null)
const shouldShowExpandButton = ref(false)

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

    const repliesContainer = document.querySelector(`#floor-${props.floor.id} .replies-container`)
    console.log("Is there a replies container",repliesContainer)
    if (repliesContainer) {
        const needScroll = repliesContainer.scrollHeight > repliesContainer.clientHeight

        if (needScroll) {
            console.log('need scroll')
            // 有滚动条，滚到底
            repliesContainer.scrollTo({
                top: repliesContainer.scrollHeight,
                behavior: 'smooth'
            })
        } else {
            console.log('no need scroll')
            // 没滚动条，直接找到最后一个reply元素，滚动到它
            const lastReply = repliesContainer.querySelector('.mb-2:last-child')
            if (lastReply) {
                lastReply.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
        }
    }
}


const floorId = computed(() => props.floor?.id ?? null)

defineExpose({
    floorId,
    scrollToLastReply,
})
</script>

<style scoped>
/* 楼层容器 */
.floor {
    background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(193, 184, 168, 0.05);
    transition: all 0.3s ease;
}

.floor:hover {
    box-shadow: 0 4px 16px rgba(193, 184, 168, 0.08);
    border-color: #C1B8A8;
}

/* 用户信息区域 */
.user-info {
    border-bottom: 1px solid #C1B8A8;
}

/* 用户名 */
.username {
    color: #4A4A4A;
    font-weight: 600;
}

/* 时间、IP和设备信息 */
.time-info {
    color: #6B7C93;
}

/* 楼层号 */
.floor-number {
    color: #A1A8C1;
    font-weight: 600;
}

/* 内容区域 */
.content {
    color: #4A4A4A;
    line-height: 1.6;
}

/* 展开/收起按钮 */
.expand-button {
    color: #8B9E8B;
    transition: all 0.3s;
}

.expand-button:hover {
    color: #6B7C6B;
}

/* 回复按钮 */
.reply-button {
    color: #8B9E8B;
    transition: all 0.3s;
}

.reply-button:hover {
    color: #6B7C6B;
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

/* 回复列表 */
.replies {
    border-left: 2px solid #C1B8A8;
}

/* 回复项 */
.reply-item {
    background-color: #F8FAFC;
    border-radius: 8px;
    transition: all 0.3s;
}

.reply-item:hover {
    background-color: #F0F4F8;
}

/* 回复展开按钮 */
.replies-expand-button {
    color: #6B7C93;
    transition: all 0.3s;
}

.replies-expand-button:hover {
    color: #A1A8C1;
}

/* 回复分页 */
.replies-pagination {
    margin-top: 1rem;
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

.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
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
.user-info-card {
    @apply transition-all duration-200;
}

.user-info-card:hover .user-name {
    @apply text-[#4A5568];
}

/* 回复区域样式 */
.reply-area {
    @apply bg-[#FAFAF9]/80 rounded-md p-3 transition-all duration-200;
}

.reply-area:hover {
    @apply bg-[#fefffb98];
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
</style> 