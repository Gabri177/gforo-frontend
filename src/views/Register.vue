<template>
	<div class="flex-1 w-full h-full flex justify-center items-center bg-[#E3E0DB]">
		<div class="w-full h-full flex justify-center items-center my-3">
			<div v-if="isRegister"
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="mt-1 text-center text-3xl font-extrabold text-[#6B7C93] mb-3">Register New Account</h2>
				<p class="mt-0 text-center text-m text-[#6B7C93] mb-2">
					Enter your account name, password and email address to register
				</p>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4 space-y-6"
					label-position="top">
					<el-form-item class="flex flex-col justify-center items-center">
						<div class="avatar-selector">
							<div class="avatar-preview mr-3" @click="showAvatarDialog = true">
								<el-avatar :size="100" :src="currentAvatarUrl" class="cursor-pointer hover:shadow-lg transition-all duration-300"></el-avatar>
							</div>
						</div>
					</el-form-item>
					<el-form-item prop="username"> <!-- label="Account" -->
						<el-input v-model="form.username" placeholder="Input your account name" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>
					<el-form-item prop="password"> <!-- label="Password" -->
						<el-input v-model="form.password" type="password" placeholder="Input your password" :show-password="true" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>
					<el-form-item prop="confirmPassword" clearable> <!-- label="Confirm Password" -->
						<el-input v-model="form.confirmPassword" type="password" placeholder="Repeat your password"
							clearable :show-password="true" class="h-[2.80rem] px-3"/>
					</el-form-item>
					<el-form-item prop="email"> <!-- label="Email" -->
						<el-input v-model="form.email" placeholder="Input your email address" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>

					<!-- 图形验证码 -->
					<div class="flex justify-center items-center mb-5 pt-1">
						<el-input v-model="captchaInput" placeholder="Input captcha"
							class="rounded rounded-2xl ml-10 pl-5 w-[140px] h-[3.00rem]" clearable />

						<img ref="captchaImg" alt="captcha"
							class="mx-3 rounded rounded-xl border border-solid border-[#C1B8A8]" />
						<el-button @click="changeCaptcha" type="text"
							class="text-[#A1A8C1] hover:text-[#7A87A8]"><el-icon size="30">
								<Refresh />
							</el-icon></el-button>
					</div>

					<el-form-item class="flex justify-center mb-0 h-[2.80rem] px-5 pt-3" style="margin-top: -10px;">
						<div class="w-full flex items-center justify-center mt-4">
							<el-button type="primary" class="morandi-button2 mx-6 w-[120px]" @click="onSubmit" size="large"	
								:loading="registerLoading">Register</el-button>
							<el-button type="primary" class="morandi-button mx-6 w-[120px]" @click="onCancel" size="large">Cancel</el-button>
						</div>
					</el-form-item>
					<div class="w-full flex justify-center pt-5 link-style1">
						<el-link @click="goLogin" class="text-[#6e668e] hover:text-[#24222f]">Already have an account? Login</el-link>
					</div>
				</el-form>
			</div>
			<div v-else
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center verify-container">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-dark verify-title">
					{{ verifyInfo.title }}
				</h2>
				<el-skeleton :rows="5" animated class="my-3" v-if="isVerifying" />
				<div v-else 
					class="verify-content"
					:class="{ 'verify-success': isActivated, 'verify-error': !isActivated }"
				>
					<div class="verify-icon mb-4">
						<el-icon :size="48" v-if="isActivated">
							<CircleCheckFilled />
						</el-icon>
						<el-icon :size="48" v-else>
							<CircleCloseFilled />
						</el-icon>
					</div>
					<div class="text-center font-bold text-xl mb-4">
						<span>{{ verifyInfo.content }}</span>
					</div>
				</div>

				<div class="verify-buttons">
					<el-button 
						type="primary" 
						class="morandi-button mx-10" 
						@click="onCancel"
					>
						Home
					</el-button>
					<el-button 
						type="success" 
						class="morandi-button2 mx-10" 
						@click="onActivated"
					>
						Login
					</el-button>
				</div>
			</div>
		</div>
	</div>

	<!-- 使用头像选择组件 -->
	<AvatarChoose
		v-model="showAvatarDialog"
		:selected-url="form.headerUrl"
		@select="handleAvatarSelect"
	/>

	<VerifyCodeDialog
		ref="verifyCodeDialogRef"
		@verify="handleVerifyCode"
		@cancel="handleCancelVerification"
	/>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
	registerUser,
	activateAccount
} from '~/api/registerApi'

