<template>
    <div class="px-4 py-6 bg-[#E3E0DB] flex-1 flex flex-col justify-between w-full h-full">




        <div>

            <!-- 面包屑导航 -->
            <div class="mb-6">
                <div
                    class="bg-white/60 backdrop-blur-md border border-[#DAD7D2] px-5 py-3 rounded-xl shadow text-sm text-[#6B7C93]">
                    <el-breadcrumb separator="/">
                        <el-breadcrumb-item :to="{ path: '/' }">
                            <span class="flex items-center gap-1">
                                <el-icon>
                                    <HomeFilled />
                                </el-icon>首页
                            </span>
                        </el-breadcrumb-item>
                        <el-breadcrumb-item :to="postsPath">{{ parentTitle }}</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ postsTitle }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
            </div>
            <!-- 标题部分 -->
            <div class="mb-6 backdrop-blur-md bg-white/60 p-6 rounded-2xl shadow-lg">
                <h1 class="text-2xl font-bold text-[#4A4A4A] mb-2">{{ originalPost?.title }}</h1>

                <!-- 楼主帖子 -->
                <PostFloor :isPost="true" :boardId="boardId" :id="'post-' + postId" ref="originalPostRef" v-if="currentPage == 1" :floor="originalPost"
                    :floorNum="0" :reply-page-size="replyPageSize" :enable-content-expand="true"
                    :enable-replies-expand="true" :enableContentExpand="false" @reply="handleReplyPost"
                    @delete="handlePostFloorDeletePost" @report="handlePostFloorReportPost"
                    @edit="handlePostFloorEditPost" />
                <!-- <div class="mt-2 flex items-center gap-4 text-sm text-[#6B7C93]">
                    <span>{{ originalPost?.author.nickname }}</span>
                    <span>{{ formatDate(originalPost?.createTime) }}</span>
                </div> -->
            </div>



            <!-- 评论列表 -->
            <div class="mt-6 space-y-4">
                <PostFloor :isPost="false" :boardId="boardId" v-for="comment, index in pagedComments" :key="comment.id" :id="'comment-' + comment.id"
                    :floorNum="index + 1 + (currentPage - 1) * pageSize" :floor="comment"
                    :reply-page-size="replyPageSize" :enable-content-expand="true" :enable-replies-expand="true"
                    @reply="handleReply" ref="floorRefs" @delete="handlePostFloorDelete" @report="handlePostFloorReport"
                    @edit="handlePostFloorEdit" />
            </div>

        </div>
        <!-- 评论分页 -->
        <div class="bg-white/70 backdrop-blur-md mt-6 flex justify-center p-4 rounded-2xl shadow-lg">
            <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalRows"
                layout="prev, pager, next" @current-change="handleChangePage" background />
        </div>

        <!-- 回复对话框 -->
        <el-dialog v-model="dialogVisible" :title="!isEditting ? 'Reply' : 'Edit Reply'" width="500px"
            :close-on-click-modal="false" custom-class="morandi-dialog">
            <div class="reply-dialog-content">
                <div class="reply-info mb-4" v-if="!isEditting">
                    <span class="text-[#6B7C93]">Reply to: &nbsp;</span>
                    <span class="text-[#4A4A4A] font-medium">{{ currentReplyTo }}</span>
                </div>
                <el-input v-model="newComment" type="textarea" :rows="4" placeholder="Please input your reply..."
                    resize="none" class="reply-textarea" />
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button type="default"
                        @click="dialogVisible = false; isEditting = false; newComment = ''">Cancel</el-button>
                    <el-button type="primary" @click="submitReply">Submit</el-button>
                </span>
            </template>
        </el-dialog>
    </div>

    <!-- 固定 Post -->
    <div class="fixed bottom-10 right-10 z-50">
        <div class="flex flex-col gap-4">
            <div v-if="userStore.isLoggedInState">
                <LikePost @like="likePostClicked" :isFilled = "isLikePostFilled"/>
            </div>
            <div v-if="userStore.isLoggedInState">
                <AddPost @add="addReplyPostClicked" />
            </div>
            <div>
                <ReturnHome @return="handleReturn" />
            </div>
        </div>
    </div>

    <div class="w-full h-full">
        <NewPost ref="newPostRef" v-model:visible="isReplyPostVisible" :confirmButton="false"
            @publish="publishReplyPost" :title="!isEditting ? 'Reply Post' : 'Edit'" :needReplyTitle="isNeedTitle"
            @cancel="isEditting = false" />
    </div>


    <div class="w-full h-full">
        <Hint v-model:visible="isHintVisible" :confirmButton="true" title="Confirm Operation"
            message="Are you sure you wanna delete this ?" @confirm="handleHintConfirm"
            :confirmLoading="isHintLoading" />
    </div>
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
import { getPostByPage, deletePost, updatePost } from '~/api/postAPI';
import { addCommentToPost, addCommentToComment, deleteComment, updateComment } from '~/api/commentAPI';
import { adminDeletePost, adminDeleteComment } from '~/api/adminApi';
import { useRoute, useRouter } from 'vue-router';
import Hint from '~/tools/Hint.vue';
import { useAuthStore } from '~/stores/auth'; 
import { likePost } from '~/api/likeAPI';


