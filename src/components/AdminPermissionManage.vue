<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-[#6B7C93]">权限管理</h3>
      <div class="flex space-x-2">
        <el-button type="primary" class="morandi-button" @click="handleAddRoleClick">
          <el-icon class="mr-1"><Plus /></el-icon>新建角色
        </el-button>
        <el-button type="primary" class="morandi-button" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="mb-8">
      <h4 class="text-lg font-medium text-[#6B7C93] mb-3">角色列表</h4>
      <el-table
        :data="roles"
        style="width: 100%"
        border
        stripe
        class="morandi-table"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column label="权限数量" width="100">
          <template #default="scope">
            {{ scope.row.permissions ? scope.row.permissions.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button
              size="small"
              class="morandi-view-btn mr-2"
              @click="handleEditRole(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              class="morandi-confirm-btn mr-2"
              @click="handleAssignPermissions(scope.row)"
            >
              分配权限
            </el-button>
            <el-button
              size="small"
              class="morandi-disable-btn"
              @click="handleDeleteRole(scope.row)"
              :disabled="scope.row.id === 1 || scope.row.id === 3"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 权限列表 -->
    <div>
      <h4 class="text-lg font-medium text-[#6B7C93] mb-3">权限列表</h4>
      <el-table
        :data="permissions"
        style="width: 100%"
        border
        stripe
        class="morandi-table"
        v-loading="loading"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" />
      </el-table>
    </div>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="isEdit ? '编辑角色' : '新建角色'"
      width="500px"
      class="morandi-dialog"
      append-to-body
    >
      <el-form :model="roleForm" label-width="80px" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="roleDialogVisible = false">取消</el-button>
          <el-button class="morandi-confirm-btn" @click="submitRoleForm" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="600px"
      class="morandi-dialog"
      append-to-body
    >
      <div v-if="selectedRole" class="permission-assign">
        <div class="mb-4">
          <h4 class="text-lg font-medium text-[#6B7C93] mb-2">{{ selectedRole.name }}</h4>
          <p class="text-[#8B93B1]">{{ selectedRole.description }}</p>
        </div>
        
        <div class="mb-4">
          <el-checkbox
            v-model="selectAll"
            :indeterminate="isIndeterminate"
            @change="handleCheckAllChange"
          >
            全选
          </el-checkbox>
        </div>
        
        <el-divider />
        
        <el-checkbox-group v-model="selectedPermissions" @change="handleCheckedPermissionsChange">
          <div class="grid grid-cols-2 gap-4">
            <el-checkbox
              v-for="permission in permissions"
              :key="permission.id"
              :label="permission.id"
              :disabled="selectedRole.id === 1 && permission.id <= 2"
            >
              <div>
                <div class="font-medium">{{ permission.name }}</div>
                <div class="text-xs text-[#8B93B1]">{{ permission.description }}</div>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="permissionDialogVisible = false">取消</el-button>
          <el-button class="morandi-confirm-btn" @click="savePermissions" :loading="permissionLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 确认删除对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认删除"
      width="400px"
      class="morandi-dialog"
      append-to-body
    >
      <div class="text-[#4A4A4A]">
        确定要删除角色 "{{ selectedRole?.name }}" 吗？此操作不可恢复。
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="morandi-cancel-btn" @click="confirmDialogVisible = false">取消</el-button>
          <el-button class="morandi-disable-btn" @click="confirmDelete" :loading="deleteLoading">确认删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// 定义属性和事件
const props = defineProps({
  roles: {
    type: Array,
    default: () => []
  },
  permissions: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'fetch-roles',
  'fetch-permissions',
  'add-role',
  'update-role',
  'delete-role',
  'assign-permission'
])

// 本地状态
const roleDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const isEdit = ref(false)
const selectedRole = ref(null)
const submitLoading = ref(false)
const deleteLoading = ref(false)
const permissionLoading = ref(false)
const formRef = ref(null)
const selectedPermissions = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)

// 表单数据
const roleForm = ref({
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度应在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    { max: 100, message: '描述长度不能超过 100 个字符', trigger: 'blur' }
  ]
}

// 监听选中角色变化
watch(selectedRole, (newVal) => {
  if (newVal && newVal.permissions) {
    selectedPermissions.value = [...newVal.permissions]
    updateCheckAllStatus()
  } else {
    selectedPermissions.value = []
    selectAll.value = false
    isIndeterminate.value = false
  }
})

// 更新全选状态
function updateCheckAllStatus() {
  if (!props.permissions.length) return
  
  const checkedCount = selectedPermissions.value.length
  selectAll.value = checkedCount === props.permissions.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < props.permissions.length
}

// 全选/取消全选
function handleCheckAllChange(val) {
  selectedPermissions.value = val ? props.permissions.map(item => item.id) : []
  isIndeterminate.value = false
}

// 选中项变化
function handleCheckedPermissionsChange(value) {
  updateCheckAllStatus()
}

// 处理添加角色点击
function handleAddRoleClick() {
  isEdit.value = false
  roleForm.value = {
    name: '',
    description: ''
  }
  roleDialogVisible.value = true
}

// 处理编辑角色
function handleEditRole(role) {
  isEdit.value = true
  selectedRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description
  }
  roleDialogVisible.value = true
}

// 处理删除角色
function handleDeleteRole(role) {
  selectedRole.value = role
  confirmDialogVisible.value = true
}

// 处理分配权限
function handleAssignPermissions(role) {
  selectedRole.value = role
  selectedPermissions.value = role.permissions ? [...role.permissions] : []
  updateCheckAllStatus()
  permissionDialogVisible.value = true
}

// 确认删除
async function confirmDelete() {
  if (!selectedRole.value) return
  
  deleteLoading.value = true
  try {
    emit('delete-role', selectedRole.value.id)
    confirmDialogVisible.value = false
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    deleteLoading.value = false
  }
}

// 提交角色表单
async function submitRoleForm() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑模式
          emit('update-role', selectedRole.value.id, roleForm.value)
        } else {
          // 创建模式
          emit('add-role', roleForm.value)
        }
        roleDialogVisible.value = false
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    } else {
      return false
    }
  })
}

