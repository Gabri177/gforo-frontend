<template>
	<div class="flex-1 w-full h-full flex items-center justify-center bg-[#E3E0DB] py-12 px-4 sm:px-6 lg:px-8">
		<div class="w-full h-full flex justify-center items-center my-3">
			<div class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
			<div class="max-w-md w-full space-y-8">
				<div>
					<h2 class="mt-6 text-center text-3xl font-extrabold text-[#6B7C93] mb-5">
						Reset Password Identity Verification
					</h2>
					<p class="mt-2 text-center text-sm text-[#6B7C93]">
						Enter your username and email to get reset verification code
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
						<el-form-item prop="username">
							<el-input
								v-model="form.username"
								type="text"
								placeholder="Username"
								class="morandi-input h-[2.80rem]"
							/>
						</el-form-item>
						<el-form-item prop="email"  >
							<el-input
								v-model="form.email"
								type="email"
								placeholder="Email address"
								class="morandi-input mt-3 h-[2.80rem]"
							/>
						</el-form-item>
					</div>

					<!-- 图形验证码 -->
					<div class="flex justify-center items-center mb-5 mt-2">
						<el-input v-model="captchaInput" placeholder="Input captcha"
							class="rounded rounded-2xl ml-10 pl-5 w-[140px] h-[3.00rem] morandi-input" clearable />

						<img ref="captchaImg" alt="captcha"
							class="mx-3 rounded rounded-xl border border-solid border-[#C1B8A8]" />
						<el-button @click="changeCaptcha" type="text"
							class="text-[#A1A8C1] hover:text-[#7A87A8]"><el-icon size="30">
								<Refresh />
							</el-icon></el-button>
					</div>

					<div>
						<el-button
							type="primary"
							class="w-full h-12 text-base font-medium text-white bg-[#A1A8C1] border border-[#A1A8C1] rounded-lg hover:bg-[#8B93B1] hover:border-[#8B93B1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A1A8C1] transition-colors duration-300"
							:loading="loading"
							@click="handleSubmit"
						>
							Get Verification Code
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

	<!-- 使用验证码对话框组件 -->
	<VerifyCodeDialog
		ref="verifyCodeDialogRef"
		@verify="handleVerifyCode"
		@cancel="handleCancelVerification"
	/>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import VerifyCodeDialog from '~/components/VerifyCodeDialog.vue'
import {
	getCaptcha,
	deleteCaptcha,
	verifyCaptcha
} from '~/api/captchaApi'
import { 
	forgetPassword,
	forgetPasswordVerifyCode
} from '~/api/authApi'
import { SCENE } from '~/constants/scene'
const router = useRouter()
const loading = ref(false)
const verifyCodeDialogRef = ref(null)
const formRef = ref(null)
const captchaImg = ref(null)
const captchaInput = ref('')
const captchaId = ref('')



const form = reactive({
	username: '',
	email: ''
})