// 确认删除
const isHintLoading = ref(false)
const isHintVisible = ref(false)
const hintConfirmAction = ref(() => { })

// 滚动相关
const scrollTargetCommentId = ref(null)
const originalPostRef = ref(null)

// 分页相关
const pageSize = ref(10)
const replyPageSize = ref(10)

// 展开状态管理
const expandedComments = ref(new Set())


// 回复相关的状态
const isNeedTitle = ref(false)
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
const isOperationPost = ref(false)
const commentToPost = reactive({
    entityId: 0,
    content: ''
})
// route
const route = useRoute()
const router = useRouter()
const postId = ref(route.params.postId)
const boardId = ref(route.params.boardId)
const locationEntityId = ref(route.params.entityId)
const locationTargetId = ref(route.params.targetId)
const isPostFloor = ref(route.params.isPostFloor)
const currentPage = ref(route.params.currentPage || 1)
const parentTitle = computed(() =>
    localStorage.getItem('breadcrumb_parentTitle'))
const postsTitle = computed(() => localStorage.getItem('breadcrumb_postsTitle'));
const postsPath = computed(() =>
    localStorage.getItem('breadcrumb_postsPath'))



// 编辑相关
const editEntityType = ref(0) // 0 帖子 1 不是帖子
const editFloorType = ref(0) // 0 楼层 1 楼层评论
const editTargetId = ref(0)
const isEditting = ref(false)

console.log("postId", route.params.postId)
console.log("boardId", boardId.value)

const showDeleteConfirm = (action) => {
    hintConfirmAction.value = action
    isHintVisible.value = true
}

const handleHintConfirm = () => {
    if (!hintConfirmAction.value) return

    isHintLoading.value = true
    hintConfirmAction.value()
}


const handleReturn = () => {
    router.back()
}

// store
const userStore = useUserStore()
const authStore = useAuthStore()
const hasPostDeleteAuth = ref(authStore.hasPermission('post:delete:any') || 
            (authStore.hasPermission('post:delete:board') && authStore.hasBoardId(boardId.value)))
const hasCommentDeleteAuth = ref(authStore.hasPermission('comment:delete:any') ||
            (authStore.hasPermission('comment:delete:board') && authStore.hasBoardId(boardId.value)))
console.log("hasDeletAuth", hasPostDeleteAuth.value, hasCommentDeleteAuth.value)

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

// 删除应该添加提示信息
const handlePostFloorDelete = (comment) => {
    console.log('handlePostFloorDelete', comment?.id)

    showDeleteConfirm(() => {
        if (hasCommentDeleteAuth.value) {
            adminDeleteComment(comment?.id || 0)
              .then(res => {
                    ElMessage.success('Delete success')
                    initPosts(currentPage.value)
                })
              .catch(err => {
                    ElMessage.error(err.message || 'Delete failed')
                })
              .finally(() => {
                    isHintLoading.value = false
                    isHintVisible.value = false
              })
        } else {
            deleteComment(comment?.id || 0)
            .then(res => {
                ElMessage.success('Delete success')
                initPosts(currentPage.value)
            })
            .catch(err => {
                ElMessage.error(err.message || 'Delete failed')
            })
            .finally(() => {
                isHintLoading.value = false
                isHintVisible.value = false
            })
        }
        
    })


}

