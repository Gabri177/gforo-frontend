import { getToken, refreshAccessToken } from '~/utils/auth';
import { useUserStore } from '~/stores/user';
import mitt from 'mitt';
import { WsMessageType } from './ws-types';
import { ElMessage } from 'element-plus';

const emitter = mitt();

let socket = null;
let reconnectTimer = null;
let heartbeatTimer = null;
let manualClose = false;
const HEARTBEAT_INTERVAL = 10000;

let isRefreshing = false;

export function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

function getWsUrl() {
  const token = getToken();
  const deviceId = getDeviceId();
  return `ws://localhost:8081/${deviceId}?token=${token}`;
}

export function connectWebSocket() {
  emitter.emit('ws-status', 'connecting');
  const userStore = useUserStore();
  // if (!userStore.isLoggedInState){
  //   console.log('未登录，跳过 WebSocket 连接');
  //   return; // 跳过 WebSocket 连接
  // }
  const userId = userStore.userInfo?.id;
  const token = getToken();

  if (!token || !userId) {
    console.warn('未登录，跳过 WebSocket 连接');
    return;
  }

  const url = getWsUrl();
  console.log('🔌 尝试连接 WebSocket：', url);
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('🟢 WebSocket 连接成功');
    manualClose = false;
    startHeartbeat();
    emitter.emit('ws-status', 'connected');
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === WsMessageType.PONG) {
        console.log('💓 收到 pong');
      } else {
        console.log('📥 收到消息：', msg);
        emitter.emit(msg.type, msg);
        emitter.emit('message', msg); // 所有类型统一入口
      }
    } catch (e) {
      console.warn('收到非法消息：', event.data);
    }
  };

  socket.onerror = async () => {
    //console.warn('WebSocket 错误，尝试刷新 token 后重连');
    stopHeartbeat();
    if (!manualClose && !isRefreshing) {
      isRefreshing = true;
      try {
        //await refreshAccessToken();
        reconnectWebSocket();
        // ElMessage.success('重连成功');
      } catch {
        // console.error('refresh token 失败，自动退出登录');
        // const userStore = useUserStore();
        // userStore.clearUserInfo();
      } finally {
        isRefreshing = false;
      }
    }
  };

  socket.onclose = () => {
    console.log('🔌 WebSocket 已断开');
    stopHeartbeat();
    emitter.emit('ws-status', 'disconnected');
    if (!manualClose) reconnectWebSocket();
  };
}

function reconnectWebSocket() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    console.log('🔁 尝试重连 WebSocket...');
    connectWebSocket();
  }, 3000);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    send({ type: WsMessageType.PING });
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

export function closeWebSocket() {
  manualClose = true;
  stopHeartbeat();
  if (socket) socket.close();
  socket = null;
}

export function send(msg) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('WebSocket 未连接，消息未发送：', msg);
    return;
  }
  socket.send(JSON.stringify(msg));
}

export function onWsMessage(type, handler) {
  emitter.on(type, handler);
}

export function offWsMessage(type, handler) {
  emitter.off(type, handler);
}
