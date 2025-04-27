<template>
    <div class="px-4 py-6 bg-[#E3E0DB] " style="margin-top: 60px;">
        <!-- 标题部分 -->
        <div class="mb-6 backdrop-blur-md bg-white/70 p-6 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-[#4A4A4A]">{{ originalPost?.title }}</h1>
            <div class="mt-2 flex items-center gap-4 text-sm text-[#6B7C93]">
                <span>{{ originalPost?.author.name }}</span>
                <span>{{ formatDate(originalPost?.createTime) }}</span>
            </div>
        </div>

        <!-- 楼主帖子 -->
        <PostFloor :id="'comment-' + postId" ref="originalPostRef" v-if="currentPage == 1" :floor="originalPost" :floorNum="1"
            :reply-page-size="replyPageSize" :enable-content-expand="true" :enable-replies-expand="true"
            :enableContentExpand="false" @reply="handleReplyPost" />

        <!-- 评论列表 -->
        <div class="mt-6 space-y-4">
            <PostFloor v-for="comment, index in pagedComments" :key="comment.id" :id="'comment-' + comment.id"
                :floorNum="index + 2 + (currentPage - 1) * pageSize" :floor="comment" :reply-page-size="replyPageSize"
                :enable-content-expand="true" :enable-replies-expand="true" @reply="handleReply" ref="floorRefs" />
        </div>

        <!-- 评论分页 -->
        <div class="mt-6 flex justify-center bg-white p-4 rounded-2xl shadow-lg">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalRows"
                layout="prev, pager, next" @current-change="handleChangePage" background />
        </div>

        <!-- 回复对话框 -->
        <el-dialog v-model="dialogVisible" title="Reply" width="500px" :close-on-click-modal="false"
            custom-class="morandi-dialog">
            <div class="reply-dialog-content">
                <div class="reply-info mb-4">
                    <span class="text-[#6B7C93]">Reply to: &nbsp;</span>
                    <span class="text-[#4A4A4A] font-medium">{{ currentReplyTo }}</span>
                </div>
                <el-input v-model="newComment" type="textarea" :rows="4" placeholder="Please input your reply..."
                    resize="none" class="reply-textarea" />
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="default" @click="dialogVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="submitReply">Submit</el-button>
                </span>
            </template>
        </el-dialog>
    </div>

    <!-- 固定 Post -->
    <div v-if="userStore.isLoggedInState" class="fixed bottom-10 right-10 z-50">
        <div class="flex flex-col gap-4">
            <div>
                <LikePost @like="likePostClicked" />
            </div>
            <div>
                <AddPost @add="addReplyPostClicked" :isFilled="isLikePostFilled" />
            </div>
            <div>
                <ReturnHome @return="handleReturn"/>
            </div>
        </div>
    </div>

    <NewPost ref="newPostRef" v-model:visible="isReplyPostVisible" :confirmButton="false" @publish="publishReplyPost"
        title="Reply Post" :needReplyTitle="false" />
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import PostFloor from '~/components/PostFloor.vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import AddPost from '~/components/AddPost.vue';
import NewPost from '~/tools/NewPost.vue';
import ReturnHome from '~/components/ReturnHome.vue';
import LikePost from '~/components/LikePost.vue';
import { getPostByPage } from '../api/postAPI';
import { addCommentToPost, addCommentToComment } from '../api/commentAPI';
import { useRoute, useRouter } from 'vue-router';

// 滚动相关
const scrollTargetCommentId = ref(null)
const originalPostRef = ref(null)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const replyPageSize = ref(10)

// 展开状态管理
const expandedComments = ref(new Set())

// 回复相关的状态
const floorRefs = ref([])
const dialogVisible = ref(false)
const newComment = ref('')
const currentReplyTo = ref(null)
const replyToReply = ref(null)
const isReplyPostVisible = ref(false)
const originalPost = ref(null)
const comments = ref([])
const totalRows = ref(0)
const newPostRef = ref(null)
const entityType = ref(1)
const isOperationPost = ref(false)
const commentToPost = reactive({
    entityId: 0,
    content: ''
})
// route
const route = useRoute()
const router = useRouter()
const postId = ref(route.params.postId)
console.log("postId", route.params.postId)

const handleReturn = () => {
    router.back()
}

// store
const userStore = useUserStore()

