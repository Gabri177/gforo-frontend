<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">Announcement Management</h3>
      <div class="flex space-x-2">
        <el-input
          v-model="searchQuery"
          placeholder="Search Announcement"
          class="w-64 morandi-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" class="morandi-button" @click="handleCreateClick">
          <el-icon class="mr-1"><Plus /></el-icon>Add New
        </el-button>
      </div>
    </div>

    <el-table
      :data="filteredAnnouncements"
      style="width: 100%"
      border
      stripe
      class="morandi-table"
      v-loading="loading"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="Title" min-width="180" />
      <el-table-column prop="content" label="Content" min-width="250">
        <template #default="scope">
          <div class="truncate-text">{{ scope.row.content }}</div>
        </template>
      </el-table-column>
      <el-table-column label="Operation" width="200">
        <template #default="scope">
          <el-button size="small" class="morandi-view-btn mr-2" @click="handleEditAnnouncement(scope.row)">
            编辑
          </el-button>
          <el-button size="small" class="morandi-disable-btn" @click="handleDeleteAnnouncement(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-center mt-4">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      />
    </div>

    <!-- 编辑/创建弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'Editorial Bulletin' : 'New announcement'"
      width="600px"
      class="morandi-dialog"
      append-to-body
    >
      <el-form :model="announcementForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="Title" prop="title">
          <el-input v-model="announcementForm.title" placeholder="Please enter a title" />
        </el-form-item>
        <el-form-item label="Content" prop="content">
          <el-input v-model="announcementForm.content" type="textarea" rows="6" placeholder="Please enter content" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button class="morandi-disable-btn" @click="dialogVisible = false">Cancel</el-button>
          <el-button class="morandi-confirm-btn" @click="submitForm" :loading="submitLoading">Confirm</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认删除"
      width="400px"
      class="morandi-dialog"
      append-to-body
    >
      <div class="text-[#4A4A4A]">
        确定要删除公告 "{{ selectedAnnouncement?.title }}" 吗？此操作不可恢复。
      </div>
      <template #footer>
        <span>
          <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
          <el-button class="morandi-disable-btn" @click="confirmDelete" :loading="deleteLoading">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import {
  adminGetNotification,
  adminDeleteNotification,
  adminUpdateNotification,
  adminPublishNotification
} from '~/api/adminApi'

const announcements = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const searchQuery = ref('')
const dialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const isEdit = ref(false)
const selectedAnnouncement = ref(null)
const submitLoading = ref(false)
const deleteLoading = ref(false)
const formRef = ref(null)

const announcementForm = ref({
  title: '',
  content: ''
})

const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为 2~50 字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 5, max: 2000, message: '长度应为 5~2000 字符', trigger: 'blur' }
  ]
}

const filteredAnnouncements = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return query
    ? announcements.value.filter(a =>
        a.title.toLowerCase().includes(query) || a.content.toLowerCase().includes(query))
    : announcements.value
})

async function fetchAnnouncements() {
  loading.value = true
  
  try {
    const res = await adminGetNotification()
    announcements.value = res.notificationList
    total.value = res.totalRows
    console.log(res, "这是公告")
    // announcements.value = res
      // total.value = res.data.data.total
  } catch {
    ElMessage.error('获取公告列表失败')
  } finally {
    loading.value = false
  }
}

function handleCreateClick() {
  isEdit.value = false
  announcementForm.value = { title: '', content: '' }
  dialogVisible.value = true
}

function handleEditAnnouncement(row) {
  isEdit.value = true
  selectedAnnouncement.value = row
  announcementForm.value = { title: row.title, content: row.content }
  dialogVisible.value = true
}

function handleDeleteAnnouncement(row) {
  selectedAnnouncement.value = row
  confirmDialogVisible.value = true
}

async function confirmDelete() {
  try {
    deleteLoading.value = true
    await adminDeleteNotification(selectedAnnouncement.value.id)
    ElMessage.success('删除成功')
    confirmDialogVisible.value = false
    fetchAnnouncements()
  } catch {
    ElMessage.error('删除失败')
  } finally {
    deleteLoading.value = false
  }
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await adminUpdateNotification({ id: selectedAnnouncement.value.id, ...announcementForm.value })
        ElMessage.success('更新成功')
      } else {
        await adminPublishNotification(announcementForm.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      fetchAnnouncements()
    } catch {
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

function handleSizeChange(size) {
  pageSize.value = size
  fetchAnnouncements()
}

function handleCurrentChange(page) {
  currentPage.value = page
  fetchAnnouncements()
}

fetchAnnouncements()
</script>

<style scoped>
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.morandi-view-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #fff;
}

.morandi-disable-btn {
  background-color: #C1A1A1;
  border-color: #C1A1A1;
  color: #fff;
}

.morandi-cancel-btn {
  background-color: #e3e0db;
  border-color: #c1b8a8;
  color: #6B7C93;
}

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #fff;
}
</style>