const handlePostFloorDeletePost = (postOrComment, isFloor) => {
    console.log('handlePostFloorDeletePost', postOrComment.id, isFloor)

    if (isFloor == 0) { // 帖子的删除
        showDeleteConfirm(() => {
            if (hasPostDeleteAuth.value) {
                adminDeletePost(postOrComment.id)
                  .then(res => {
                        ElMessage.success('删除成功')
                        router.back()
                    })
                  .catch(err => {
                        ElMessage.error(err.message || '删除失败')
                    })
                  .finally(() => {
                        isHintLoading.value = false
                        isHintVisible.value = false
                  })
            } else {
                deletePost(postOrComment.id)
                .then(res => {
                    ElMessage.success('删除成功')
                    router.back()
                })
                .catch(err => {
                    ElMessage.error(err.message || '删除失败')
                })
                .finally(() => {
                    isHintLoading.value = false
                    isHintVisible.value = false
                })
            }
            
        })

    }

    if (isFloor == 1) // 帖子的评论删除
        handlePostFloorDelete(postOrComment)

}

const handlePostFloorReportPost = (post, isFloor) => {
    console.log('handlePostFloorReportPost', post?.id, isFloor)
    ElMessage.warning('举报功能暂未实现 post' + isFloor)
}

const handlePostFloorReport = (comment) => {
    console.log('handlePostFloorReport', comment?.id)
    ElMessage.warning('举报功能暂未实现')
}

const handlePostFloorEdit = (floor, isFloor, reply) => { // 不是帖子
    editEntityType.value = 1
    editFloorType.value = isFloor
    isEditting.value = true

    editTargetId.value = floor?.id
    if (isFloor == 0) { // 不是帖子的楼层 1 0
        newPostRef.value.setPostContent("", floor?.content)
        isNeedTitle.value = false
        isReplyPostVisible.value = true;
    } else { // 1 1 不是帖子的楼层评论
        if (!reply) {
            newComment.value = floor?.content
        } else {
            editTargetId.value = reply?.id
            newComment.value = reply?.content
        }
        dialogVisible.value = true
    }
    console.log("editEntityType: ", editEntityType.value +
        " floor: " + editFloorType.value +
        " targetId: ", editTargetId.value)


}

const handlePostFloorEditPost = (floor, isFloor, reply) => {
    editEntityType.value = 0
    editFloorType.value = isFloor
    isEditting.value = true
    editTargetId.value = floor.id
    if (isFloor == 0) { // 帖子的楼层 0 0
        newPostRef.value.setPostContent(floor?.title, floor?.content)
        isNeedTitle.value = true
        isReplyPostVisible.value = true;
    } else { // 帖子的评论 0 1
        if (!reply) {
            newComment.value = floor?.content
        } else {
            editTargetId.value = reply?.id
            newComment.value = reply?.content
        }
        dialogVisible.value = true
    }
    console.log("editEntityType: ", editEntityType.value +
        " floor: " + editFloorType.value +
        " targetId: ", editTargetId.value)

}

const updateCommentChange = (commentId) => {
    console.log("updateCommentChange")
    let content = ''
    if (editFloorType.value == 0)
        content = newPostRef.value.getContent().content
    else
        content = newComment.value

    updateComment(commentId, content)
        .then(res => {
            ElMessage.success('Update success')
            initPosts(currentPage.value)
        })
        .catch(err => {
            ElMessage.error(err.message || 'Update failed')
        })
        .finally(() => {
            isEditting.value = false
            dialogVisible.value = false
            newComment.value = ''
        })
}

const updatePostChange = (postId) => {
    console.log("updatePostChange")
    const content = newPostRef.value.getContent()
    updatePost(postId, content.title, content.content)
        .then(res => {
            ElMessage.success('Update success')
            initPosts(currentPage.value)
        })
        .catch(err => {
            ElMessage.error(err.message || 'Update failed')
        })
        .finally(() => {
            isEditting.value = false
            dialogVisible.value = false
            newComment.value = ''
        })
}

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
    router.replace({
        name: 'PostOfId',
        params: {
            postId: postId.value,
            currentPage: newPage
        }
    })
};