const preCommentToComment = reactive({
    entityType: 1,
    entityId: 0,
    targetUserId: 0,
    content: ''
})

const commentToComment = reactive({
    entityType: 2,
    entityId: 0,
    targetUserId: 0,
    content: ''
})

const clearCommentToComment = () => {
    commentToComment.entityId = 0
    commentToComment.targetUserId = 0
    commentToComment.content = ''
    preCommentToComment.entityId = 0
    preCommentToComment.targetUserId = 0
    preCommentToComment.content = ''
}


const handleChangePage = (newPage) => {
    // console.log('newPage', newPage);
    initPosts(newPage);
    window.scrollTo(0, 0);
};

const initPosts = (page) => {
    console.log("initPosts", postId.value, page)
    getPostByPage(postId.value, page)
        .then(res => {
            console.log(res)
            console.log(res.originalPost)
            originalPost.value = res.originalPost
            comments.value = res.replies || []
            currentPage.value = res.currentPage
            pageSize.value = 10
            totalRows.value = res.totalRows

        })
        .catch(err => {
            console.log("post not found")
        })
}

onMounted(() => {
    console.log("onMounted post page")
    initPosts(1)
})

// 是否点赞
const isLikePostFilled = ref(false)


const addReplyPostClicked = () => {
    console.log("addReplyPostClicked")
    isReplyPostVisible.value = true
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


const publishReplyPost = () => {
    console.log("publishReplyPost")
    console.log(newPostRef.value.getContent())
    const content = newPostRef.value.getContent().content
    if (content == "") {
        ElMessage.warning('请输入回复内容')
        return
    }
    commentToPost.content = content
    commentToPost.entityId = postId
    addCommentToPost(commentToPost.entityId,
        commentToPost.content
    )
        .then(res => {
            console.log(res)
            ElMessage.success('回复成功')

            const newTotalRows = totalRows.value + 1
            const newPage = Math.ceil(newTotalRows / pageSize.value)
            initPosts(newPage)

            nextTick(() => {
                setTimeout(() => {
                    const commentElements = document.querySelectorAll('[id^="comment-"]')
                    if (commentElements.length > 0) {
                        const lastComment = commentElements[commentElements.length - 1]
                        lastComment.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }, 300) // 稍微等一会，保证列表渲染出来
            })

        })
        .catch(err => {
            console.log(err)
            ElMessage.error('回复失败')
        })
        .finally(() => {
            newPostRef.value.clearForm()
        })

    isReplyPostVisible.value = false
}

const likePostClicked = () => {
    console.log("likePostClicked")
    isLikePostFilled.value = !isLikePostFilled.value
}


// 计算当前页的评论
const pagedComments = computed(() => {
    return comments.value;
})


const handleReplyPost = (floor, reply) => {

    console.log ("postId", postId.value)
    console.log("floorId", floor.id)
    console.log("handleReplyPost")
    isOperationPost.value = true
    if (reply == undefined) {
        console.log("具体楼层 帖子的楼层的评论")
        console.log("floor", floor)
        currentReplyTo.value = floor.author.name
    }
    else {
        console.log("具体评论 帖子评论的评论")
        console.log("reply", reply)
        currentReplyTo.value = reply.author.name
        preCommentToComment.targetUserId = reply.author.id
    }
    preCommentToComment.entityId = floor.id
    dialogVisible.value = true
}

// 处理回复
const handleReply = (floor, reply) => {

    scrollTargetCommentId.value = floor.id
    isOperationPost.value = false
    if (reply == undefined) {
        console.log("具体楼层 帖子的楼层的评论")
        console.log("floor", floor)
        currentReplyTo.value = floor.author.name
    }
    else {
        console.log("具体评论 帖子评论的评论")
        console.log("reply", reply)
        currentReplyTo.value = reply.author.name
        commentToComment.targetUserId = reply.author.id
    }
    commentToComment.entityId = floor.id

    dialogVisible.value = true
}

// 提交回复
const submitReply = () => {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }
    commentToComment.content = newComment.value
    preCommentToComment.content = newComment.value

    const action = isOperationPost.value
        ? addCommentToComment(preCommentToComment.entityType,
            preCommentToComment.entityId,
            preCommentToComment.targetUserId,
            preCommentToComment.content)
        : addCommentToComment(commentToComment.entityType,
            commentToComment.entityId,
            commentToComment.targetUserId,
            commentToComment.content)

    action.then(res => {
        console.log(res)
        ElMessage.success('回复成功')
        dialogVisible.value = false

        // 👇刷新当前页，不跳页
        initPosts(currentPage.value)


        nextTick(() => {
            setTimeout(() => {
                if (scrollTargetCommentId.value) {
                    const el = document.getElementById('comment-' + scrollTargetCommentId.value)
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                }
            }, 300)
        })
        if (isOperationPost.value) {
            scrollTargetCommentId.value = postId.value
            nextTick(() => {
                setTimeout(() => {
                    originalPostRef.value.scrollToLastReply()
                }, 300)
            })
        }
        if (!isOperationPost.value) {
            console.log("comment to comment")
            nextTick(() => {
                setTimeout(() => {
                    let targetRef = floorRefs.value.find(refEl => refEl?.floorId === scrollTargetCommentId.value)
                    if (targetRef) {
                        targetRef.scrollToLastReply()
                    } else {
                        console.warn('找不到对应楼层')
                    }

                }, 300)
            })

        }


    }).catch(err => {
        console.log(err)
        ElMessage.error('回复失败')
    }).finally(() => {
        newComment.value = ''
        dialogVisible.value = false
        clearCommentToComment()
    })
}

</script>

<style scoped>
/* 确保内容区域不会超出屏幕 */
.text-base {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* 分页按钮默认背景 */
:deep(.el-pagination.is-background .el-pager li) {
    background-color: #E3E0DB;
    color: #4A4A4A;
    border: none;
    transition: all 0.3s;
}

/* 激活页 */
:deep(.el-pagination.is-background .el-pager li.is-active) {
    background-color: #A1A8C1;
    color: #fff;
}

/* 上一页、下一页按钮 */
:deep(.el-pagination.is-background button) {
    background-color: #E3E0DB;
    color: #4A4A4A;
    border: none;
    transition: all 0.3s;
}

/* 悬停效果 */
:deep(.el-pagination.is-background button:hover),
:deep(.el-pagination.is-background .el-pager li:hover) {
    background-color: #C1B8A8;
    color: #fff;
}

/* 按钮样式 */
:deep(.el-button--text) {
    color: #6B7C93;
}

:deep(.el-button--text:hover) {
    color: #A1A8C1;
}

/* 输入框样式 */
:deep(.el-textarea__inner) {
    background-color: #F5F5F5;
    border: 1px solid #D4D4D4;
    border-radius: 8px;
    color: #4A4A4A;
    font-size: 14px;
    line-height: 1.6;
    padding: 12px;
    transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
    border-color: #B8B8B8;
    background-color: #F8F8F8;
}

:deep(.el-textarea__inner:focus) {
    border-color: #A1A8C1;
    background-color: #FFFFFF;
    box-shadow: 0 0 0 2px rgba(161, 168, 193, 0.1);
}

:deep(.el-textarea__inner::placeholder) {
    color: #9B9B9B;
}

/* 对话框样式 */
:deep(.el-dialog) {
    background-color: #F5F5F5;
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    margin: 0;
    margin-bottom: -10px;
}



:deep(.el-dialog__body) {
    padding: 10px;
    background-color: #F5F5F5;
}


/* 对话框按钮样式 */
:deep(.el-dialog__footer .el-button) {
    padding: 8px 20px;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s ease;
    padding-top: 10px !important;
}

:deep(.el-dialog__footer .el-button--default) {
    background-color: #E3D5D5;
    border-color: #C1A8A8;
    color: #8B6B6B;
}

:deep(.el-dialog__footer .el-button--default:hover) {
    background-color: #D4C4C4;
    border-color: #B89898;
    color: #8B6B6B;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(193, 168, 168, 0.15);
}

:deep(.el-dialog__footer .el-button--default:active) {
    background-color: #C1A8A8;
    border-color: #A87A7A;
    transform: translateY(0);
}

:deep(.el-dialog__footer .el-button--primary) {
    background-color: #A1A8C1;
    border-color: #7A87A8;
    color: #FFFFFF;
}

:deep(.el-dialog__footer .el-button--primary:hover) {
    background-color: #8A91A8;
    border-color: #7A8198;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(161, 168, 193, 0.15);
}

:deep(.el-dialog__footer .el-button--primary:active) {
    background-color: #7A87A8;
    border-color: #5A6788;
    transform: translateY(0);
}
</style>