import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAvatarsByPage, getTotalPages } from '~/assets/avatars.js'
import {
	getCaptcha,
	deleteCaptcha,
	verifyCaptcha
} from '~/api/captchaApi';
import AvatarChoose from '~/components/AvatarChoose.vue'
import { SCENE } from '~/constants/scene';
import VerifyCodeDialog from '~/components/VerifyCodeDialog.vue'

const verifyCodeDialogRef = ref(null)
const captchaImg = ref(null); // 图形验证码
const captchaId = ref('');  // 图形验证码ID
const captchaInput = ref(''); // 图形验证码输入
const route = useRoute()
const isRegister = ref(true)
const isVerifying = ref(true)
const isActivated = ref(false)
const verifyInfo = reactive({
	title: 'Activating Account ...',
	content: 'this is a test',
})
const email = route.params.email
const sixDigitCode = route.params.code

const registerLoading = ref(false);
const formRef = ref(null);

const onActivated = () => {
	router.push('/login');
}

const form = reactive({
	username: '',
	password: '',
	confirmPassword: '',
	email: '',
	headerUrl: getAvatarsByPage(1, 16)[0].url, // 默认使用第一个头像的 URL,
	symbol: localStorage.getItem('deviceId') || 'unknown device'
});

const handleVerifyCode = (code) => {
	
	activateAccount(code, form.email)
		.then(res => {
			isRegister.value = false;
			verifyInfo.title = 'Account Activated';
			verifyInfo.content = 'Your account has been activated successfully!';
			isActivated.value = true;
			isVerifying.value = false;
			ElMessage.success('Verification successful')
			handleCancelVerification()
		})
		.catch(err => {
			ElMessage.error('Verification failed: ' + err.message)
		})

}

const handleCancelVerification = () => {
	verifyCodeDialogRef.value?.hideVerifyCode()
}

const currentAvatarUrl = computed(() => {
	return form.headerUrl
})

const handleAvatarSelect = (url) => {
	form.headerUrl = url
}

const validatePass = (rule, value, callback) => {
	if (value === '') {
		callback(new Error('Please enter your password'))
	} else {
		if (form.confirmPassword !== '') {
			formRef.value?.validateField('confirmPassword')
		}
		callback()
	}
}

const validatePass2 = (rule, value, callback) => {
	if (value === '') {
		callback(new Error('Please enter your password again'))
	} else if (value !== form.password) {
		callback(new Error('The two passwords do not match'))
	} else {
		callback()
	}
}

const rules = {
	username: [
		{ required: true, message: 'Please enter your username', trigger: 'blur' },
		{ min: 3, max: 20, message: 'The length must be between 3 and 20 characters', trigger: 'blur' }
	],
	password: [
		{ required: true, validator: validatePass, trigger: 'blur' },
		{ min: 6, message: 'The password must be at least 6 characters long', trigger: 'blur' }
	],
	confirmPassword: [
		{ required: true, validator: validatePass2, trigger: 'blur' }
	],
	email: [
		{ required: true, message: 'Please enter your email address', trigger: 'blur' },
		{ type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
	]
};

const router = useRouter();

const onSubmit = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			if (captchaInput.value === '') {
				ElMessage.error('Please input captcha');
				return;
			}
			registerLoading.value = true;
			verifyCaptcha(captchaInput.value, captchaId.value, SCENE.REGISTER)
			.then(res => {
				registerUser(form)
				.then(res => {
					ElMessage.success('Remember to activate your account in Profile');
					registerLoading.value = false;
					verifyCodeDialogRef.value.showVerifyCode();
					// setTimeout(() => {
					// 	router.push('/login'); // 跳转到首页
					// }, 2000);
				})
				.catch(err => {
					// console.log('Error: ' , err.response.data.message);
					ElMessage.error("register failed: " + err.message);
					registerLoading.value = false;
				})
			})
			.catch(err => {
				console.error(err);
				ElMessage.error(err?.message || 'Register failed');
				registerLoading.value = false;
				changeCaptcha();
				captchaInput.value = '';
			});
		} else {
			ElMessage.error('Please check the form');
			return false;
		}
	});
};

const onCancel = () => {
	router.push('/');
};

const goLogin = () => {
	router.push('/login');
};

const showAvatarDialog = ref(false);

// 图形验证码 
// 在组件挂载后初始化
onMounted(() => {

	if (email && sixDigitCode) {
		isRegister.value = false;
		console.log('收到 email:', email);
		activateAccount(sixDigitCode, email)
			.then(res => {
				verifyInfo.title = 'Account Activated';
				verifyInfo.content = 'Your account has been activated successfully!';
				isActivated.value = true;
				console.log('激活成功: ', res);
			})
			.catch(err => {
				verifyInfo.title = 'Account Activation Failed';
				verifyInfo.content = 'Verification failed: ' + err.message;
				isActivated.value = false;
				console.log('激活失败');
			})
			.finally(() => {
				isVerifying.value = false;
			});
	} else {
		isRegister.value = true;
		console.log('没有 token');
		getCaptcha()
			.then(res => {
				captchaImg.value.src = res.captchaBase64;
				captchaId.value = res.captchaId;
			})
			.catch(err => {
				console.error(err);
			});
	} 
	
});