// 保存权限分配
async function savePermissions() {
  if (!selectedRole.value) return
  
  permissionLoading.value = true
  try {
    emit('assign-permission', selectedRole.value.id, selectedPermissions.value)
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存权限失败:', error)
  } finally {
    permissionLoading.value = false
  }
}

// 刷新数据
function refreshData() {
  emit('fetch-roles')
  emit('fetch-permissions')
}
</script>

<style scoped>
/* 莫兰迪风格按钮样式 */
.morandi-view-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-view-btn:hover, .morandi-view-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-view-btn:active, .morandi-view-btn.is-active {
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

.morandi-disable-btn:hover, .morandi-disable-btn:focus {
  background-color: #B28E8E;
  border-color: #B28E8E;
  color: #FFFFFF;
}

.morandi-disable-btn:active, .morandi-disable-btn.is-active {
  background-color: #A37A7A;
  border-color: #A37A7A;
  color: #FFFFFF;
}

.morandi-disable-btn:disabled {
  background-color: #E3E0DB;
  border-color: #E3E0DB;
  color: #A1A8C1;
}

.morandi-cancel-btn {
  background-color: #E3E0DB;
  border-color: #C1B8A8;
  color: #6B7C93;
  transition: all 0.3s ease;
}

.morandi-cancel-btn:hover, .morandi-cancel-btn:focus {
  background-color: #D5D0C8;
  border-color: #B3A99A;
  color: #4A5A70;
}

.morandi-confirm-btn {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.morandi-confirm-btn:hover, .morandi-confirm-btn:focus {
  background-color: #8CA58C;
  border-color: #8CA58C;
  color: #FFFFFF;
}

.morandi-confirm-btn:active, .morandi-confirm-btn.is-active {
  background-color: #7A957A;
  border-color: #7A957A;
  color: #FFFFFF;
}

/* 表格样式优化 */
.morandi-table :deep(.el-table__header) {
  background-color: #F8FAFC;
}

.morandi-table :deep(.el-table__row:hover > td) {
  background-color: #F0F4F8 !important;
}

.morandi-table :deep(.el-table__row) {
  transition: all 0.3s;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #E3E0DB;
  padding-bottom: 15px;
}

:deep(.el-dialog__title) {
  color: #6B7C93;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 20px;
  color: #4A4A4A;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #E3E0DB;
  padding-top: 15px;
}

/* 修复遮罩层问题 */
:deep(.el-overlay) {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  z-index: 2000 !important;
  height: 100% !important;
  width: 100% !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(2px) !important;
}

/* 复选框样式 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
}

:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #A1B5A1;
  border-color: #A1B5A1;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #4A4A4A;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #A1B5A1;
}

:deep(.el-divider) {
  background-color: #E3E0DB;
  margin: 16px 0;
}
</style>