<template>
  <el-container class="nk-container">
    <Header />
    <el-main class="content-wrapper">
      <template v-if="isHome">
        <router-view />
      </template>
      <template v-else>
        <transition :name="$route.meta.transition" mode="out-in">
          <router-view />
        </transition>
      </template>
    </el-main>
    <Footer />
  </el-container>

</template>


<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { RouterView, useRoute } from 'vue-router'
import Header from '~/layout/Header.vue'
import Footer from '~/layout/Footer.vue'

const route = useRoute()
const store = useStore()
const isHome = computed(() => route.path === '/')
</script>

<style scoped>
.nk-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* 可选，居中所有页面内容 */
  align-items: center;
  /* 可选，居中所有页面内容 */
  overflow-y: auto;
  padding: 60px 0 0 0;
}


/* 淡入淡出滑动效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 淡入淡出缩放效果 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 淡入淡出水平滑动效果 */
.fade-horizontal-enter-active,
.fade-horizontal-leave-active {
  transition: all 0.5s ease;
}

.fade-horizontal-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-horizontal-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 淡入淡出旋转效果 */
.fade-rotate-enter-active,
.fade-rotate-leave-active {
  transition: all 0.5s ease;
}

.fade-rotate-enter-from {
  opacity: 0;
  transform: rotate(-5deg) scale(0.95);
}

.fade-rotate-leave-to {
  opacity: 0;
  transform: rotate(5deg) scale(1.05);
}

/* 淡入淡出模糊效果 */
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: all 0.5s ease;
}

.fade-blur-enter-from {
  opacity: 0;
  filter: blur(10px);
}

.fade-blur-leave-to {
  opacity: 0;
  filter: blur(10px);
}
</style>