const changeCaptcha = () => {
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
};

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
	border-color: #B8A6C9;
}

:deep(.el-input__inner:focus) {
	border-color: #9B85B3;
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
	color: #B8A6C9;
}

:deep(.el-button--text:hover) {
	color: #9B85B3;
}

.link-style1:deep(.el-link::after) {
	border-bottom-color: #8f7db1 !important;
}

.link-style2:deep(.el-link::after) {
	border-bottom-color: #be9cde !important;
}

/* 表单错误提示样式 */
:deep(.el-form-item__error) {
	color: #9B85B3 !important;
	font-size: 12px !important;
	padding-top: 4px !important;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
	box-shadow: 0 0 0 1px #9B85B3 !important;
	border-color: #9B85B3 !important;
}

:deep(.el-form-item.is-error .el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #8A73A2 !important;
	border-color: #8A73A2 !important;
}

.morandi-input :deep(.el-input__wrapper) {
	background-color: #F8FAFC;
	border: 1px solid #B8A6C9;
	border-radius: 8px;
	box-shadow: none;
	transition: all 0.3s ease;
}

.morandi-input :deep(.el-input__wrapper:hover) {
	border-color: #9B85B3;
	background-color: #F1F5F9;
}

.morandi-input :deep(.el-input__wrapper.is-focus) {
	border-color: #9B85B3;
	box-shadow: 0 0 0 1px #9B85B3;
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
	border-color: #B8A6C9 !important;
	color: #4A4A4A !important;
}

:deep(.el-message--success) {
	background-color: #F1F5F9 !important;
	border-color: #9B85B3 !important;
}

:deep(.el-message--warning) {
	background-color: #F1F5F9 !important;
	border-color: #9B85B3 !important;
}

:deep(.el-message--error) {
	background-color: #F1F5F9 !important;
	border-color: #9B85B3 !important;
}

:deep(.el-message__icon) {
	color: #B8A6C9 !important;
}

:deep(.el-message--success .el-message__icon) {
	color: #B8A6C9 !important;
}

:deep(.el-message--warning .el-message__icon) {
	color: #B8A6C9 !important;
}

:deep(.el-message--error .el-message__icon) {
	color: #B8A6C9 !important;
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
	border: 1px solid #B8A6C9 !important;
	border-radius: 8px !important;
	box-shadow: none !important;
	transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
	border-color: #9B85B3 !important;
	background-color: #F1F5F9 !important;
}

:deep(.el-input__wrapper.is-focus) {
	border-color: #9B85B3 !important;
	box-shadow: 0 0 0 1px #9B85B3 !important;
}

/* 验证码刷新按钮样式 */
:deep(.el-button--text) {
	color: #B8A6C9 !important;
}

:deep(.el-button--text:hover) {
	color: #9B85B3 !important;
}

.avatar-selector {
	display: flex;
	justify-content: center;
	align-items: center;
	margin:  0;
}

.avatar-preview {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
	border-radius: 50%;
	transition: all 0.3s ease;
	margin-bottom: -20px;
}

.avatar-preview:hover {
	background-color: #F1F5F9;
	transform: scale(1.05);
}


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

:deep(.el-link) {
	font-size: 14px;
	transition: all 0.3s ease;
}

:deep(.el-link:hover) {
	text-decoration: none;
}

.verify-container {
	animation: fadeIn 0.5s ease;
}

.verify-title {
	animation: slideDown 0.5s ease;
}

.verify-content {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: scaleIn 0.5s ease;
}

.verify-icon {
	animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.verify-success {
	color: #83B59D;
}

.verify-success .verify-icon {
	color: #83B59D;
}

.verify-error {
	color: #C4A0A0;
}

.verify-error .verify-icon {
	color: #C4A0A0;
}

.verify-buttons {
	margin-top: 2rem;
	animation: fadeInUp 0.5s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes slideDown {
	from {
		transform: translateY(-20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

@keyframes scaleIn {
	from {
		transform: scale(0.9);
		opacity: 0;
	}
	to {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes bounceIn {
	0% {
		transform: scale(0);
		opacity: 0;
	}
	60% {
		transform: scale(1.1);
		opacity: 0.8;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes fadeInUp {
	from {
		transform: translateY(20px);
		opacity: 0;
	}
	to {
		transform: translateY(0);
		opacity: 1;
	}
}

</style>
