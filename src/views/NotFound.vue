<template>
  <div class="w-full h-full flex-1 flex items-center justify-center bg-[#E3E0DB] py-12 px-4">
    <div class="w-full max-w-2xl p-8 border border-[#8E9EAB] backdrop-blur-md bg-white shadow-lg rounded-2xl text-center">
      <div class="space-y-6">
        <!-- 404 图标带动画 -->
        <div class="relative">
          <div class="text-[#8E9EAB] text-9xl font-bold glitch-text" data-text="404">
            404
          </div>
          <div class="mt-2 text-xl font-medium text-[#8E9EAB] tracking-widest glitch-subtitle" data-text="ERROR">
            ERROR
          </div>
        </div>
        
        <!-- 提示文字 -->
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-[#5E6E7B]">
            Page Not Found
          </h2>
          <p class="text-[#8E9EAB]">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <!-- 返回按钮 -->
        <div class="pt-6">
          <el-button 
            type="primary" 
            class="!bg-[#8E9EAB] !border-[#5E6E7B] hover:!bg-[#5E6E7B] transition-all duration-300"
            @click="$router.push('/')"
          >
            Back to Home
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style scoped>
/* 按钮悬停效果 */
:deep(.el-button--primary) {
  color: white !important;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(142, 158, 171, 0.2);
}

:deep(.el-button--primary:active) {
  transform: translateY(0);
  background-color: #4A5A67 !important;
  border-color: #4A5A67 !important;
}

/* 卡片悬停效果 */
.backdrop-blur-md {
  transition: all 0.3s ease;
}

.backdrop-blur-md:hover {
  box-shadow: 0 8px 20px rgba(142, 158, 171, 0.15);
  transform: translateY(-2px);
}

/* Glitch 文字动画效果 */
.glitch-text {
  position: relative;
  animation: glitch 3s infinite;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.6;
}

.glitch-text::before {
  animation: glitch-effect 3s infinite;
  color: #E6B8B8;  /* 莫兰迪红色 */
  clip: rect(44px, 450px, 56px, 0);
  text-shadow: 2px 0 #D19999;  /* 深一点的莫兰迪红 */
}

.glitch-text::after {
  animation: glitch-effect 3s infinite reverse;
  color: #E6D5B8;  /* 莫兰迪黄色 */
  clip: rect(44px, 450px, 56px, 0);
  text-shadow: -2px 0 #D1BC99;  /* 深一点的莫兰迪黄 */
}

/* 副标题动画 */
.glitch-subtitle {
  opacity: 0;
  animation: fade-in-out 2s ease-in-out infinite;
  letter-spacing: 0.5em;
  color: #B8C4E6;  /* 莫兰迪蓝色 */
}

@keyframes glitch {
  0% {
    transform: translate(0);
  }
  20% {
    transform: translate(-2px, 2px);
  }
  40% {
    transform: translate(-2px, -2px);
  }
  60% {
    transform: translate(2px, 2px);
  }
  80% {
    transform: translate(2px, -2px);
  }
  100% {
    transform: translate(0);
  }
}

@keyframes glitch-effect {
  0% {
    clip: rect(42px, 450px, 54px, 0);
    opacity: 0.9;
  }
  5% {
    clip: rect(12px, 450px, 78px, 0);
    opacity: 0.85;
  }
  10% {
    clip: rect(48px, 450px, 92px, 0);
    opacity: 0.9;
  }
  15% {
    clip: rect(42px, 450px, 78px, 0);
    opacity: 0.95;
  }
  20% {
    clip: rect(63px, 450px, 72px, 0);
    opacity: 1;
  }
  25% {
    clip: rect(34px, 450px, 90px, 0);
    opacity: 1;
  }
  30% {
    clip: rect(86px, 450px, 92px, 0);
    opacity: 0.95;
  }
  35% {
    clip: rect(25px, 450px, 61px, 0);
    opacity: 0.9;
  }
  40% {
    clip: rect(0);
    opacity: 0.85;
  }
  100% {
    clip: rect(0);
    opacity: 0.9;
  }
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0.3;
    letter-spacing: 0.5em;
  }
  50% {
    opacity: 1;
    letter-spacing: 0.8em;
  }
}

/* 添加悬停效果 */
.glitch-text:hover {
  animation: none;
}

.glitch-text:hover::before {
  color: #D19999;  /* 更深的莫兰迪红 */
  text-shadow: 2px 0 #BF8080;
}

.glitch-text:hover::after {
  color: #D1BC99;  /* 更深的莫兰迪黄 */
  text-shadow: -2px 0 #BFA980;
}

/* 修改卡片和按钮颜色以配合新的配色 */
:deep(.el-button--primary) {
  background-color: #B8C4E6 !important;  /* 莫兰迪蓝色 */
  border-color: #99A6D1 !important;      /* 深莫兰迪蓝色 */
}

:deep(.el-button--primary:hover) {
  background-color: #99A6D1 !important;
  box-shadow: 0 2px 12px rgba(184, 196, 230, 0.3);
}

:deep(.el-button--primary:active) {
  background-color: #8091BF !important;
  border-color: #8091BF !important;
}
</style> 