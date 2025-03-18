<template>
	<div class="container mx-auto px-4 py-6 max-w-[1280px] bg-[#E8EBF0]">
		<!-- 帖子标题 -->
		<div class="bg-white shadow-sm p-4 mb-2 border border-[#D3D7DE] transition-all hover:shadow-md">
			<h1 class="text-xl font-bold text-[#4A5568]">{{ originalPost.title }}</h1>
		</div>
		
		<!-- 楼主帖子 -->
		<div class="bg-white shadow-sm p-4 mb-3 border border-[#D3D7DE] transition-all hover:shadow-md">
			<div class="flex gap-4">
				<!-- 左侧用户信息 -->
				<div class="w-40 flex-shrink-0 flex flex-col items-center justify-center user-info-card">
					<div class="w-full p-4 rounded-lg backdrop-blur-sm bg-[#F8FAFC]/80 border border-[#E2E8F0] shadow-inner">
						<div class="flex flex-col items-center">
							<el-avatar :size="50" :src="originalPost.author.avatar" />
							<div class="mt-2 font-semibold text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-w-full user-name" :title="originalPost.author.name">
								{{ originalPost.author.name }}
							</div>
							<div class="mt-1">
								<el-tag size="small" class="bg-[#E8EBF0] text-[#6B7C93] border-[#D3D7DE]">知名人士</el-tag>
							</div>
						</div>
					</div>
				</div>
				<!-- 右侧内容 -->
				<div class="flex-grow p-4 rounded-lg bg-[#F8FAFC]/60 backdrop-blur-sm border border-[#E2E8F0]">
					<div class="text-base leading-relaxed text-[#4A5568] min-h-[100px] max-h-[500px] custom-scrollbar">
						<div :class="{'line-clamp-3': !originalPost.isExpanded}">
							{{ originalPost.content }}
						</div>
						<div v-if="shouldShowExpandButton(originalPost.content)" class="text-center mt-2">
							<el-button type="primary" link size="small" @click="toggleExpand(originalPost)">
								{{ originalPost.isExpanded ? '收起' : '展开全文' }}
							</el-button>
						</div>
					</div>
					<div class="flex justify-end mt-2">
						<div>
							<el-button type="primary" link>举报</el-button>
							<el-button type="primary" link @click="handleReply(originalPost)">回复</el-button>
						</div>
					</div>
					
					<!-- 楼主的回复列表 -->
					<div v-if="originalPost.replies && originalPost.replies.length > 0" class="mt-4 reply-area">
						<div class="max-h-[300px] overflow-y-auto">
							<div v-for="reply in getPagedReplies(originalPost)" :key="reply.id" 
								class="mb-2 pb-2 border-b border-[#E5E7EB] last:border-b-0">
								<div class="flex items-start justify-between">
									<div class="flex-grow">
										<div class="flex items-start space-x-2">
											<span class="text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-w-[120px] min-w-[50px]" :title="reply.author.name">{{ reply.author.name }}</span>
											<div class="text-[#4A5568] flex-grow">
												<div :class="{'line-clamp-2': !reply.isExpanded}">{{ reply.content }}</div>
												<div v-if="shouldShowExpandButton(reply.content)" class="text-center mt-1">
													<el-button type="primary" link size="small" @click="toggleExpand(reply)">
														{{ reply.isExpanded ? '收起' : '展开' }}
													</el-button>
												</div>
											</div>
										</div>
										<div class="text-xs text-[#718096] mt-1">
											<span>{{ reply.createTime }}</span>
											<span class="ml-3">IP属地：{{ reply.ipLocation }}</span>
										</div>
									</div>
									<el-button type="primary" link size="small" class="ml-4 self-start" @click="handleReply(originalPost, reply)">回复</el-button>
								</div>
							</div>
						</div>
						<!-- 展开/收起按钮 -->
						<div v-if="originalPost.replies.length > 3" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
							<el-button type="primary" link size="small" @click="toggleReplies(originalPost)">
								{{ isRepliesExpanded(originalPost) ? '收起回复' : `展开更多回复(${originalPost.replies.length})` }}
							</el-button>
						</div>
						<!-- 分页器 -->
						<div v-if="isRepliesExpanded(originalPost) && originalPost.replies.length > 10" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
							<el-pagination
								:current-page="getReplyCurrentPage(originalPost.id)"
								:page-size="replyPageSize"
								:total="originalPost.replies.length"
								layout="prev, pager, next"
								small
								@current-change="(page) => handleReplyPageChange(page, originalPost)"
							/>
						</div>
					</div>
					<!-- 楼层信息 -->
					<div class="mt-2 text-sm text-[#718096] border-t pt-2">
						<div class="flex items-center space-x-4">
							<span>{{ originalPost.floor }}楼</span>
							<span>{{ originalPost.createTime }}</span>
							<span class="text-[#A0AEC0]">IP属地：{{ originalPost.ipLocation }}</span>
							<span class="text-[#A0AEC0]">来自{{ originalPost.device }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 评论列表 -->
		<div class="space-y-3">
			<div v-for="(comment, index) in currentPageComments" :key="comment.id" 
				 class="bg-white shadow-sm p-4 border border-[#D3D7DE] transition-all hover:shadow-md">
				<div class="flex gap-4">
					<!-- 左侧用户信息 -->
					<div class="w-40 flex-shrink-0 flex flex-col items-center justify-center user-info-card">
						<div class="w-full p-4 rounded-lg backdrop-blur-sm bg-[#F8FAFC]/80 border border-[#E2E8F0] shadow-inner">
							<div class="flex flex-col items-center">
								<el-avatar :size="40" :src="comment.author.avatar" />
								<div class="mt-2 font-semibold text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate max-w-full user-name" :title="comment.author.name">
									{{ comment.author.name }}
								</div>
							</div>
						</div>
					</div>
					<!-- 右侧评论内容 -->
					<div class="flex-grow p-4 rounded-lg bg-[#F8FAFC]/60 backdrop-blur-sm border border-[#E2E8F0]">
						<div class="text-base leading-relaxed text-[#4A5568] min-h-[100px] max-h-[500px] custom-scrollbar">
							<div :class="{'line-clamp-3': !comment.isExpanded}">
								{{ comment.content }}
							</div>
							<div v-if="shouldShowExpandButton(comment.content)" class="text-center mt-2">
								<el-button type="primary" link size="small" @click="toggleExpand(comment)">
									{{ comment.isExpanded ? '收起' : '展开全文' }}
								</el-button>
							</div>
						</div>
						<!-- 楼层回复列表 -->
						<div v-if="comment.replies && comment.replies.length > 0" class="mt-4 reply-area">
							<div class="max-h-[300px] overflow-y-auto">
								<div v-for="reply in getPagedReplies(comment)" :key="reply.id" 
									class="mb-2 pb-2 border-b border-[#E5E7EB] last:border-b-0">
									<div class="flex items-start justify-between">
										<div class="flex-grow">
											<div class="flex items-start space-x-2">
												<span class="text-[#6B7C93] hover:text-[#4A5568] hover:underline cursor-pointer truncate min-w-[50px] max-w-[120px]" :title="reply.author.name">{{ reply.author.name }}</span>
												<div class="text-[#4A5568] flex-grow">
													<div :class="{'line-clamp-2': !reply.isExpanded}">{{ reply.content }}</div>
													<div v-if="shouldShowExpandButton(reply.content)" class="text-center mt-1">
														<el-button type="primary" link size="small" @click="toggleExpand(reply)">
															{{ reply.isExpanded ? '收起' : '展开' }}
														</el-button>
													</div>
												</div>
											</div>
											<div class="text-xs text-[#718096] mt-1">
												<span>{{ reply.createTime }}</span>
												<span class="ml-3">IP属地：{{ reply.ipLocation }}</span>
											</div>
										</div>
										<el-button type="primary" link size="small" class="ml-4 self-start" @click="handleReply(comment, reply)">回复</el-button>
									</div>
								</div>
							</div>
							<!-- 展开/收起按钮 -->
							<div v-if="comment.replies.length > 3" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
								<el-button type="primary" link size="small" @click="toggleReplies(comment)">
									{{ isRepliesExpanded(comment) ? '收起回复' : `展开更多回复(${comment.replies.length})` }}
								</el-button>
							</div>
							<!-- 分页器 -->
							<div v-if="isRepliesExpanded(comment) && comment.replies.length > 10" class="flex justify-center mt-2 border-t border-[#E5E7EB] pt-2">
								<el-pagination
									:current-page="getReplyCurrentPage(comment.id)"
									:page-size="replyPageSize"
									:total="comment.replies.length"
									layout="prev, pager, next"
									small
									@current-change="(page) => handleReplyPageChange(page, comment)"
								/>
							</div>
						</div>
						<!-- 楼层信息 -->
						<div class="mt-2 text-sm text-[#718096] border-t pt-2 flex justify-between">
							<div class="flex items-center space-x-4">
								<span>{{ (currentPage - 1) * pageSize + index + 2 }}楼</span>
								<span>{{ comment.createTime }}</span>
								<span class="text-[#A0AEC0]">IP属地：{{ comment.ipLocation }}</span>
								<span class="text-[#A0AEC0]">来自{{ comment.device }}</span>
							</div>
							<div>
								<el-button type="primary" link @click="handleReply(comment)">回复</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 分页 -->
			<div class="flex justify-center mt-4 mb-4">
				<el-pagination
					v-model:current-page="currentPage"
					:page-size="pageSize"
					:total="comments.length"
					layout="prev, pager, next"
					@current-change="handlePageChange"
				/>
			</div>
		</div>

		<!-- 回复对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="getReplyDialogTitle"
			width="50%"
		>
			<el-form>
				<el-form-item>
					<el-input
						v-model="newComment"
						type="textarea"
						:rows="4"
						:placeholder="getReplyPlaceholder"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitReply">
						发表回复
					</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const replyPageSize = ref(10) // 修改为10条每页
const replyCurrentPages = ref(new Map()) // 存储每个楼层的当前页码
const expandedReplies = ref(new Set()) // 新增：存储已展开的回复列表

// 展开状态管理
const expandedComments = ref(new Set())

// 回复相关的状态
const dialogVisible = ref(false)
const newComment = ref('')
const currentReplyTo = ref(null)
const replyToReply = ref(null)

// 原始推文数据
const originalPost = ref({
	id: 1,
	title: '比赛结束 我宣布lz获胜',
	author: {
		name: '巫戈水',
		avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
	},
	content: '比赛结束 我宣布lz获胜 😋 这是一段很长的内容，用来测试文本折叠ddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd功能。为了演示这个功能，我们需要添加更多的文字。这段文字会在默认情况下被折叠，用户可以点击展开按钮查看完整内容。这样的设计可以让页面看起来更加整洁，同时又不会丢失任何信息。用户可以根据自己的兴趣选择是否查看全文。这种交互方式在各大社交平台都很常见，可以提升用户体验。',
	createTime: '2023-08-11 17:03',
	floor: 1,
	ipLocation: '广东',
	device: 'iPhone客户端',
	isExpanded: false,
	replies: [
		{
			id: 101,
			author: { name: '路人甲dddddddddddd' },
			content: '支持楼主！这条回复也很长，我们来测试一下回复测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd测试文本折叠dddddddddddddddddddddddddddd中的文本折叠功能。当回复内容超过两行时，系统会自动折叠多余的内容，用户可以通过点击展开按钮来查看完整的回复内容。这样可以保持页面的整洁性，同时又不会丢失任何信息。',
			createTime: '2023-08-11 17:05',
			ipLocation: '广东',
			isExpanded: false
		},
		{
			id: 102,
			author: { name: '路人乙' },
			content: '顶',
			createTime: '2023-08-11 17:06',
			ipLocation: '广东'
		},
		{
			id: 103,
			author: { name: '巫戈水' },
			content: '谢谢支持',
			createTime: '2023-08-11 17:08',
			ipLocation: '广东'
		},
		{
			id: 104,
			author: { name: '围观群众' },
			content: '恭喜楼主',
			createTime: '2023-08-11 17:10',
			ipLocation: '广东'
		}
	]
})

// 评论数据
const comments = ref([
	{
		id: 1,
		author: {
			name: '心问',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '爬。这也是一段很长的评论内容，用来测试评论中的文本折叠功能。当评论内容超过三行时，系统会自动折叠多余的内容。用户ddddddddddddddddddddddddddddddddddddddddddddddddddd可以通过点击展开按钮来查看完整的评论内容。这样的设计既保持了页面的整洁性，又不会丢失任何信息。用户可以根据自己的兴趣选择是否查看全文。',
		createTime: '2023-8-11 11:06',
		ipLocation: '广东',
		device: 'iPhone客户端',
		isExpanded: false,
		replies: [
			{
				id: 201,
				author: { name: '巫戈水' },
				content: '你才爬dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
				createTime: '2023-8-11 11:10',
				ipLocation: '广东'
			},
			{
				id: 202,
				author: { name: '心问' },
				content: '就爬',
				createTime: '2023-8-11 11:15',
				ipLocation: '广东'
			},
			{
				id: 203,
				author: { name: '路人丙' },
				content: '别吵了别吵了',
				createTime: '2023-8-11 11:20',
				ipLocation: '广东'
			},
			{
				id: 204,
				author: { name: '巫戈水' },
				content: '不理你了',
				createTime: '2023-8-11 11:25',
				ipLocation: '广东'
			}
		]
	},
	{
		id: 2,
		author: {
			name: '螺旋式大王二世',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '我支持你',
		createTime: '2023-8-12 02:03',
		ipLocation: '广东',
		device: 'iPhone客户端',
		replies: [
			{
				id: 301,
				author: { name: '巫戈水' },
				content: '感谢支持！',
				createTime: '2023-8-12 02:10',
				ipLocation: '广东'
			},
			{
				id: 302,
				author: { name: '围观群众' },
				content: '+1',
				createTime: '2023-8-12 02:15',
				ipLocation: '广东'
			},
			{
				id: 303,
				author: { name: '螺旋式大王二世' },
				content: '楼主的帖子总是这么有意思',
				createTime: '2023-8-12 02:20',
				ipLocation: '广东'
			},
			{
				id: 304,
				author: { name: '巫戈水' },
				content: '哈哈哈，过奖了',
				createTime: '2023-8-12 02:22',
				ipLocation: '广东'
			},
			{
				id: 305,
				author: { name: '路人丙' },
				content: '这楼的气氛好和谐',
				createTime: '2023-8-12 02:25',
				ipLocation: '广东'
			},
			{
				id: 306,
				author: { name: '心问' },
				content: '楼上的都是老熟人了吧',
				createTime: '2023-8-12 02:30',
				ipLocation: '广东'
			},
			{
				id: 307,
				author: { name: '螺旋式大王二世' },
				content: '是啊，都是常在一起玩的',
				createTime: '2023-8-12 02:32',
				ipLocation: '广东'
			},
			{
				id: 308,
				author: { name: '巫戈水' },
				content: '欢迎新朋友来玩啊',
				createTime: '2023-8-12 02:35',
				ipLocation: '广东'
			},
			{
				id: 309,
				author: { name: '新来的' },
				content: '可以加入你们吗',
				createTime: '2023-8-12 02:38',
				ipLocation: '上海'
			},
			{
				id: 310,
				author: { name: '螺旋式大王二世' },
				content: '当然可以啊，欢迎欢迎',
				createTime: '2023-8-12 02:40',
				ipLocation: '广东'
			},
			{
				id: 311,
				author: { name: '巫戈水' },
				content: '这楼要变成聊天室了😂',
				createTime: '2023-8-12 02:42',
				ipLocation: '广东'
			},
			{
				id: 312,
				author: { name: '路人甲' },
				content: '看你们聊天好有意思',
				createTime: '2023-8-12 02:45',
				ipLocation: '北京'
			}
		]
	},
	{
		id: 3,
		author: {
			name: 'yydultra',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '宇宙',
		createTime: '2023-8-12 04:42',
		ipLocation: '广东',
		device: 'iPhone客户端',
		replies: [
			{
				id: 401,
				author: { name: '巫戈水' },
				content: '宇宙？啥意思',
				createTime: '2023-8-12 04:45',
				ipLocation: '广东'
			},
			{
				id: 402,
				author: { name: 'yydultra' },
				content: '无限大！',
				createTime: '2023-8-12 04:48',
				ipLocation: '广东'
			},
			{
				id: 403,
				author: { name: '路人甲' },
				content: '这层楼的对话好神秘啊',
				createTime: '2023-8-12 04:50',
				ipLocation: '广东'
			}
		]
	},
	{
		id: 4,
		author: {
			name: '左介优林',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '智齿😊😊',
		createTime: '2023-8-12 06:37',
		ipLocation: '广东',
		device: 'iPhone客户端',
		replies: [
			{
				id: 501,
				author: { name: '巫戈水' },
				content: '智齿是什么梗，求科普',
				createTime: '2023-8-12 06:40',
				ipLocation: '广东'
			},
			{
				id: 502,
				author: { name: '左介优林' },
				content: '你不懂，这是一个很深的梗',
				createTime: '2023-8-12 06:42',
				ipLocation: '广东'
			},
			{
				id: 503,
				author: { name: '不知名の小拉垃' },
				content: '我来解释一下，这个梗源于...',
				createTime: '2023-8-12 06:45',
				ipLocation: '广东'
			},
			{
				id: 504,
				author: { name: '左介优林' },
				content: '别说出来，让他自己体会',
				createTime: '2023-8-12 06:47',
				ipLocation: '广东'
			}
		]
	},
	{
		id: 5,
		author: {
			name: '不知名の小拉垃',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '河南拔智齿',
		createTime: '2023-8-12 08:56',
		ipLocation: '广东',
		device: 'iPhone客户端',
		replies: [
			{
				id: 601,
				author: { name: '巫戈水' },
				content: '又是智齿，我感觉自己错过了什么',
				createTime: '2023-8-12 09:00',
				ipLocation: '广东'
			},
			{
				id: 602,
				author: { name: '心问' },
				content: '哈哈哈哈笑死我了',
				createTime: '2023-8-12 09:05',
				ipLocation: '广东'
			}
		]
	},
	{
		id: 6,
		author: {
			name: '追梦人',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '这个帖子真是越来越有意思了，我来补充一个很长的故事。从前有一个人，他总是喜欢在网上发表一些奇奇怪怪的言论。有一天，他遇到了一个同样喜欢发表奇怪言论的人。于是，他们就成为了好朋友。这个故事告诉我们，在互联网上，总能找到志同道合的人。',
		createTime: '2023-8-12 10:15',
		ipLocation: '浙江',
		device: 'Android客户端',
		replies: [
			{
				id: 701,
				author: { name: '巫戈水' },
				content: '你这个故事说的不会就是我吧？',
				createTime: '2023-8-12 10:20',
				ipLocation: '广东'
			},
			{
				id: 702,
				author: { name: '追梦人' },
				content: '不要在意这些细节啦',
				createTime: '2023-8-12 10:25',
				ipLocation: '浙江'
			}
		]
	},
	{
		id: 7,
		author: {
			name: '咖啡与绿茶',
			avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
		},
		content: '楼主说得对，这就是一个值得研究的现象。我们应该深入探讨一下这个问题的本质。这种现象背后可能隐藏着更深层次的社会意义。',
		createTime: '2023-8-12 11:30',
		ipLocation: '北京',
		device: 'Windows客户端',
		replies: [
			{
				id: 801,
				author: { name: '巫戈水' },
				content: '没想到还能引发这么深的思考',
				createTime: '2023-8-12 11:35',
				ipLocation: '广东'
			},
			{
				id: 802,
				author: { name: '咖啡与绿茶' },
				content: '这就是互联网的魅力，一个简单的帖子都能激发这么多讨论',
				createTime: '2023-8-12 11:40',
				ipLocation: '北京'
			},
			{
				id: 803,
				author: { name: '路人丁' },
				content: '楼上说得好，这种讨论才有意义',
				createTime: '2023-8-12 11:45',
				ipLocation: '上海'
			}
		]
	}
])

// 计算当前页的评论
const currentPageComments = computed(() => {
	const start = (currentPage.value - 1) * pageSize.value
	return comments.value.slice(start, start + pageSize.value)
})

// 处理分页变化
const handlePageChange = (page) => {
	currentPage.value = page
	window.scrollTo(0, 0)
}

// 处理回复
const handleReply = (comment, reply = null) => {
	currentReplyTo.value = comment
	replyToReply.value = reply
	dialogVisible.value = true
}

// 提交回复
const submitReply = () => {
	if (!newComment.value.trim()) return

	const reply = {
		id: Date.now(),
		author: {
			name: '当前用户'
		},
		content: newComment.value,
		createTime: new Date().toLocaleString(),
		ipLocation: '广东'
	}

	if (!currentReplyTo.value.replies) {
		currentReplyTo.value.replies = []
	}
	currentReplyTo.value.replies.push(reply)

	newComment.value = ''
	dialogVisible.value = false
	currentReplyTo.value = null
	replyToReply.value = null
}

// 检查是否展开
const isExpanded = (comment) => {
	return expandedComments.value.has(comment.id)
}

// 切换回复展开状态
const toggleReplies = (comment) => {
	if (expandedReplies.value.has(comment.id)) {
		expandedReplies.value.delete(comment.id)
	} else {
		expandedReplies.value.add(comment.id)
	}
}

// 获取回复对话框标题
const getReplyDialogTitle = computed(() => {
	if (!currentReplyTo.value) return '发表回复'
	if (replyToReply.value) {
		return '回复 ' + replyToReply.value.author.name
	}
	return '回复 ' + currentReplyTo.value.author.name
})

// 获取回复输入框占位符
const getReplyPlaceholder = computed(() => {
	if (!currentReplyTo.value) return '请输入回复内容'
	if (replyToReply.value) {
		return '回复 ' + replyToReply.value.author.name + ': '
	}
	return '回复 ' + currentReplyTo.value.author.name + ': '
})

// 获取楼层回复的当前页
const getReplyCurrentPage = (commentId) => {
	return replyCurrentPages.value.get(commentId) || 1
}

// 设置楼层回复的当前页
const setReplyCurrentPage = (commentId, page) => {
	replyCurrentPages.value.set(commentId, page)
}

// 获取楼层回复的分页数据
const getPagedReplies = (comment) => {
	if (!comment.replies) return []
	const isExpanded = expandedReplies.value.has(comment.id)
	
	// 未展开时显示前3条
	if (!isExpanded) {
		return comment.replies.slice(0, 3)
	}
	
	// 展开后，如果总数超过10条，使用分页
	if (comment.replies.length > 10) {
		const currentPage = getReplyCurrentPage(comment.id)
		const start = (currentPage - 1) * replyPageSize.value
		const end = start + replyPageSize.value
		return comment.replies.slice(start, end)
	}
	
	// 展开后，总数不超过10条，显示全部
	return comment.replies
}

// 处理楼层回复的分页变化
const handleReplyPageChange = (page, comment) => {
	setReplyCurrentPage(comment.id, page)
}

// 检查是否需要显示展开按钮
const shouldShowExpandButton = (content) => {
	// 当内容超过50个字符时显示展开按钮
	return content && content.length > 50
}

// 切换展开状态
const toggleExpand = (item) => {
	if (item.isExpanded === undefined) {
		item.isExpanded = true
	} else {
		item.isExpanded = !item.isExpanded
	}
}

// 检查是否已展开
const isRepliesExpanded = (comment) => {
	return expandedReplies.value.has(comment.id)
}
</script>

<style scoped>
/* 主题颜色变量 */
:root {
	--primary-bg: #E8EBF0;
	--secondary-bg: #F8FAFC;
	--border-color: #D3D7DE;
	--text-primary: #4A5568;
	--text-secondary: #6B7C93;
	--text-light: #718096;
	--hover-bg: #EDF2F7;
}

/* 卡片样式 */
.bg-white {
	@apply transition-shadow duration-200;
}

.bg-white:hover {
	@apply shadow-md;
}

/* 按钮样式统一 */
.el-button--primary.is-link {
	@apply text-[#6B7C93] hover:text-[#4A5568] transition-colors duration-200;
}

/* 对话框样式 */
:deep(.el-dialog) {
	@apply bg-[#F8FAFC] border border-[#D3D7DE] rounded-lg shadow-lg;
}

:deep(.el-dialog__header) {
	@apply border-b border-[#D3D7DE] pb-4 mb-4;
}

:deep(.el-dialog__body) {
	@apply py-4;
}

:deep(.el-dialog__footer) {
	@apply border-t border-[#D3D7DE] pt-4 mt-4;
}

/* 输入框样式 */
:deep(.el-input__wrapper) {
	@apply bg-white border-[#D3D7DE] hover:border-[#6B7C93] focus:border-[#4A5568] transition-colors duration-200;
}

/* 分页样式 */
:deep(.el-pagination) {
	--el-pagination-hover-color: #6B7C93;
	--el-pagination-button-color: #4A5568;
	--el-pagination-hover-bg-color: #EDF2F7;
	--el-pagination-button-disabled-color: #A0AEC0;
}

:deep(.el-pagination.is-small .el-pager li) {
	@apply text-xs min-w-[24px] h-6 leading-6;
}

:deep(.el-pagination.is-small .btn-prev),
:deep(.el-pagination.is-small .btn-next) {
	@apply p-0 w-6 h-6;
}

/* 回复区域样式 */
.reply-area {
	@apply bg-gray-50 rounded-md p-3 transition-all duration-200;
}

.reply-area:hover {
	@apply bg-gray-100;
}

/* 滚动条样式 */
.max-h-\\[300px\\] {
	scrollbar-width: thin;
	scrollbar-color: #D3D7DE transparent;
}

.max-h-\\[300px\\]::-webkit-scrollbar {
	width: 6px;
}

.max-h-\\[300px\\]::-webkit-scrollbar-track {
	background: transparent;
}

.max-h-\\[300px\\]::-webkit-scrollbar-thumb {
	background-color: #D3D7DE;
	border-radius: 3px;
}

/* 文本截断样式 */
.line-clamp-2 {
	@apply overflow-hidden;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.line-clamp-3 {
	@apply overflow-hidden;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
}

/* 用户信息样式 */
.user-info {
	@apply transition-all duration-200;
}

.user-info:hover .user-name {
	@apply text-[#4A5568];
}

/* 分隔线样式 */
.border-t {
	@apply border-[#E5E7EB];
}

/* 头像样式 */
:deep(.el-avatar) {
	@apply border-2 border-white shadow-sm;
}

/* 标签样式 */
:deep(.el-tag) {
	@apply transition-colors duration-200;
}

:deep(.el-tag:hover) {
	@apply bg-[#D3D7DE] text-[#4A5568];
}

/* 动画效果 */
.transition-all {
	@apply duration-200 ease-in-out;
}
</style>
