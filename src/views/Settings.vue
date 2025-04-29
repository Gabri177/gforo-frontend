<template>
  <div class="min-h-[calc(100vh-120px)] flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8"
    style="margin-top: 60px;">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-3/4 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-2xl font-bold text-[#6B7C93] mb-8">Settings</h2>

          <el-tabs class="morandi-tabs">
            <!-- 个人资料设置 -->
            <el-tab-pane label="Profile">
              <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-position="top"
                hide-required-asterisk class="w-full">
                <!-- 头像Url设置 -->
                <div class="mb-6">
                  <label class="block text-[#6B7C93] mb-2">Avatar</label>
                  <div class="flex flex-col items-center">
                    <div class="selected-avatar-wrapper cursor-pointer" @click="showAvatarDialog = true">
                      <img :src="profileForm.headerUrl || '/default-avatar.png'" alt="avatar"
                        class="w-20 h-20 rounded-full object-cover">
                    </div>
                    <div class="flex flex-col mt-2 justify-center items-center">
                      <div class="text-[#6B7C93] text-sm font-medium mb-2">
                        Set your own avatar
                      </div>
                      <el-input v-model="customUrl" placeholder="Input image URL" class="ml-2 mt-2 w-64">
                        <template #append>
                          <el-button @click="previewCustomUrl">Preview</el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>

                <!-- 基本信息表单 -->
                <el-form-item label="Username" prop="username">
                  <div class="w-full flex items-center">
                    <el-input v-model="profileForm.username" class="morandi-input" :disabled="usernameEditActive" />
                    <el-button type="primary" class="morandi-green-button mx-1 min-w-[150px]"
                      @click="activeUsernameEdit" :disabled="!usernameEditActive">
                      Modify Username
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item label="Email ( If you reset the email, you need to verify it again... )" prop="email">
                  <div class="w-full flex items-center">
                    <el-input v-model="profileForm.email" class="morandi-input" 
                    :disabled="profileForm.email == userStore.userInfo.email && emailEditActive" />
                    <el-button type="primary" class="morandi-green-button mx-1 min-w-[150px]" @click="activeEmailEdit"
                      :disabled="!emailEditActive && profileForm.email == userStore.userInfo.email">
                      {{ emailEditActive ? 'Modify Email' : 'Save Email'  }}
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item label="Bio" prop="bio">
                  <el-input v-model="profileForm.bio" type="textarea" rows="4" class="morandi-input"
                    placeholder="Write something about yourself" maxlength="500" />
                  <div class="flex justify-end w-full">
                    <div class="bio-counter pt-1">
                      {{ profileForm.bio.length }}/500
                    </div>
                  </div>
                </el-form-item>
              </el-form>
              <!-- 个人资料的保存按钮 -->
              <div class="mt-8 flex justify-end space-x-4">
                <el-button class="morandi-button-secondary" @click="router.back()">
                  Cancel
                </el-button>
                <el-button type="primary" class="morandi-button" :loading="loading" @click="handleProfileSave"
                  :disabled="(profileForm.username == userStore.userInfo.username &&
                    profileForm.bio == userStore.userInfo.bio &&
                    profileForm.headerUrl == userStore.userInfo.headerUrl &&
                    profileForm.email == userStore.userInfo.email) ? true : false">
                  {{ profileForm.username == userStore.userInfo.username && profileForm.bio == userStore.userInfo.bio &&
                    profileForm.headerUrl == userStore.userInfo.headerUrl && profileForm.email == userStore.userInfo.email
                    ? 'Nothing Changed' : 'Save Changes' }}
                </el-button>
              </div>
            </el-tab-pane>

            <!-- 安全设置 -->
            <el-tab-pane label="Security">
              <el-form ref="securityFormRef" :model="securityForm" :rules="securityRules" label-position="top">
                <el-form-item label="Current Password" prop="oldPassword">
                  <el-input v-model="securityForm.oldPassword" type="password" class="morandi-input"
                    :show-password="true" clearable />
                </el-form-item>

                <el-form-item label="New Password" prop="newPassword">
                  <el-input v-model="securityForm.newPassword" type="password" class="morandi-input"
                    :show-password="true" clearable />
                </el-form-item>

                <el-form-item label="Confirm Password" prop="confirmPassword">
                  <el-input v-model="securityForm.confirmPassword" type="password" class="morandi-input"
                    :show-password="true" clearable />
                </el-form-item>
              </el-form>
              <!-- 安全设置的按钮 -->
              <div class="mt-8 flex justify-end space-x-4">
                <el-button class="morandi-button-secondary" @click="router.back()">
                  Cancel
                </el-button>
                <el-button type="primary" class="morandi-button" :loading="securityLoading"
                  @click="handlePasswordChange">
                  Change Password
                </el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>

  <!-- 将 AvatarChoose 组件移到这里 -->
  <AvatarChoose ref="avatarChooseRef" v-model="showAvatarDialog" :selected-url="profileForm.headerUrl"
    @select="handleAvatarSelect" />

  <VerifyCodeDialog
		ref="verifyCodeDialogRef"
		@verify="handleVerifyCode"
		@cancel="handleCancelVerification"
	/>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '~/stores/user'
