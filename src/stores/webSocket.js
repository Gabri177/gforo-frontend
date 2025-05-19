// 📁 composables/useWebSocket.js
import { ref } from 'vue';
import { defineStore } from 'pinia';
import mitt from 'mitt';
import { getToken } from '~/utils/auth';
import { useNotificationStore } from '~/stores/notification';
import { ElMessage } from 'element-plus';
import { ElNotification } from 'element-plus'

const openSystemNotification = (title, content) => {
  ElNotification({
    title: title ? title : '系统消息',
    message: content ? content : '您有新的消息',
    type: 'info',
  })
}

function getDeviceId() {
	let deviceId = localStorage.getItem('deviceId');
	if (!deviceId) {
		deviceId = crypto.randomUUID();
		localStorage.setItem('deviceId', deviceId);
	}
	return deviceId;
}

const emitter = mitt();

let socket = null;
let heartbeatTimer = null;
let reconnectTimer = null;
let reconnectAttempts = 0; // ✅ 当前重连次数
const MAX_RECONNECT_ATTEMPTS = 3; // ✅ 最多重连次数
const HEARTBEAT_INTERVAL = 10000;

export const useWebSocketStore = defineStore('websocket', () => {
	const status = ref('disconnected'); // connected | connecting | disconnected

	function connect() {
		if (socket && socket.readyState === WebSocket.OPEN) return;

		const token = getToken();
		const deviceId = getDeviceId();
		if (!token || !deviceId) return;

		const wsUrl = `ws://localhost:8081/${deviceId}?token=${token}`;
		socket = new WebSocket(wsUrl);
		status.value = 'connecting';

		socket.onopen = () => {
			status.value = 'connected';
			reconnectAttempts = 0; // ✅ 连接成功重置
			emitter.emit('ws-status', 'connected');
			startHeartbeat();
		};

		socket.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				const notificationStore = useNotificationStore();
				notificationStore.setUnread(true); // 有新通知
				console.log("收到消息：", msg);
        if (msg.type == "SYSTEM_MESSAGE"){
          console.log("收到系统消息：", msg.content);
          const not = JSON.parse(msg.content);
          openSystemNotification(not?.title, not?.content);
        }
				emitter.emit(msg.type, msg);
				emitter.emit('message', msg);
			} catch (e) {
				console.warn('非法消息：', event.data);
			}
		};

		socket.onerror = () => {
			stopHeartbeat();
			try {
				reconnect();
			} catch {
				disconnect();
			}
		};

		socket.onclose = () => {
			console.log('========================[WS] 连接关闭');
			status.value = 'disconnected';
			emitter.emit('ws-status', 'disconnected');
			stopHeartbeat();
			reconnect();
		};
	}

	function disconnect() {
		if (socket) {
			socket.close();
			socket = null;
		}
		stopHeartbeat();
		status.value = 'disconnected';
	}

	function reconnect() {
		clearTimeout(reconnectTimer);

		if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			ElMessage.error('网络异常，请检查连接或稍后再试'); // ✅ 提示用户
			return;
		}

		reconnectAttempts++; // ✅ 增加尝试次数
		console.log(`⚠️ WebSocket 重连第 ${reconnectAttempts} 次`);
		reconnectTimer = setTimeout(() => {
			connect();
		}, 3000);
	}

	function send(msg) {
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify(msg));
		} else {
			console.warn('WebSocket 未连接');
		}
	}

	function startHeartbeat() {
		stopHeartbeat();
		heartbeatTimer = setInterval(() => {
			send({ type: 'ping' });
		}, HEARTBEAT_INTERVAL);
	}

	function stopHeartbeat() {
		clearInterval(heartbeatTimer);
		heartbeatTimer = null;
	}

	function on(type, handler) {
		emitter.on(type, handler);
	}

	function off(type, handler) {
		emitter.off(type, handler);
	}

	return {
		status,
		connect,
		disconnect,
		send,
		on,
		off,
	};
});