const rules = {
	username: [
		{ required: true, message: 'Please enter your username', trigger: 'blur' },
		{ min: 6, max: 20, message: 'Length should be 6 to 20 characters', trigger: 'blur' }
	],
	email: [
		{ required: true, message: 'Please enter your email address', trigger: 'blur' },
		{ type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
	]
}

const changeCaptcha = async () => {
	deleteCaptcha(captchaId.value)
		.then(() => {
			getCaptcha()
				.then(res => {
					captchaImg.value.src = res.captchaBase64;
					captchaId.value = res.captchaId;
					captchaInput.value = '';
				})
				.catch(err => {
					console.error(err);
					ElMessage.error('Failed to get captcha');
				});
		})
		.catch(err => {
			console.error(err);
		});
}

onMounted(() => {
	getCaptcha()
		.then(res => {
			captchaImg.value.src = res.captchaBase64;
			captchaId.value = res.captchaId;
		})
		.catch(err => {
			console.error(err);
		});
});

const handleSubmit = async () => {
	//verifyCodeDialogRef.value.showVerifyCode()
	//verifyCodeDialogRef.value.setVerifying(true)
	//router.push('/forget-reset-password')
	if (!formRef.value) return
	
	await formRef.value.validate(async (valid) => {
		if (valid) {
			if (!captchaInput.value) {
				console.log("captchaInput.value: " + captchaInput.value)
				ElMessage.warning('Please enter the captcha')
				return
			}
			loading.value = true
			try {
				await verifyCaptcha(captchaInput.value, captchaId.value, form.username, SCENE.FORGET_PASSWORD)
				const forgetPasswordRes = await forgetPassword(form)
				console.log("forgetPasswordRes: " + forgetPasswordRes)
				
				ElMessage.success('Verification code has been sent to your email')
				verifyCodeDialogRef.value?.showVerifyCode()
				//router.push('/forget-reset-password')
			} catch (error) {
				console.log("error: " + error)
				ElMessage.error(error?.message || 'Failed to send verification code')
			} finally {
				loading.value = false
			}
		} else {
			ElMessage.error('Please check the form')
			return false
		}
	})
}

const handleVerifyCode = async (code) => {
	console.log('Parent Component - Verification Code:', code)
	try {

		await forgetPasswordVerifyCode(form, code)
		ElMessage.success('Verification successful')
		router.push(`/forget-reset-password/${form.username}`)
	} catch (error) {
		ElMessage.error(error.message || 'Verification failed')
	}
}

const handleCancelVerification = () => {
	verifyCodeDialogRef.value?.hideVerifyCode()
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

.morandi-button {
	background-color: #A1A8C1;
	border: none;
	color: white;
	transition: all 0.3s ease !important;
}

.morandi-button2 {
	background-color: #83b59d;
	border: none;
	color: white;
	transition: all 0.3s ease !important;
}

.morandi-button2:hover {
	background-color: #559274d8;
	border-color: #5A6788;
}

.morandi-button:hover {
	background-color: #7A87A8;
	border-color: #5A6788;
}

.morandi-button:active,
.morandi-button2:active {
	background-color: #5A6788;
	border-color: #5A6788;
}

:deep(.el-input__inner) {
	color: #4A4A4A;
	background-color: #F8FAFC;
	border-color: #A1A8C1;
}

:deep(.el-input__inner:focus) {
	border-color: #A1A8C1;
}

:deep(.el-form-item__label) {
	color: #6B7C93;
	font-size: large;
	font-weight: bold;
}

:deep(.el-form-item__content) {
	margin-left: 0 !important;
}

:deep(.el-button--text) {
	color: #A1A8C1;
}

:deep(.el-button--text:hover) {
	color: #7A87A8;
}

.link-style1:deep(.el-link::after) {
	border-bottom-color: #A1A8C1 !important;
}

.link-style2:deep(.el-link::after) {
	border-bottom-color: #A1A8C1 !important;
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

/* 添加 ElMessage 样式 */
:deep(.el-message) {
	background-color: #F8FAFC !important;
	border-color: #A1A8C1 !important;
	color: #4A4A4A !important;
}

:deep(.el-message--success) {
	background-color: #F1F5F9 !important;
	border-color: #7A87A8 !important;
}

:deep(.el-message--warning) {
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

:deep(.el-message--success .el-message__icon) {
	color: #A1A8C1 !important;
}

:deep(.el-message--warning .el-message__icon) {
	color: #A1A8C1 !important;
}

:deep(.el-message--error .el-message__icon) {
	color: #A1A8C1 !important;
}

:deep(.el-message__closeBtn) {
	color: #6B7C93 !important;
}

:deep(.el-message__closeBtn:hover) {
	color: #4A4A4A !important;
}

/* 验证码输入框样式 */
:deep(.el-input__wrapper) {
	background-color: #F8FAFC !important;
	border: 1px solid #A1A8C1 !important;
	border-radius: 8px !important;
	box-shadow: none !important;
	transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
	border-color: #7A87A8 !important;
	background-color: #F1F5F9 !important;
}

:deep(.el-input__wrapper.is-focus) {
	border-color: #A1A8C1 !important;
	box-shadow: 0 0 0 1px #A1A8C1 !important;
}

/* 验证码刷新按钮样式 */
:deep(.el-button--text) {
	color: #A1A8C1 !important;
}

:deep(.el-button--text:hover) {
	color: #7A87A8 !important;
}
</style>
