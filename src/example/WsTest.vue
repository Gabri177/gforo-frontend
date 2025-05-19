<template>
	<div class="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md space-y-4">
	  <h2 class="text-2xl font-bold text-center">🧪 WebSocket 测试</h2>
  
	  <!-- ✅ 状态显示 -->
	  <div class="text-center font-medium">
		<span
		  :class="{
			'text-green-600': status === 'connected',
			'text-yellow-500': status === 'connecting',
			'text-red-500': status === 'disconnected',
		  }"
		>
		  🔌 当前状态：{{ statusText }}
		</span>
	  </div>
  
	  <div>
		<label class="block mb-2 font-medium">输入消息：</label>
		<input
		  v-model="messageText"
		  @keyup.enter="sendMessage"
		  placeholder="请输入要发送的内容"
		  class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button
		  @click="sendMessage"
		  class="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
		>
		  发送消息
		</button>
	  </div>
  
	  <div>
		<h3 class="text-xl font-semibold mt-6 mb-2">📨 接收到的消息：</h3>
		<div v-if="messages.length === 0" class="text-gray-400">暂无消息</div>
		<ul class="space-y-2">
		  <li
			v-for="(msg, index) in messages"
			:key="index"
			class="bg-gray-100 p-3 rounded"
		  >
			<div><strong>类型：</strong>{{ msg.type }}</div>
			<div><strong>内容：</strong>{{ msg.content }}</div>
			<div class="text-sm text-gray-500 mt-1">
			  {{ msg.timeStamp }}
			</div>
		  </li>
		</ul>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useWebSocketStore } from '~/stores/websocket';
  import { WsMessageType } from '~/utils/ws-types';
  import { getUserInfo } from '~/api/userApi';
  
  const messageText = ref('');
  const messages = ref([]);
  
  const wsStore = useWebSocketStore();
  
  // ✅ 显示连接状态（绑定 store.status）
  const status = computed(() => wsStore.status);
  const statusTextMap = {
	connected: '🟢 已连接',
	connecting: '🕒 正在连接...',
	disconnected: '🔴 已断开',
  };
  const statusText = computed(() => statusTextMap[status.value] || '未知');
  
  // ✅ 发送消息
  function sendMessage() {
	const content = messageText.value.trim();
	if (!content) return;
  
	getUserInfo().then(res => {
	  console.log('用户信息：', res);
	});
  
	wsStore.send({
	  type: WsMessageType.CHAT,
	  content,
	  timeStamp: new Date().toISOString(),
	});
  
	messageText.value = '';
  }
  
  // ✅ 格式化时间戳
  function formatTime(ts) {
	try {
	  const date = new Date(ts);
	  return date.toLocaleString();
	} catch {
	  return ts;
	}
  }
  
  onMounted(() => {
	// ⚠️ 不要调用 connect，这里只监听
	wsStore.on('message', (msg) => {
	  messages.value.unshift(msg);
	});
  });
  
  onUnmounted(() => {
	wsStore.off('message');
  });
  </script>
  