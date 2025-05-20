<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">Permission Management</h3>
      <div class="flex space-x-2">
        <el-button type="primary" class="morandi-button" @click="handleAddRoleClick">
          <el-icon class="mr-1">
            <Plus />
          </el-icon>Add New Role
        </el-button>
        <el-button type="primary" class="morandi-button" @click="fetchRoleData">Refresh</el-button>
      </div>
    </div>

    <el-table :data="roles" border stripe class="morandi-table" v-loading="loading">
      <!-- <el-table-column prop="id" label="ID" width="80" /> -->
      <el-table-column prop="name" label="Role Name" width="150" />
      <el-table-column prop="description" label="Description" min-width="200" />
      <el-table-column prop="level" label="Level" min-width="200" />
      <el-table-column label="Permission Counts" width="100">
        <template #default="scope">
          {{ scope.row.permissions?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="Operation" width="200">
        <template #default="scope">
          <el-button class="morandi-view-btn" size="small" @click="handleRoleClick(scope.row)">
            {{ (authStore.isSuperAdmin || scope.row.buildin === 0) ? 'Edit' : 'View' }}
          </el-button>

          <el-button v-if="authStore.isSuperAdmin || scope.row.buildin === 0" class="morandi-disable-btn" size="small"
            @click="handleDeleteRole(scope.row.id)">
            Delete
          </el-button>
        </template>
      </el-table-column>



    </el-table>

    <div class="mt-8">
      <h4 class="text-lg font-medium text-[#6B7C93] mb-3">All Permissions</h4>
      <el-table :data="permissions" border stripe class="morandi-table" v-loading="loading">
        <!-- <el-table-column prop="id" label="ID" width="80" /> -->
        <el-table-column prop="name" label="Permission Name" width="150" />
        <el-table-column prop="description" label="Description" min-width="200" />
      </el-table>
    </div>

    <!-- 新建/编辑角色弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Role' : 'New Role'" width="500px" append-to-body
      :align-center="true">
      <el-form :model="form" label-width="80px">
        <el-form-item label="RoleName" >
          <el-input v-model="form.name" :disabled="readOnly"/>
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="form.description" :disabled="readOnly"/>
        </el-form-item>
        <el-form-item label="RoleLevel" >
          <el-input v-model="form.level" :disabled="readOnly"/>
        </el-form-item>
        <el-form-item label="Permissions" >
          <el-checkbox-group v-model="form.permissionIds" @change="handleCheckBoxChange" :disabled="readOnly">
            <el-checkbox v-for="perm in permissions" :key="perm.id" :label="perm.id">
              {{ perm.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="morandi-disable-btn" @click="dialogVisible = false">Cancel</el-button>
        <el-button v-if="!readOnly" class="morandi-confirm-btn" @click="handleSubmit">{{ isEdit ? 'Save' : 'Confirm'
          }}</el-button>
      </template>

    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getRoleDetailList,
  updateRolePermission,
  addRolePermission,
  deleteRole
} from '~/api/permissionApi'
import { useAuthStore } from '~/stores/auth'

// 角色数据
const roles = ref([])
const permissions = ref([])
const loading = ref(false)
const authStore = useAuthStore()

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentRoleId = ref(null)
const form = ref({
  name: '',
  description: '',
  level: 0,
  permissionIds: []
})

const fetchRoleData = async () => {
  loading.value = true
  try {
    const res = await getRoleDetailList()
    roles.value = res.roleDetailsList || []
    permissions.value = res.permissionsList || []
    console.log('角色数据：', roles.value)
    console.log('权限数据：', permissions.value)
  } catch (e) {
    ElMessage.error('获取权限数据失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleCheckBoxChange = (val) => {
  console.log('选中的权限ID:', val)
}

const handleDeleteRole = async (roleId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该角色吗？删除后不可恢复。',
      '警告',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const res = await deleteRole(roleId)
    roles.value = roles.value.filter(role => role.id !== roleId)
    ElMessage.success('角色删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message ? error.message : '删除失败')
    }
  }
}

const handleAddRoleClick = () => {
  isEdit.value = false
  readOnly.value = false
  currentRoleId.value = null
  form.value = {
    name: '',
    description: '',
    level:'',
    permissionIds: []
  }
  dialogVisible.value = true
}




onMounted(() => {
  fetchRoleData()
})

// 点击新建角色
const readOnly = ref(false) // 是否只读（View 模式）

const handleRoleClick = (role) => {
  console.log('点击了角色：', role)
  isEdit.value = true
  currentRoleId.value = role.id
  form.value = {
    name: role.name,
    description: role.description,
    permissionIds: (role.permissions || []).map(p => p.id),
    level: role.level
  }
  console.log("form ", form.value)
  // 如果是超级管理员或非 buildin，可以编辑；否则只读
  readOnly.value = !(authStore.isSuperAdmin || role.buildin === 0)
  dialogVisible.value = true
}


// 点击编辑角色
const handleEditRole = (role) => {
  isEdit.value = true
  currentRoleId.value = role.id
  form.value = {
    name: role.name,
    description: role.description,
    permissionIds: (role.permissions || []).map(p => p.id),
    level: role.level
  }
  dialogVisible.value = true
}

// 提交新建/编辑
const handleSubmit = async () => {
  try {
    if (isEdit.value) {

      console.log('更新角色：', currentRoleId.value, form.value)
      await updateRolePermission(currentRoleId.value, form.value.name, form.value.description, form.value.level, form.value.permissionIds)
      roles.value = roles.value.map(r => {
        if (r.id === currentRoleId.value) {
          return {
            ...r,
            name: form.value.name,
            description: form.value.description,
            permissions: form.value.permissionIds.map(id => ({ id })),
            level: form.value.level
          }
        }
        return r
      })

      ElMessage.success('角色修改成功')
    } else {
      console.log('新建角色：', form.value)
      await addRolePermission(form.value.name, form.value.description, form.value.level, form.value.permissionIds)
      fetchRoleData()
      ElMessage.success('角色创建成功')
    }
    console.log('提交表单：', form.value)
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message ? error.message : '提交失败')
    console.error(e)
  }
}
</script>

<style scoped>
/* checkbox 勾选颜色 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #a1a2bd !important;
  border-color: #aca1bd !important;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #5a4b6c;
}

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


.morandi-cancel-btn {
  background-color: #E3E0DB;
  border-color: #C1B8A8;
  color: #6B7C93;
  transition: all 0.3s ease;
}

.morandi-cancel-btn:hover,
.morandi-cancel-btn:focus {
  background-color: #D5D0C8;
  border-color: #B3A99A;
  color: #4A5A70;
}

.morandi-cancel-btn:active,
.morandi-cancel-btn.is-active {
  background-color: #C7C0B6;
  border-color: #A59B8C;
  color: #3A4A60;
}

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-confirm-btn:hover,
.morandi-confirm-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-confirm-btn:active,
.morandi-confirm-btn.is-active {
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
