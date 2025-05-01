<template>
  <div class="w-full h-full flex-1 flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full h-full flex justify-center items-center">
      <div class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
        <div class="max-w-md w-full space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-[#6B7C93] mb-5">
              Reset Your Password
            </h2>
            <p class="mt-2 text-center text-sm text-[#6B7C93]">
              Please enter your new password
            </p>
          </div>
          
          <el-form 
            ref="formRef"
            :model="form"
            :rules="rules"
            class="mt-8 space-y-6"
            @submit.prevent="handleSubmit"
          >
            <div class="rounded-md shadow-sm -space-y-px">
              <el-form-item prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="New Password"
                  class="morandi-input h-[2.80rem]"
                />
              </el-form-item>
              
              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  class="morandi-input mt-3 h-[2.80rem]"
                />
              </el-form-item>
            </div>

            <div class="pt-3">
              <el-button
                type="primary"
                class="w-full h-12 text-base font-medium text-white bg-[#A1A8C1] border border-[#A1A8C1] rounded-lg hover:bg-[#8B93B1] hover:border-[#8B93B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A1A8C1] transition-colors duration-300"
                :loading="loading"
                @click="handleSubmit"
              >
                Reset Password
              </el-button>
            </div>

            <div class="text-center">
              <router-link to="/login" class="text-[#6B7C93] hover:text-[#8B93B1] hover:underline transition-all duration-300">
                Back to Login
              </router-link>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { forgetPasswordResetPassword } from '~/api/authApi'


const router = useRouter()
const route = useRoute()
const loading = ref(false)
const formRef = ref(null)

const email = route.params.email

onMounted(() => {
	if (email) {
		console.log("email: " + email)
		form.email = email
	} else {
		console.log("email is null")
		form.email = ''
	}
})


const form = reactive({
  email: email,
  password: '',
  confirmPassword: '',
  symbol: localStorage.getItem('deviceId') || 'unknown device',
})

const rules = {
  password: [
    { required: true, message: 'Please enter your new password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
		await forgetPasswordResetPassword(form)
        // TODO: 调用重置密码API
        ElMessage.success('Password reset successfully')
        router.push('/login')
      } catch (error) {
		console.log("error: " + error)
        ElMessage.error(error.message || 'Failed to reset password')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.text-morandi-dark {
  color: #4A4A4A;
}

.bg-white {
  background-color: #FFFFFF;
}

/* 隐藏必填项星号 */
:deep(.el-form-item__label::before) {
  display: none;
}

.morandi-input :deep(.el-input__wrapper) {
  background-color: #F8FAFC;
  border: 1px solid #A1A8C1;
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.morandi-input :deep(.el-input__wrapper:hover) {
  border-color: #7A87A8;
  background-color: #F1F5F9;
}

.morandi-input :deep(.el-input__wrapper.is-focus) {
  border-color: #A1A8C1;
  box-shadow: 0 0 0 1px #A1A8C1;
}

.morandi-input :deep(.el-input__inner) {
  color: #4A4A4A;
}

.morandi-input :deep(.el-input__inner::placeholder) {
  color: #6B7C93;
}

/* 表单错误提示样式 */
:deep(.el-form-item__error) {
  color: #7A87A8 !important;
  font-size: 12px !important;
  padding-top: 4px !important;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #7A87A8 !important;
  border-color: #7A87A8 !important;
}

:deep(.el-form-item.is-error .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #5A6788 !important;
  border-color: #5A6788 !important;
}

/* ElMessage 样式 */
:deep(.el-message) {
  background-color: #F8FAFC !important;
  border-color: #A1A8C1 !important;
  color: #4A4A4A !important;
}

:deep(.el-message--success) {
  background-color: #F1F5F9 !important;
  border-color: #7A87A8 !important;
}

:deep(.el-message--error) {
  background-color: #F1F5F9 !important;
  border-color: #7A87A8 !important;
}

:deep(.el-message__icon) {
  color: #A1A8C1 !important;
}
</style>
