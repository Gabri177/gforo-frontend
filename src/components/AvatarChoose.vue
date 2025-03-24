<template>
  <el-dialog
    v-model="dialogVisible"
    title="Choose your avatar"
    width="50%"
    class="avatar-dialog"
    :close-on-click-modal="false"
  >
    <div class="grid grid-cols-4 gap-4 p-4">
      <div
        v-for="avatar in currentAvatars"
        :key="avatar.id"
        class="flex justify-center items-center rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-[#E3E0DB] hover:border-[#C1B8A8] avatar-card"
        :class="{ 'selected-card': selectedUrl === avatar.url }"
        @click="handleSelect(avatar)"
      >
        <div 
          class="avatar-wrapper"
          :class="{ 'avatar-selected': selectedUrl === avatar.url }"
        >
          <el-avatar 
            :size="80" 
            :src="avatar.url" 
            class="avatar-image"
          />
        </div>
      </div>
    </div>
    
    <div class="flex justify-center mt-6">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="pageSize * totalPages"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAvatarsByPage, getTotalPages } from '~/assets/avatars.js'

const props = defineProps({
  modelValue: Boolean,
  selectedUrl: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentPage = ref(1)
const pageSize = 16
const totalPages = getTotalPages(pageSize)

const currentAvatars = computed(() => {
  return getAvatarsByPage(currentPage.value, pageSize)
})

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleSelect = (avatar) => {
  emit('select', avatar.url)
  dialogVisible.value = false
}

// 添加直接设置图片的方法
const setImgUrl = (url) => {
  if (url) {
    emit('select', url)
  }
}

defineExpose({
  setImgUrl
})
</script>

<style>
/* 对话框样式 */
.avatar-dialog .el-dialog {
  border-radius: 1rem !important;
  border: 1px solid #C1B8A8 !important;
  overflow: hidden !important;
}

.avatar-dialog .el-dialog__header {
  margin: 0 !important;
  padding: 1.25rem !important;
  border-bottom: 1px solid #E3E0DB !important;
  background-color: #FFFFFF !important;
}

.avatar-dialog .el-dialog__title {
  color: #6B7C93 !important;
  font-size: 1.25rem !important;
  font-weight: 600 !important;
}

.avatar-dialog .el-dialog__headerbtn {
  width: 2rem !important;
  height: 2rem !important;
  top: 1rem !important;
  right: 1rem !important;
}

.avatar-dialog .el-dialog__close {
  color: #C1B8A8 !important;
  transition: all 0.3s ease !important;
}

.avatar-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #A1A8C1 !important;
}

.avatar-dialog .el-dialog__body {
  padding: 1.5rem !important;
  background-color: white !important;
}

/* 分页器样式 */
.avatar-dialog .el-pagination.is-background .el-pager li {
  background-color: #F8F6F9 !important;
  color: #7B6E7B !important;
  border: 1px solid #E3E0DB !important;
  transition: all 0.3s ease !important;
}

.avatar-dialog .el-pagination.is-background .el-pager li.is-active,
.avatar-dialog .el-pagination.is-background .el-pager li:hover {
  background-color: #9B8E9B !important;
  color: white !important;
  border-color: #9B8E9B !important;
}

/* 卡片样式 */
.avatar-card {
  background: linear-gradient(135deg, #FFFFFF, #FAFAFA);
  transition: all 0.3s ease;
}

.avatar-card:hover {
  background: #FFFFFF;
  box-shadow: 0 4px 12px rgba(193, 184, 168, 0.08);
}

/* 选中状态的卡片样式 */
.selected-card {
  background: #FFFFFF;
  border: 2px solid #C1B8A8 !important;
  box-shadow: 0 4px 12px rgba(193, 184, 168, 0.08);
}

/* 头像容器和边框样式 */
.avatar-wrapper {
  border: 2px solid #E3E0DB;
  border-radius: 50%;
  padding: 3px;
  transition: all 0.3s ease;
  width: 86px;  /* 80px + 2 * (border + padding) */
  height: 86px; /* 确保宽高相等 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-wrapper:hover {
  border-color: #C1B8A8;
  transform: scale(1.05);
}

.avatar-wrapper.avatar-selected {
  border: 2px solid #C1B8A8;
  transform: scale(1.05);
}

.avatar-image {
  background: transparent !important;
  border-radius: 50%;
  width: 80px !important;  /* 确保大小固定 */
  height: 80px !important;
}

.el-avatar {
  background: transparent !important;
}
</style> 