const initPosts = (page) => {
    console.log("initPosts", postId.value, page)
    getPostByPage(postId.value, page, pageSize.value, true)
        .then(res => {
            console.log(res)
            console.log(res.originalPost)
            originalPost.value = res.originalPost
            isLikePostFilled.value = res.originalPost.isLike
            comments.value = res.replies || []
            currentPage.value = res.currentPage
            pageSize.value = 10
            totalRows.value = res.totalRows

        })
        .catch(err => {
            console.log("post not found")
            ElMessage.error(err.message || 'Post not found')
            router.push('/')
        })
}

onMounted(() => {
    console.log("onMounted post page")
    initPosts(currentPage.value)
    if (locationEntityId.value && locationTargetId.value && isPostFloor.value) {
        console.log("locationEntityId.value", locationEntityId.value)
        console.log("locationTargetId.value", locationTargetId.value)
        console.log("isPostFloor.value", isPostFloor.value)
        let trigger = false;
        if (isPostFloor.value == 'true')
            trigger = true
        scrollToFloorComment(trigger, Number(locationEntityId.value), Number(locationTargetId.value))
        // scrollToFloorComment(false, 1, 84)
    } 
    // 注意 滚动到指定位置只需要 先跳转到指定的页面 然后在运行这个函数
    // 而且注意  第一个参数是 是否为Post楼层的  第二个参数是楼层的id 第三个是楼层评论的ID（如果有的话）
    // scrollToFloorComment(false, 11, 19)  // 如果是false 第二个参数 为楼层评论的id 第二个参数为楼层中评论的id
    // scrollToFloorComment(true, 5, 14) // 如果为true 第一个参数为post的id 第二个参数为楼层评论的id
})

// 是否点赞
const isLikePostFilled = ref(false)


const addReplyPostClicked = () => {
    console.log("addReplyPostClicked")
    isNeedTitle.value = false
    isReplyPostVisible.value = true
    isEditting.value = false
    newPostRef.value.clearForm()
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

    if (isEditting.value) {
        if (editFloorType.value == 0 && editEntityType.value == 0)
            updatePostChange(editTargetId.value)
        else
            updateCommentChange(editTargetId.value)
        return
    }
    console.log("publishReplyPost")
    console.log(newPostRef.value.getContent())
    const content = newPostRef.value.getContent().content
    if (content == "") {
        ElMessage.warning('Please input your reply')
        return
    }
    commentToPost.content = content
    commentToPost.entityId = postId
    addCommentToPost(commentToPost.entityId,
        commentToPost.content
    )
        .then(res => {
            console.log(res)
            ElMessage.success('reply success')

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
            ElMessage.error(err.message || 'reply failed')
        })
        .finally(() => {
            newPostRef.value.clearForm()
        })

    isReplyPostVisible.value = false
}

const likePostClicked = async() => {
    console.log("likePostClicked")
    try {
        await likePost(postId.value)
        isLikePostFilled.value = !isLikePostFilled.value
    } catch (err) {
        console.log(err)
        ElMessage.error(err.message ? err.message: 'like failed')
    }
}


// 计算当前页的评论
const pagedComments = computed(() => {
    return comments.value;
})


const handleReplyPost = (floor, reply) => {

    console.log("postId", postId.value)
    console.log("floorId", floor.id)
    console.log("handleReplyPost")
    isOperationPost.value = true
    if (reply == undefined) {
        console.log("具体楼层 帖子的楼层的评论")
        console.log("floor", floor)
        currentReplyTo.value = floor.author.nickname
    }
    else {
        console.log("具体评论 帖子评论的评论")
        console.log("reply", reply)
        currentReplyTo.value = reply.author.nickname
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
        currentReplyTo.value = floor.author.nickname
    }
    else {
        console.log("具体评论 帖子评论的评论")
        console.log("reply to ", reply)
        currentReplyTo.value = reply.author.nickname
        commentToComment.targetUserId = reply.author.id
    }
    commentToComment.entityId = floor.id

    dialogVisible.value = true
}

