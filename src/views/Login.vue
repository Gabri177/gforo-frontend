<template>
	<div class="flex-1 w-full h-full flex flex-col justify-center items-center bg-[#E3E0DB] ">
		<div class="w-full h-full flex justify-center items-center my-3">
			<div class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="mt-4 text-center text-4xl font-extrabold text-[#6B7C93] mb-6">
					Login
				</h2>
				<p class="mt-2 text-center text-m text-[#6B7C93] mb-8">
					Enter your account name and password to login
				</p>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4 space-y-8"
					label-position="top">
					<div class="rounded-md shadow-sm -space-y-px">
						<el-form-item prop="username" class="mb-8">
							<el-input v-model="form.username" placeholder="Input your account name" clearable
								class="h-[2.80rem] px-3 morandi-input" />
						</el-form-item>
						<el-form-item prop="password" class="mb-8">
							<el-input v-model="form.password" type="password" placeholder="Input your password"
								class="h-[2.80rem] px-3 morandi-input" :show-password="true" clearable />
						</el-form-item>
						
						<!-- 图形验证码 -->
						<div class="flex justify-center items-center mb-16 pt-7">
							<el-input v-model="captchaInput" placeholder="Input captcha"
								class="rounded rounded-2xl ml-10 pl-5 w-[140px] h-[3.00rem]" clearable />

							<img ref="captchaImg" alt="captcha"
								class="mx-3 rounded rounded-xl border border-solid border-[#C1B8A8]" />
							<el-button @click="changeCaptcha" type="text"
								class="text-[#A1A8C1] hover:text-[#7A87A8]"><el-icon size="30">
									<Refresh />
								</el-icon></el-button>
						</div>

						<el-form-item class="flex justify-center mb-8 pt-6 pb-4">
							<div class="w-full flex justify-center items-center">
								<el-button type="primary" class="morandi-button2 mx-5 w-[120px]" size="large" @click="onLogin"
									:loading="loginLoading">Login</el-button>
								<el-button type="primary" class="morandi-button mx-5 w-[120px]" size="large"
									@click="onCancel">Cancel</el-button>
							</div>
						</el-form-item>

						<div class="w-full text-center mb-4 link-style1">
							<el-link @click="goToRegister" class="text-[#788295] hover:text-[#312d3f]">Don't have an
								account? Register here</el-link>
						</div>

						<div class="w-full text-center mb-8 link-style2">
							<el-link @click="goToForgetPassword" class="text-[#728e7b] hover:text-[#415146]">Forgot password? 
								Click to reset</el-link>
						</div>
					</div>
				</el-form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
	loginUser
} from '~/api/authApi';
import {
	getCaptcha,
	deleteCaptcha,
	verifyCaptcha
} from '~/api/captchaApi';
import { useUserStore } from '~/stores/user';
import { setToken, setRefreshToken } from '~/utils/auth';
import { getUserInfo } from '~/api/userApi';
import { SCENE } from '~/constants/scene';
// import { loginUser } from '../api/loginApi';

const router = useRouter();
const userStore = useUserStore();
const loginLoading = ref(false);
const formRef = ref(null); // 表单引用
const captchaImg = ref(null); // 图形验证码
const captchaId = ref('');  // 图形验证码ID
const captchaInput = ref(''); // 图形验证码输入


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

const form = reactive({
	username: '',
	password: ''
});

const rules = {
	username: [
		{ required: true, message: 'please input your account name', trigger: 'blur' },
		{ min: 6, max: 20, message: 'Length should be 6 to 20 characters', trigger: 'blur' }
	],
	password: [
		{ required: true, message: 'please input your password', trigger: 'blur' },
		{ min: 6, max: 20, message: 'Length should be 6 to 20 characters', trigger: 'blur' }
	]
};

const clearForm = () => {
	form.username = '';
	form.password = '';
};

const onLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.error('Please check the form');
    return;
  }
  if (captchaInput.value === '') {
    ElMessage.error('Please input captcha');
    return;
  }

  loginLoading.value = true;
  try {
    await verifyCaptcha(captchaInput.value, captchaId.value, form.username, SCENE.LOGIN);

    const loginRes = await loginUser(form);
    if (loginRes.access_token) setToken(loginRes.access_token);
    if (loginRes.refresh_token) setRefreshToken(loginRes.refresh_token);

    const userInfoRes = await getUserInfo();

    userStore.setUserInfo(userInfoRes);

    ElMessage.success('Login successful');
    router.push('/');
  } catch (err) {
    console.error('Login error:', err);
    ElMessage.error(err?.message || 'Login failed');
    changeCaptcha();
    captchaInput.value = '';
    // clearForm();
  } finally {
    loginLoading.value = false;
	
  }
};


const onCancel = () => {
	router.push('/');
};

const goToRegister = () => {
	router.push('/register');
};

const goToForgetPassword = () => {
	router.push('/forget-password');
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
	border-color: #A4CCB1;
}

:deep(.el-input__inner:focus) {
	border-color: #8AB39C;
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
	color: #A4CCB1;
}

:deep(.el-button--text:hover) {
	color: #8AB39C;
}

.link-style1:deep(.el-link::after) {
	border-bottom-color: #8089d2 !important;
}

.link-style2:deep(.el-link::after) {
	border-bottom-color: #A4CCB1 !important;
}

/* 表单错误提示样式 */
:deep(.el-form-item__error) {
	color: #8AB39C !important;
	font-size: 12px !important;
	padding-top: 4px !important;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
	box-shadow: 0 0 0 1px #8AB39C !important;
	border-color: #8AB39C !important;
}

:deep(.el-form-item.is-error .el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #7A9C8A !important;
	border-color: #7A9C8A !important;
}

.morandi-input :deep(.el-input__wrapper) {
	background-color: #F8FAFC;
	border: 1px solid #A4CCB1;
	border-radius: 8px;
	box-shadow: none;
	transition: all 0.3s ease;
}

.morandi-input :deep(.el-input__wrapper:hover) {
	border-color: #8AB39C;
	background-color: #F1F5F9;
}

.morandi-input :deep(.el-input__wrapper.is-focus) {
	border-color: #8AB39C;
	box-shadow: 0 0 0 1px #8AB39C;
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
	border-color: #A4CCB1 !important;
	color: #4A4A4A !important;
}

:deep(.el-message--success) {
	background-color: #F1F5F9 !important;
	border-color: #8AB39C !important;
}

:deep(.el-message--warning) {
	background-color: #F1F5F9 !important;
	border-color: #8AB39C !important;
}

:deep(.el-message--error) {
	background-color: #F1F5F9 !important;
	border-color: #8AB39C !important;
}

:deep(.el-message__icon) {
	color: #A4CCB1 !important;
}

:deep(.el-message--success .el-message__icon) {
	color: #A4CCB1 !important;
}

:deep(.el-message--warning .el-message__icon) {
	color: #A4CCB1 !important;
}

:deep(.el-message--error .el-message__icon) {
	color: #A4CCB1 !important;
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
	border: 1px solid #A4CCB1 !important;
	border-radius: 8px !important;
	box-shadow: none !important;
	transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
	border-color: #8AB39C !important;
	background-color: #F1F5F9 !important;
}

:deep(.el-input__wrapper.is-focus) {
	border-color: #8AB39C !important;
	box-shadow: 0 0 0 1px #8AB39C !important;
}

/* 验证码刷新按钮样式 */
:deep(.el-button--text) {
	color: #A4CCB1 !important;
}

:deep(.el-button--text:hover) {
	color: #8AB39C !important;
}
</style>