import AvatarChoose from '~/components/AvatarChoose.vue'
import {
  updateUserInfo,
  changePassword,
  getUserInfo,
  sendVerifyEmail,
  verifyEmail
} from '~/api/userApi'
import VerifyCodeDialog from '~/components/VerifyCodeDialog.vue'

const verifyCodeDialogRef = ref(null)
const router = useRouter()
const loading = ref(false)
const securityLoading = ref(false)
const profileFormRef = ref(null)
const securityFormRef = ref(null)
const userStore = useUserStore()
const usernameEditActive = ref(true)
const emailEditActive = ref(true)

const profileForm = reactive({
  username: userStore.userInfo.username,
  email: userStore.userInfo.email,
  bio: userStore.userInfo.bio,
  headerUrl: userStore.userInfo.headerUrl
})

const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleVerifyCode = (code) => {
  
  verifyEmail(code, profileForm.email)
  .then(() => {
      ElMessage.success('Email verified successfully')
      getUserInfo()
      .then((res) => {
      	console.log("email verified new user info: ", res)
        userStore.setUserInfo(res)
      })
  })
  .catch((error) => {
      ElMessage.error(error.message)
      profileForm.email = userStore.userInfo.email
  })
  .finally(() => {
      emailEditActive.value = true
  })
}

const handleCancelVerification = () => {
	verifyCodeDialogRef.value?.hideVerifyCode()
}

const activeUsernameEdit = () => {
  usernameEditActive.value = false
}

const activeEmailEdit = () => {
  

  if (emailEditActive.value && profileForm.email == userStore.userInfo.email){
    // 开启编辑模式
    emailEditActive.value = false
  } else {
    console.log('email changed')
    
    // 发送验证邮件
    sendVerifyEmail(profileForm.email)
    .then(() => {
      verifyCodeDialogRef.value?.showVerifyCode()
      ElMessage.success('Verification email sent, Please check your email')
    })
    .catch((error) => {
      emailEditActive.value = true
      ElMessage.error(error.message)
      profileForm.email = userStore.userInfo.email
    })
    
  }
}

const showAvatarDialog = ref(false)
const avatarChooseRef = ref(null)
const customUrl = ref(userStore.userInfo.headerUrl)

const profileRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Please enter email', trigger: 'blur' },
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ],
  bio: [
    { max: 500, message: 'Length should be less than 500 characters', trigger: 'blur' }
  ]
}