// 提交回复
const submitReply = () => {

    if (isEditting.value) {
        if (editFloorType.value == 0 && editEntityType.value == 0)
            updatePostChange(editTargetId.value)
        else
            updateCommentChange(editTargetId.value)
        return
    }

    if (!newComment.value.trim()) {
        ElMessage.warning('Please input your reply')
        return
    }
    commentToComment.content = newComment.value
    preCommentToComment.content = newComment.value

    const action = isOperationPost.value
        ? addCommentToComment(preCommentToComment.entityType,
            preCommentToComment.entityId,
            preCommentToComment.targetUserId,
            preCommentToComment.content,
            postId.value
        )
        : addCommentToComment(commentToComment.entityType,
            commentToComment.entityId,
            commentToComment.targetUserId,
            commentToComment.content,
            postId.value
        )

    action.then(res => {
        console.log(res)
        ElMessage.success('Reply success')
        dialogVisible.value = false

        // 👇刷新当前页，不跳页
        initPosts(currentPage.value)



        if (isOperationPost.value) {
            nextTick(() => {
                setTimeout(() => {
                    if (scrollTargetCommentId.value) {
                        const el = document.getElementById('post-' + scrollTargetCommentId.value)
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                    }
                }, 300)
            })
            scrollTargetCommentId.value = postId.value
            nextTick(() => {
                setTimeout(() => {
                    originalPostRef.value.scrollToLastReply()
                    // console.log("评论跳转post")
                    // originalPostRef.value.scrollToReplyWithPage(342)
                }, 300)
            })
        }
        if (!isOperationPost.value) {
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
            console.log("comment to comment")
            nextTick(() => {
                setTimeout(() => {
                    let targetRef = floorRefs.value.find(refEl => refEl?.floorId === scrollTargetCommentId.value)
                    if (targetRef) {
                        console.log("评论跳转comment")
                        targetRef.scrollToLastReply()
                        //targetRef.scrollToReplyWithPage(404)
                    } else {
                        console.warn('找不到对应楼层')
                    }

                }, 300)
            })

        }


    }).catch(err => {
        console.log(err)
        ElMessage.error(err.message || 'Reply failed')
    }).finally(() => {
        newComment.value = ''
        dialogVisible.value = false
        clearCommentToComment()
    })
}

const scrollToFloor = (floorId) => { // 帖子楼层或者评论楼层
    console.log("scrollToFloor", floorId)
    scrollTargetCommentId.value = floorId
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
}

const scrollToFloorComment = (isForPost, floorId, replyId) => {
    scrollToFloor(floorId)
    if (replyId) {
        if (isForPost) {
            scrollTargetCommentId.value = postId.value
            nextTick(() => {
                setTimeout(() => {
                    //originalPostRef.value.scrollToLastReply()
                    console.log("评论跳转post")
                    originalPostRef.value.scrollToReplyWithPage(replyId)
                }, 300)
            })
        }
        if (!isForPost) {
            console.log("comment to comment")
            nextTick(() => {
                setTimeout(() => {
                    let targetRef = floorRefs.value.find(refEl => refEl?.floorId === scrollTargetCommentId.value)
                    if (targetRef) {
                        console.log("评论跳转comment")
                        // targetRef.scrollToLastReply()
                        targetRef.scrollToReplyWithPage(replyId)
                    } else {
                        console.warn('找不到对应楼层')
                    }

                }, 300)
            })

        }
    }
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

/* 面包屑样式 */
:deep(.el-breadcrumb) {
    --el-text-color-regular: #6B7C93;
    font-size: 14px;
    font-weight: 500;
}

:deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;
}

:deep(.el-breadcrumb__separator) {
    margin: 0 6px;
    color: #A1A8C1;
}

:deep(.el-breadcrumb__inner.is-link) {
    color: #6B7C93;
    transition: color 0.2s ease;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
    color: #A1A8C1;
    text-decoration: underline;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: #4A4A4A;
    font-weight: 600;
}
</style>