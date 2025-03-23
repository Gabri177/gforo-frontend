<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8" style="margin-top: 60px;">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-3/4 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-[#6B7C93] mb-8">Settings</h2>

          <el-tabs class="morandi-tabs">
            <!-- 个人资料设置 -->
            <el-tab-pane label="Profile">
              <el-form 
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-position="top"
              >
                <!-- 头像Url设置 -->
                <div class="mb-6">
                  <label class="block text-[#6B7C93] mb-2">Avatar</label>
                  <div class="flex flex-col items-center">
                    <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-[#A1A8C1] cursor-pointer" @click="showAvatarDialog = true">
                      <img 
                        :src="profileForm.headerUrl || '/default-avatar.png'" 
                        alt="avatar"
                        class="w-full h-full object-cover"
                      >
                    </div>
                    <div class="flex flex-col mt-2 justify-center items-center">
                      <div class="text-[#6B7C93] text-sm font-medium mb-2">
                        Set your own avatar
                      </div>
                      <el-input
                        v-model="customUrl"
                        placeholder="Input image URL"
                        class="ml-2 mt-2 w-64"
                      >
                        <template #append>
                          <el-button @click="previewCustomUrl">Preview</el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>

                <!-- 基本信息表单 -->
                <el-form-item label="Username" prop="username">
                  <el-input 
                    v-model="profileForm.username"
                    class="morandi-input"
                  />
                </el-form-item>

                <el-form-item label="Email" prop="email">
                  <el-input 
                    v-model="profileForm.email"
                    class="morandi-input"
                  />
                </el-form-item>

                <el-form-item label="Bio" prop="bio">
                  <el-input 
                    v-model="profileForm.bio"
                    type="textarea"
                    rows="4"
                    class="morandi-input"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- 安全设置 -->
            <el-tab-pane label="Security">
              <el-form 
                ref="securityFormRef"
                :model="securityForm"
                :rules="securityRules"
                label-position="top"
              >
                <el-form-item label="Current Password" prop="currentPassword">
                  <el-input 
                    v-model="securityForm.currentPassword"
                    type="password"
                    class="morandi-input"
                  />
                </el-form-item>

                <el-form-item label="New Password" prop="newPassword">
                  <el-input 
                    v-model="securityForm.newPassword"
                    type="password"
                    class="morandi-input"
                  />
                </el-form-item>

                <el-form-item label="Confirm Password" prop="confirmPassword">
                  <el-input 
                    v-model="securityForm.confirmPassword"
                    type="password"
                    class="morandi-input"
                  />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>

          <!-- 保存按钮 -->
          <div class="mt-8 flex justify-end space-x-4">
            <el-button 
              class="morandi-button-secondary"
              @click="router.back()"
            >
              Cancel
            </el-button>
            <el-button 
              type="primary"
              class="morandi-button"
              :loading="loading"
              @click="handleSave"
            >
              Save Changes
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 将 AvatarChoose 组件移到这里 -->
  <AvatarChoose
    ref="avatarChooseRef"
    v-model="showAvatarDialog"
    :selected-url="profileForm.headerUrl"
    @select="handleAvatarSelect"
  />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import AvatarChoose from '~/components/AvatarChoose.vue'

const router = useRouter()
const loading = ref(false)
const profileFormRef = ref(null)
const securityFormRef = ref(null)
const userStore = useUserStore()

const profileForm = reactive({
  username: userStore.userInfo.username,
  email: userStore.userInfo.email,
  bio: '',
  headerUrl: userStore.userInfo.headerUrl
})

const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showAvatarDialog = ref(false)
const avatarChooseRef = ref(null)
const customUrl = ref(userStore.userInfo.headerUrl)

const profileRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ]
}

const securityRules = {
  currentPassword: [
    { required: true, message: 'Please enter current password', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Please enter new password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== securityForm.newPassword) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleAvatarSelect = async (url) => {
  try {
    // TODO: 调用API更新头像
    // userStore.updateAvatar(url)
    profileForm.headerUrl = url
    ElMessage.success('Avatar updated successfully')
  } catch (error) {
    ElMessage.error('Failed to update avatar')
  }
}

const handleSave = async () => {
  loading.value = true
  try {
    // TODO: 保存设置
    await Promise.all([
      profileFormRef.value?.validate(),
      securityFormRef.value?.validate()
    ])
    ElMessage.success('Settings saved successfully')
    router.push('/profile')
  } catch (error) {
    console.error('Failed to save settings:', error)
    ElMessage.error('Failed to save settings')
  } finally {
    loading.value = false
  }
}

const previewCustomUrl = () => {
  if (!customUrl.value) {
    ElMessage.warning('Please input URL first')
    return
  }
  // 直接设置图片，不打开对话框
  avatarChooseRef.value?.setImgUrl(customUrl.value)
  profileForm.headerUrl = customUrl.value
  
}
</script>

<style scoped>
/* 莫兰迪风格表单样式 */
.morandi-input :deep(.el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #A1A8C1;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.morandi-input :deep(.el-input__wrapper:hover) {
  border-color: #8B93B1;
  background-color: #F1F5F9;
}

.morandi-input :deep(.el-input__wrapper.is-focus) {
  border-color: #A1A8C1;
  box-shadow: 0 0 0 1px #A1A8C1;
}

/* 莫兰迪风格按钮样式 */
.morandi-button {
  background-color: #A1A8C1 !important;
  border-color: #A1A8C1 !important;
  color: white !important;
}

.morandi-button:hover {
  background-color: #8B93B1 !important;
  border-color: #8B93B1 !important;
}

.morandi-button-secondary {
  background-color: #F8FAFC !important;
  border-color: #A1A8C1 !important;
  color: #6B7C93 !important;
}

.morandi-button-secondary:hover {
  background-color: #F1F5F9 !important;
  border-color: #8B93B1 !important;
}

/* 莫兰迪风格标签页样式 */
.morandi-tabs :deep(.el-tabs__item) {
  color: #8B93B1;
}

.morandi-tabs :deep(.el-tabs__item.is-active) {
  color: #6B7C93;
}

.morandi-tabs :deep(.el-tabs__active-bar) {
  background-color: #A1A8C1;
}

/* 添加输入框组样式 */
:deep(.el-input-group__append) {
  background-color: #F8FAFC !important;
  border: 1px solid #A1A8C1 !important;
  color: #6B7C93 !important;
  transition: all 0.3s ease;
}

:deep(.el-input-group__append:hover) {
  background-color: #F1F5F9 !important;
  border-color: #8B93B1 !important;
}
</style> 