const securityRules = {
  oldPassword: [
    { required: true, message: 'Please enter current password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
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
  // TODO: 调用API更新头像
  // userStore.updateAvatar(url)
  profileForm.headerUrl = url
  customUrl.value = url

}

// 处理个人资料保存
const handleProfileSave = async () => {
  loading.value = true
  try {
    await profileFormRef.value?.validate()
    await updateUserInfo(profileForm)
    const userInfoRes = await getUserInfo()
    console.log("new user info: ", userInfoRes)
    userStore.setUserInfo(userInfoRes)
    usernameEditActive.value = true
    emailEditActive.value = true
    ElMessage.success('Profile updated successfully')
    // router.push('/profile')
  } catch (error) {
    console.error('Failed to save profile:', error)
    ElMessage.error(error?.message || 'Failed to save profile')
    profileFormRef.value?.resetFields()
  } finally {
    loading.value = false
  }
}

// 处理密码更改
const handlePasswordChange = async () => {
  securityLoading.value = true
  try {
    await securityFormRef.value?.validate()
    await changePassword(securityForm)
    ElMessage.success('Password changed successfully')
    resetSecurityForm()
  } catch (error) {
    console.error('Failed to change password:', error)
    ElMessage.error(error.message || 'Failed to change password')
  } finally {
    securityLoading.value = false
  }
}

// 重置安全设置表单
const resetSecurityForm = () => {
  securityFormRef.value?.resetFields()
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

.morandi-green-button {
  background-color: #7E998F !important;
  /* 莫兰迪墨绿 */
  border-color: #7E998F !important;
  color: white !important;
  transition: all 0.3s ease-in-out;
}

.morandi-green-button:hover {
  background-color: #6A847B !important;
  /* 深一点的墨绿 */
  border-color: #6A847B !important;
}

.morandi-green-button:active {
  background-color: #5B756B !important;
  border-color: #5B756B !important;
}

.morandi-green-button:disabled {
  background-color: #C6D1CB !important;
  /* 淡墨绿灰 */
  border-color: #C6D1CB !important;
  color: #F1F1F1 !important;
  cursor: not-allowed;
}


/* 莫兰迪风格按钮样式 */
/* 莫兰迪风格按钮样式 */
.morandi-button {
  background-color: #A1A8C1 !important;
  /* 主色：莫兰迪紫蓝 */
  border-color: #A1A8C1 !important;
  color: white !important;
  transition: all 0.3s ease-in-out;
}

.morandi-button:hover {
  background-color: #8B93B1 !important;
  /* hover 色：稍深一点更有层次 */
  border-color: #8B93B1 !important;
}

.morandi-button:active {
  background-color: #7A87A8 !important;
  /* active 色：再深一级 */
  border-color: #7A87A8 !important;
}

.morandi-button:disabled {
  background-color: #D1D4DE !important;
  /* disabled 色：淡灰紫 */
  border-color: #D1D4DE !important;
  color: #F1F1F1 !important;
  cursor: not-allowed !important;
  opacity: 0.7;
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

/* 隐藏表单项的必填星号 */
:deep(.el-form-item__label::before) {
  display: none !important;
}

/* 修改 textarea 的莫兰迪风格 */
.morandi-input :deep(.el-textarea__inner) {
  background-color: #F8FAFC !important;
  border: 1px solid #A1A8C1 !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
  padding: 12px !important;
  color: #6B7C93 !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  resize: vertical !important;
  min-height: 120px !important;
}

.morandi-input :deep(.el-textarea__inner:hover) {
  border-color: #8B93B1 !important;
  background-color: #F1F5F9 !important;
}

.morandi-input :deep(.el-textarea__inner:focus) {
  border-color: #A1A8C1 !important;
  box-shadow: 0 0 0 1px #A1A8C1 !important;
  outline: none !important;
}

/* 修改 textarea 的占位符颜色 */
.morandi-input :deep(.el-textarea__inner::placeholder) {
  color: #B8C2CC !important;
}

/* 调整表单宽度和边距 */
:deep(.el-form) {
  max-width: 600px !important;
  /* 或者其他合适的宽度 */
  margin: 0 auto !important;
}

/* 表单验证提示的莫兰迪风格 */
:deep(.el-form-item__error) {
  color: #C4A0A0 !important;
  /* 更柔和的莫兰迪红色 */
  font-size: 12px !important;
  padding-top: 4px !important;
  font-weight: 500 !important;
}

/* 输入框错误状态的莫兰迪风格 */
.morandi-input :deep(.el-input__wrapper.is-error) {
  border-color: #C4A0A0 !important;
  background-color: #FAF6F6 !important;
}

.morandi-input :deep(.el-input__wrapper.is-error:hover) {
  border-color: #B39292 !important;
}

.morandi-input :deep(.el-input__wrapper.is-error.is-focus) {
  border-color: #C4A0A0 !important;
  box-shadow: 0 0 0 1px #C4A0A0 !important;
}

/* 密码输入框错误状态的特殊处理 */
.morandi-input :deep(.el-input__wrapper.is-error .el-input__suffix) {
  color: #C4A0A0 !important;
}

/* 表单项验证失败时的过渡效果 */
:deep(.el-form-item.is-error) {
  transition: all 0.3s ease !important;
}

/* 表单标签的莫兰迪风格 */
:deep(.el-form-item__label) {
  color: #8B93B1 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding-bottom: 8px !important;
  line-height: 1.4 !important;
  transition: all 0.3s ease !important;
}

/* 表单项获得焦点时标签样式 */
:deep(.el-form-item.is-required:focus-within .el-form-item__label) {
  color: #6B7C93 !important;
}

/* 错误状态下的标签样式 */
:deep(.el-form-item.is-error .el-form-item__label) {
  color: #C4A0A0 !important;
}

/* 表单项的间距 */
:deep(.el-form-item) {
  margin-bottom: 24px !important;
}

/* 选中的头像样式 */
.selected-avatar-wrapper {
  border: 2px solid #A1A8C1;
  border-radius: 50%;
  padding: 3px;
  transition: all 0.3s ease;
  width: 86px;
  /* 80px + 2 * (padding + border) */
  height: 86px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-avatar-wrapper:hover {
  transform: scale(1.05);
  border-color: #83B59D;
  box-shadow: 0 4px 12px rgba(131, 181, 157, 0.15);
}

.selected-avatar-wrapper img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  background: transparent !important;
}

/* Bio字符计数器样式 */
.bio-counter {
  text-align: right;
  font-size: 0.875rem;
  color: #8B93B1;
  margin-top: -8px;
  /* 调整位置 */
}
</style>