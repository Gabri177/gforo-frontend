<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">Carousel Management</h3>
      <el-button type="primary" class="morandi-button" @click="handleAddCarousel">Add Carousel</el-button>
    </div>

    <el-table :data="carouselList" style="width: 100%" border stripe class="morandi-table" v-loading="tableLoading">
      <el-table-column label="Image" width="120">
        <template #default="scope">
          <img :src="scope.row.imageUrl" alt="preview" class="w-20 h-12 object-cover rounded shadow" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="Title" width="180" />
      <el-table-column prop="description" label="Description" />
      <el-table-column prop="targetUrl" label="Target URL" />
      <el-table-column label="Operation" width="200">
        <template #default="scope">
          <el-button size="small" class="morandi-view-btn mr-2" @click="handleEditCarousel(scope.row)">Edit</el-button>
          <el-button size="small" class="morandi-disable-btn" @click="handleDeleteCarousel(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/添加对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditing ? 'Edit Carousel' : 'Add Carousel'" width="600px" append-to-body :align-center="true">
      <el-form :model="form" label-width="100px">
        <el-form-item label="Title">
          <el-input v-model="form.title" placeholder="Enter title" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" placeholder="Enter description" type="textarea" />
        </el-form-item>
        <el-form-item label="Target URL">
          <el-input v-model="form.targetUrl" placeholder="Enter target URL" />
        </el-form-item>
        <el-form-item label="Image URL">
          <el-input v-model="form.imageUrl" placeholder="Enter image URL" />
          <img v-if="form.imageUrl" :src="form.imageUrl" alt="preview" class="mt-2 w-full h-40 object-cover rounded" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-disable-btn" @click="dialogVisible = false">Cancel</el-button>
          <el-button class="morandi-view-btn" @click="handleSaveCarousel">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCarouselList, addCarousel, updateCarousel, deleteCarousel } from '~/api/layoutApi'

const carouselList = ref([])
const tableLoading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({ id: null, imageUrl: '', title: '', description: '', targetUrl: '' })

const fetchCarouselData = async () => {
  tableLoading.value = true
  try {
    const res = await getCarouselList()
    carouselList.value = res || []
    console.log('Carousel数据:', res)
  } catch (error) {
    ElMessage.error(error.message ? error.message : '获取数据失败')
    console.error(error)
  } finally {
    tableLoading.value = false
  }
}

const handleAddCarousel = () => {
  form.value = { id: null, imageUrl: '', title: '', description: '', targetUrl: '' }
  isEditing.value = false
  dialogVisible.value = true
}

const handleEditCarousel = (item) => {
  form.value = { ...item }
  isEditing.value = true
  dialogVisible.value = true
}

const handleDeleteCarousel = async (item) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${item.title}"?`,
      'Confirm Deletion',
      {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    await deleteCarousel(item.id)
    ElMessage.success('删除成功')
    fetchCarouselData()
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') {
      ElMessage.error('删除失败')
      console.error(e)
    } else {
      ElMessage.info('已取消删除')
    }
  }
}


const handleSaveCarousel = async () => {
  try {
    if (isEditing.value) {
      await updateCarousel(form.value)
      ElMessage.success('更新成功')
    } else {
      await addCarousel(form.value)
      ElMessage.success('添加成功')
      carouselList.value.push(form.value)
    }
    dialogVisible.value = false
    fetchCarouselData()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}

onMounted(() => {
  console.log('Carousel管理页面已加载')
  fetchCarouselData()
})
</script>

<style scoped>

/* 莫兰迪风格按钮样式 */
.morandi-view-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-view-btn:hover,
.morandi-view-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-view-btn:active,
.morandi-view-btn.is-active {
  background-color: #7A957A;
  border-color: #7A957A;
  color: #FFFFFF;
}

.morandi-disable-btn {
  background-color: #C1A1A1;
  border-color: #C1A1A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-disable-btn:hover,
.morandi-disable-btn:focus {
  background-color: #B28E8E;
  border-color: #B28E8E;
  color: #FFFFFF;
}

.morandi-disable-btn:active,
.morandi-disable-btn.is-active {
  background-color: #A37A7A;
  border-color: #A37A7A;
  color: #FFFFFF;
}

.morandi-disable-btn:disabled {
  background-color: #E3E0DB;
  border-color: #E3E0DB;
  color: #A1A8C1;
}
</style>
