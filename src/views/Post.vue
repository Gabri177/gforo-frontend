<template>
    <div class="mx-auto px-4 py-6 bg-[#E3E0DB] " style="margin-top: 60px;">
        <!-- 标题部分 -->
        <div class="mb-6 backdrop-blur-md bg-white/70 p-6 rounded-2xl shadow-lg">
            <h1 class="text-2xl font-bold text-[#4A4A4A]">{{ originalPost.title }}</h1>
            <div class="mt-2 flex items-center gap-4 text-sm text-[#6B7C93]">
                <span>{{ originalPost.author.name }}</span>
                <span>{{ originalPost.createdAt }}</span>
                <span>{{ originalPost.ipLocation }}</span>
            </div>
        </div>

        <!-- 楼主帖子 -->
        <PostFloor 
            :floor="originalPost"
            :reply-page-size="replyPageSize"
            :enable-content-expand="true"
            :enable-replies-expand="true"
            :enableContentExpand="false"
            @reply="handleReply"
        />

        <!-- 评论列表 -->
        <div class="mt-6 space-y-4">
            <PostFloor 
                v-for="comment in pagedComments" 
                :key="comment.id"
                :floor="comment"
                :reply-page-size="replyPageSize"
                :enable-content-expand="true"
                :enable-replies-expand="true"
                @reply="handleReply"
            />
        </div>

        <!-- 评论分页 -->
        <div class="mt-6 flex justify-center bg-white p-4 rounded-2xl shadow-lg">
            <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="comments.length"
                layout="prev, pager, next"
                background
            />
        </div>

        <!-- 回复对话框 -->
        <el-dialog
            v-model="dialogVisible"
            title="Reply"
            width="500px"
            :close-on-click-modal="false"
            custom-class="morandi-dialog"
        >
            <div class="reply-dialog-content">
                <div class="reply-info mb-4">
                    <span class="text-[#6B7C93]">Reply to: &nbsp;</span>
                    <span class="text-[#4A4A4A] font-medium">{{ currentReplyTo }}</span>
                </div>
                <el-input
                    v-model="newComment"
                    type="textarea"
                    :rows="4"
                    placeholder="Please input your reply..."
                    resize="none"
                    class="reply-textarea"
                />
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
	<div class="fixed bottom-10 right-10 z-50">
        <div class="flex flex-col gap-4">
            <div>
                <LikePost @like="likePostClicked" />
            </div>
            <div>
                <AddPost  @add="addReplyPostClicked" :isFilled="isLikePostFilled" />
            </div>
        </div>
	</div>

	<NewPost ref="newPostRef" v-model:visible="isReplyPostVisible" 
    :confirmButton="false" @publish="publishReplyPost" title="Reply Post" 
    :needReplyTitle="false" />
</template>

<script setup>
import { ref, computed } from 'vue'
import PostFloor from '~/components/PostFloor.vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import AddPost from '~/components/AddPost.vue';
import NewPost from '~/tools/NewPost.vue';
import LikePost from '~/components/LikePost.vue';



// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const replyPageSize = ref(10)

// 展开状态管理
const expandedComments = ref(new Set())

// 回复相关的状态
const dialogVisible = ref(false)
const newComment = ref('')
const currentReplyTo = ref(null)
const replyToReply = ref(null)
const isReplyPostVisible = ref(false)

// 原始推文数据
const originalPost = ref({
    id: 1,
    title: '比赛结束 我宣布lz获胜',
    author: {
        name: '巫戈水',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    },
    content: '比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜',
    createdAt: '2024-03-20 10:00:00',
    ipLocation: '北京',
    device: 'Android',
    floor: 1,
    isExpanded: false,
	createTime: '2024-03-20 10:00:00',
    replies: [
        {
            id: 101,
            author: {
                name: '螺旋式大王二世',
                avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
            },
            content: '宇宙',
            createTime: '2024-03-20 10:01:00',
            ipLocation: '上海',
            isExpanded: false
        },
        {
            id: 102,
            author: {
                name: '左介优林',
                avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
            },
            content: '智齿梗',
            createTime: '2024-03-20 10:02:00',
            ipLocation: '浙江',
            isExpanded: false
        }
    ]
})

// 评论数据
const comments = ref([
    {
        id: 2,
        author: {
            name: '螺旋式大王二世',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        content: '宇宙比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜',
        createdAt: '2024-03-20 10:01:00',
        ipLocation: '上海',
        device: 'Windows',
        floor: 2,
        isExpanded: false,
		createTime: '2024-03-20 10:01:00',
        replies: [
            {
                id: 201,
                author: {
                    name: '巫戈水',
                    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                },
                content: '宇宙比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜',
                createTime: '2024-03-20 10:02:00',
                ipLocation: '北京',
                isExpanded: false
            },
            {
                id: 202,
                author: {
                    name: '左介优林',
                    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                },
                content: '智齿梗',
                createTime: '2024-03-20 10:03:00',
                ipLocation: '浙江',
                isExpanded: false
            }
        ]
    },
	{
        id: 2,
        author: {
            name: '螺旋式大王二世',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        content: '# title\n宇宙比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜',
        createdAt: '2024-03-20 10:01:00',
        ipLocation: '上海',
        device: 'Windows',
        floor: 2,
        isExpanded: false,
		createTime: '2024-03-20 10:01:00',
        replies: [
            {
                id: 201,
                author: {
                    name: '巫戈水',
                    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                },
                content: '宇宙比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜比赛结束 我宣布lz获胜',
                createTime: '2024-03-20 10:02:00',
                ipLocation: '北京',
                isExpanded: false
            },
            {
                id: 202,
                author: {
                    name: '左介优林',
                    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                },
                content: '智齿梗',
                createTime: '2024-03-20 10:03:00',
                ipLocation: '浙江',
                isExpanded: false
            }
        ]
    }
])

// 是否点赞
const isLikePostFilled = ref(false)


const addReplyPostClicked = () => {
    isReplyPostVisible.value = true
}

const publishReplyPost = () => {
    isReplyPostVisible.value = false
}

const likePostClicked = () => {
    console.log("likePostClicked")
    isLikePostFilled.value = !isLikePostFilled.value
}


// 计算当前页的评论
const pagedComments = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return comments.value.slice(start, start + pageSize.value)
})

// 处理回复
const handleReply = (floor, reply) => {
    if (reply == undefined){
        currentReplyTo.value = floor.author.name
    }
    else {
        currentReplyTo.value = reply.author.name
    }
    dialogVisible.value = true
}

// 提交回复
const submitReply = () => {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
    }

    const newReply = {
        id: Date.now(),
        author: {
            name: '当前用户',
            avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
        },
        content: newComment.value,
        createTime: new Date().toLocaleString(),
        ipLocation: '未知',
        isExpanded: false
    }

    if (replyToReply.value) {
        // 回复评论的回复
        // currentReplyTo.value.replies.push(newReply)
        console.log("currentReplyTo", currentReplyTo.value)
    } else {
        // 回复楼层
        // currentReplyTo.value.replies.push(newReply)
        console.log("currentReplyTo", currentReplyTo.value)
    }

    newComment.value = ''
    dialogVisible.value = false
    ElMessage.success('回复成功')
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