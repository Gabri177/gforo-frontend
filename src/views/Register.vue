<template>
	<el-main class="flex justify-center items-center bg-[#E3E0DB] min-h-[calc(100vh-60px)" style="margin-top: 60px;">
		<div class="w-full h-full flex justify-center items-center">
			<div v-if="isRegister"
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="mt-1 text-center text-3xl font-extrabold text-[#6B7C93] mb-3">Register New Account</h2>
				<p class="mt-0 text-center text-m text-[#6B7C93] mb-2">
					Enter your account name, password and email address to register
				</p>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4 space-y-6"
					label-position="top">
					<el-form-item class="flex flex-col justify-center items-center"> <!-- label="Avatar" -->
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
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-dark">{{ verifyInfo.title }}</h2>
				<el-skeleton :rows="5" animated class="my-3" v-if="isVerifying" />
				<div class="text-center font-bold text-xl text-[#A1A8C1] mb-4" v-else>
					<span>{{ verifyInfo.content }}</span>
				</div>

				<div>
					<el-button type="primary" class="morandi-button mx-10" @click="onCancel">Home</el-button>
					<el-button type="success" class="morandi-button2 mx-10" @click="goLogin" v-if="isActivated">Login</el-button>
				</div>
			</div>
		</div>
	</el-main>

	<!-- 头像选择对话框 -->
	<el-dialog
		v-model="showAvatarDialog"
		title="Choose your avatar"
		width="600px"
		class="avatar-dialog"
	>
		<div class="avatar-dialog-content">
			<div class="avatar-pages">
				<el-pagination
					v-model:current-page="currentPage"
					:page-size="1"
					:total="4"
					layout="prev, pager, next"
					@current-change="handlePageChange"
				/>
			</div>
			<div class="avatar-grid">
				<div
					v-for="avatar in currentPageAvatars"
					:key="avatar.id"
					class="avatar-item"
					:class="{ 'selected': form.avatarId === avatar.id }"
					@click="selectAvatar(avatar)"
				>
					<el-avatar :size="70" :src="avatar.url"></el-avatar>
				</div>
			</div>
		</div>
	</el-dialog>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
	registerUser,
	verifyEmail
} from '~/api/registerApi'
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { avatarsPage1, avatarsPage2, avatarsPage3 } from '../assets/avatars'
import {
	getCaptcha,
	deleteCaptcha,
	verifyCaptcha
} from '~/api/captchaApi';

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
const token = route.params.token
const userId = route.params.userId

if (token && userId) {
	isRegister.value = false;
	console.log('收到 token:', token);
	verifyEmail(userId, token)
		.then(res => {
			verifyInfo.title = 'Account Activated';
			verifyInfo.content = 'Your account has been activated successfully, please login';
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
	// 这里可以调用接口校验 token
} else {
	isRegister.value = true;
	console.log('没有 token');

}

const registerLoading = ref(false);
const formRef = ref(null);
const currentPage = ref(1)

const form = reactive({
	username: '',
	password: '',
	confirmPassword: '',
	email: '',
	avatarId: 1 // 默认选择第一个头像
});

const currentPageAvatars = computed(() => {
	switch (currentPage.value) {
		case 1:
			return avatarsPage1
		case 2:
			return avatarsPage2
		case 3:
			return avatarsPage3
		default:
			return avatarsPage1
	}
})

const currentAvatarUrl = computed(() => {
	const allAvatars = [...avatarsPage1, ...avatarsPage2, ...avatarsPage3]
	const selectedAvatar = allAvatars.find(avatar => avatar.id === form.avatarId)
	return selectedAvatar ? selectedAvatar.url : avatarsPage1[0].url
})

const handlePageChange = (page) => {
	currentPage.value = page
}

const selectAvatar = (avatar) => {
	form.avatarId = avatar.id
	showAvatarDialog.value = false
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
			verifyCaptcha(captchaInput.value, captchaId.value, form.username)
			.then(res => {
				registerUser(form)
				.then(res => {
					ElMessage.success('Please check your email to activate your account');
					registerLoading.value = false;

					/*

						这里可以加上自动登录的逻辑
					 */
					setTimeout(() => {
						router.push('/'); // 跳转到首页
					}, 2000);
				})
				.catch(err => {
					// console.log('Error: ' , err.response.data.message);
					ElMessage.error("register failed: " + err);
					registerLoading.value = false;
				})
			})
			.catch(err => {
				console.error(err);
				ElMessage.error(err.message);
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
	getCaptcha()
		.then(res => {
			captchaImg.value.src = res.captchaBase64;
			captchaId.value = res.captchaId;
		})
		.catch(err => {
			console.error(err);
		});
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

.avatar-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 20px;
	padding: 20px;
	max-height: 500px;
	overflow-y: auto;
}

.avatar-item {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.3s ease;
	background-color: #F8FAFC;
}

.avatar-item:hover {
	background-color: #F1F5F9;
	transform: translateY(-2px);
}

.avatar-item.selected {
	background-color: #A1A8C1;
	transform: scale(1.05);
}

.avatar-dialog :deep(.el-dialog__body) {
	padding: 0;
}

.avatar-dialog-content {
	padding: 20px;
}

.avatar-pages {
	display: flex;
	justify-content: center;
	margin-bottom: 20px;
	padding: 10px;
	border-bottom: 1px solid #E3E0DB;
}

.text-morandi-link {
	color: #A1A8C1;
	font-size: 14px;
	transition: all 0.3s ease;
	padding: 0;
	height: auto;
	line-height: 1.5;
}

.text-morandi-link-hover {
	color: #7A87A8;
	text-decoration: underline;
}

:deep(.el-link) {
	font-size: 14px;
	transition: all 0.3s ease;
}

:deep(.el-link:hover) {
	text-decoration: none;
}
</style>
