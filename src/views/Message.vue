<template>
	<div class="w-full h-full flex-1 flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8">
		<div class="w-full h-full flex justify-center items-center">
			<div class="w-3/4 p-8 border border-[#B5A8B5] backdrop-blur-md bg-white shadow-lg rounded-2xl">
				<div class="flex flex-col h-[600px]">
					<!-- 标题 -->
					<h2 class="text-2xl font-bold text-[#6B8368] mb-6">Messages</h2>

					<div class="flex h-full gap-4">
						<!-- 左侧联系人列表 -->
						<div class="w-1/3 border border-[#A5B8A3] rounded-xl overflow-hidden h-[550px]">
							<div class="p-4 bg-[#F8FAF8] border-b border-[#A5B8A3]">
								<el-input
									v-model="searchQuery"
									placeholder="Search contacts"
									class="morandi-input"
									clearable
								>
									<template #prefix>
										<el-icon class="text-[#8BA888]"><Search /></el-icon>
									</template>
								</el-input>
							</div>
							
							<div class="overflow-y-auto h-[calc(100%-64px)]">
								<div 
									v-for="contact in contacts" 
									:key="contact.id"
									:class="[
										'p-4 cursor-pointer hover:bg-[#F8FAF8] transition-colors duration-300 group flex items-center min-h-[80px]',
										selectedContact?.id === contact.id ? 'bg-[#F8FAF8]' : ''
									]"
									@click="selectContact(contact)"
								>
									<div class="flex items-center w-full">
										<div class="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8BA888] shrink-0">
											<img 
												:src="contact.avatar || '/default-avatar.png'"
												alt="avatar"
												class="w-full h-full object-cover"
											>
										</div>
										<div class="ml-3 flex-1">
											<div class="flex items-center justify-between">
												<div>
													<span class="font-medium text-[#6B8368] block">{{ contact.name }}</span>
													<p class="text-sm text-[#8BA888] truncate mt-1">{{ contact.lastMessage }}</p>
												</div>
												<div class="flex items-center gap-2 ml-2 shrink-0">
													<span class="text-xs text-[#8BA888]">{{ contact.lastTime }}</span>
													<el-button
														type="text"
														class="!p-1 opacity-0 group-hover:opacity-100 transition-opacity !h-8 !w-8 flex items-center justify-center"
														@click.stop="closeChat(contact.id)"
													>
														<el-icon class="text-[#8E9EAB] hover:text-[#6E7E8B]"><Close /></el-icon>
													</el-button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<!-- 右侧聊天区域 -->
						<div class="flex-1 border border-[#A5B8A3] rounded-xl flex flex-col h-[550px]">
							<template v-if="selectedContact">
								<!-- 聊天头部 -->
								<div class="shrink-0 p-4 bg-[#F8FAF8] border-b border-[#A5B8A3]">
									<div class="flex items-center">
										<div class="w-10 h-10 rounded-full overflow-hidden border-2 border-[#8BA888]">
											<img 
												:src="selectedContact.avatar || '/default-avatar.png'"
												alt="avatar"
												class="w-full h-full object-cover"
											>
										</div>
										<span class="ml-3 font-medium text-[#6B8368]">{{ selectedContact.name }}</span>
									</div>
								</div>

								<!-- 消息列表区域 -->
								<div class="flex-1 min-h-0">
									<div 
										ref="messageListRef"
										class="h-full overflow-y-auto p-4 space-y-4"
									>
										<div 
											v-for="message in messages" 
											:key="message.id"
											:class="[
												'flex',
												message.isSelf ? 'justify-end' : 'justify-start'
											]"
										>
											<div 
												:class="[
													'max-w-[70%] rounded-lg p-3',
													message.isSelf ? 'bg-[#8BA888] text-white' : 'bg-[#F8FAF8] text-[#6B8368] border border-[#A5B8A3]'
												]"
											>
												{{ message.content }}
												<div 
													:class="[
														'text-xs mt-1',
														message.isSelf ? 'text-[#F8FAF8]' : 'text-[#8BA888]'
													]"
												>
													{{ message.time }}
												</div>
											</div>
										</div>
									</div>
								</div>

								<!-- 输入框区域 -->
								<div class="shrink-0 p-4 border-t border-[#A5B8A3]">
									<div class="flex items-start gap-2">
										<div class="flex-1">
											<el-input
												v-model="messageInput"
												type="textarea"
												:rows="3"
												placeholder="Type your message..."
												class="morandi-input w-full mt-1"
											/>
										</div>
										<el-button
											class="!w-24 !h-[82px] flex items-center justify-center"
											:disabled="!messageInput.trim()"
											@click="sendMessage"
											type="primary"
										>
											<div class="flex flex-col items-center gap-2">
												<el-icon class="text-xl"><Position /></el-icon>
												<span>Send</span>
											</div>
										</el-button>
									</div>
								</div>
							</template>

							<!-- 未选择联系人时的提示 -->
							<template v-else>
								<div class="h-full flex items-center justify-center text-[#8BA888]">
									Select a contact to start chatting
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Search, Position, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const selectedContact = ref(null)
const messageInput = ref('')
const messageListRef = ref(null)

// 模拟联系人数据
const contacts = ref([
	{
		id: 1,
		name: 'John Doe',
		avatar: null,
		lastMessage: 'Hello, how are you?',
		lastTime: '10:30'
	},
	{
		id: 2,
		name: 'Jane Smith',
		avatar: null,
		lastMessage: 'See you tomorrow!',
		lastTime: '09:15'
	}
	
])

