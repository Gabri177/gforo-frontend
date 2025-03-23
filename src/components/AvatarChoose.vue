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
        class="flex justify-center items-center bg-[#F8F6F9] hover:bg-white border border-[#E3E0DB] hover:border-[#B5A8B5] rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1"
        :class="{ 'border-[#9B8E9B] bg-white shadow-md -translate-y-1': selectedUrl === avatar.url }"
        @click="handleSelect(avatar)"
      >
        <el-avatar :size="80" :src="avatar.url" />
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
  border: 1px solid #B5A8B5 !important;
  overflow: hidden !important;
}

.avatar-dialog .el-dialog__header {
  margin: 0 !important;
  padding: 1.25rem !important;
  border-bottom: 1px solid #E3E0DB !important;
  background-color: #F8F6F9 !important;
}

.avatar-dialog .el-dialog__title {
  color: #7B6E7B !important;
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
  color: #B5A8B5 !important;
  transition: all 0.3s ease !important;
}

.avatar-dialog .el-dialog__headerbtn:hover .el-dialog__close {
  color: #9B8E9B !important;
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
</style> 