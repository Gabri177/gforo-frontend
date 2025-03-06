<template>
  <el-container class="nk-container">
    <Header />
    <template v-if="isHome">
      <router-view />
    </template>
    <template v-else>
      <transition :name="$route.meta.transition" mode="out-in">
        <router-view />
      </transition>
    </template>
    <Footer />
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { RouterView, useRoute } from 'vue-router'
import Header from '~/components/Header.vue'
import Footer from '~/components/Footer.vue'

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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