// 模拟消息数据
const messages = ref([
	{
		id: 1,
		content: 'Hi there!',
		time: '10:30',
		isSelf: false
	},
	{
		id: 2,
		content: 'Hello! How are you?',
		time: '10:31',
		isSelf: true
	}
])

const selectContact = (contact) => {
	selectedContact.value = contact
}

// 滚动到底部的方法
const scrollToBottom = async () => {
	await nextTick()
	if (messageListRef.value) {
		const container = messageListRef.value
		container.scrollTop = container.scrollHeight
	}
}

const sendMessage = () => {
	if (!messageInput.value.trim()) return
	
	messages.value.push({
		id: Date.now(),
		content: messageInput.value,
		time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		isSelf: true
	})
	
	messageInput.value = ''
	scrollToBottom()  // 发送消息后滚动到底部
}

// 监听消息列表变化
watch(messages, () => {
	scrollToBottom()
}, { deep: true })

const closeChat = (contactId) => {
	// 如果关闭的是当前选中的对话，清空选中状态
	if (selectedContact.value?.id === contactId) {
		selectedContact.value = null
		messages.value = [] // 清空当前消息
	}
	
	// 从联系人列表中移除该联系人
	contacts.value = contacts.value.filter(contact => contact.id !== contactId)
	
	// 可以添加一个提示
	ElMessage({
		message: 'Chat closed successfully',
		type: 'success'
	})
}
</script>

<style scoped>
/* 现代莫兰迪配色系统 */
:root {
	/* 主要紫色 */
	--morandi-purple-light: #D8D0DB;  /* 最浅紫色 */
	--morandi-purple: #9B8E9B;        /* 中紫色 */
	--morandi-purple-dark: #7B6E7B;   /* 深紫色 */
	
	/* 辅助绿色 */
	--morandi-green-light: #D0DBD0;   /* 最浅绿色 */
	--morandi-green: #8BA888;         /* 中绿色 */
	--morandi-green-dark: #6B8368;    /* 深绿色 */
	
	/* 背景色 */
	--bg-light: #F8F6F9;             /* 内容区背景 */
}

/* 输入框样式 */
.morandi-input :deep(.el-input__wrapper) {
	background-color: var(--bg-light);
	border: 1px solid var(--morandi-purple);
	border-radius: 8px;
	box-shadow: none;
	transition: all 0.3s ease;
}

.morandi-input :deep(.el-input__wrapper:hover) {
	border-color: var(--morandi-purple-dark);
	background-color: #F1EFF2;
}

.morandi-input :deep(.el-input__wrapper.is-focus) {
	border-color: var(--morandi-purple);
	box-shadow: 0 0 0 1px var(--morandi-purple);
}

/* 消息气泡样式 */
.message-bubble-self {
	background-color: var(--morandi-green);
	color: white;
}

.message-bubble-other {
	background-color: var(--bg-light);
	color: var(--morandi-purple-dark);
	border: 1px solid var(--morandi-purple-light);
}

/* 莫兰迪蓝色按钮样式 */
:deep(.el-button--primary) {
	background-color: #8E9EAB !important;  /* 莫兰迪蓝 */
	border-color: #8E9EAB !important;
	color: white !important;
	transition: all 0.3s ease !important;
}

:deep(.el-button--primary:hover) {
	background-color: #6E7E8B !important;  /* 深莫兰迪蓝 */
	border-color: #6E7E8B !important;
	box-shadow: 0 2px 12px rgba(110, 126, 139, 0.2) !important;
}

:deep(.el-button--primary:active) {
	background-color: #5A6A77 !important;  /* 更深莫兰迪蓝 */
	border-color: #5A6A77 !important;
	transform: translateY(1px);
}

:deep(.el-button--primary:disabled) {
	background-color: #A8B8C5 !important;  /* 浅莫兰迪蓝 */
	border-color: #A8B8C5 !important;
	opacity: 0.7;
	cursor: not-allowed;
	box-shadow: none !important;
}

:deep(.el-button--primary:focus) {
	outline: none !important;
	box-shadow: 0 0 0 2px rgba(142, 158, 171, 0.2) !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
	width: 6px;
}

::-webkit-scrollbar-track {
	background: var(--bg-light);
}

::-webkit-scrollbar-thumb {
	background: linear-gradient(var(--morandi-purple-light), var(--morandi-green-light));
	border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
	background: linear-gradient(var(--morandi-purple), var(--morandi-green));
}

/* 联系人列表项悬停效果 */
.contact-item:hover {
	background: linear-gradient(to right, var(--bg-light), var(--bg-light));
}

/* 选中状态 */
.contact-item.selected {
	background: linear-gradient(to right, var(--morandi-purple-light), var(--morandi-green-light));
}

/* 关闭按钮样式 */
:deep(.el-button--text) {
	border: none !important;
	background: transparent !important;
}

:deep(.el-button--text:hover) {
	background-color: rgba(142, 158, 171, 0.1) !important;
	border-radius: 4px;
}

:deep(.el-button--text:active) {
	background-color: rgba(142, 158, 171, 0.2) !important;
}

/* 确保图标在按钮中居中 */
:deep(.el-button--text .el-icon) {
	margin: 0 !important;
}
</style>