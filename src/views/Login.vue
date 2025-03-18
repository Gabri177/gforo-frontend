<template>
	<el-main class="flex justify-center items-center bg-[#E3E0DB]" style="margin-top: 60px;">
		<div class="w-full h-full flex justify-center items-center">
			<div
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-dark">Login</h2>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4"
					label-position="top">
					<el-form-item label="Account" prop="username">
						<el-input v-model="form.username" placeholder="input your account name" clearable
							class="h-[2.80rem] px-3" />
					</el-form-item>
					<el-form-item label="Password" prop="password">
						<el-input v-model="form.password" type="password" placeholder="input your password"
							class="h-[2.80rem] px-3" :show-password="true" clearable />
					</el-form-item>
					<!-- 图形验证码 -->
					<div class="flex justify-center items-center mb-5">
						<el-input v-model="captchaInput" placeholder="input captcha"
							class="rounded rounded-2xl ml-10 pl-5 w-[130px] h-[2.80rem]" clearable />

						<img ref="captchaImg" alt="captcha"
							class="mx-3 rounded rounded-xl border border-solid border-[#C1B8A8]" />
						<el-button @click="changeCaptcha" type="text"
							class="text-[#A1A8C1] hover:text-[#7A87A8]"><el-icon size="30">
								<Refresh />
							</el-icon></el-button>
					</div>

					<el-form-item class="flex justify-center mb-0">
						<div class="w-full flex justify-center items-center">
							<el-button type="primary" class="morandi-button2 mx-5" size="large" @click="onLogin"
								:loading="loginLoading">Login</el-button>
							<el-button type="primary" class="morandi-button mx-5" size="large"
								@click="onCancel">Cancel</el-button>
						</div>
					</el-form-item>

					<div class="w-full text-center mt-4">
						<el-link @click="goToRegister" class="text-[#A1A8C1] hover:text-[#7A87A8]">Don't have an
							account? Register here</el-link>
					</div>
				</el-form>
			</div>
		</div>
	</el-main>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
	loginUser,
	getCaptcha,
	deleteCaptcha
} from '~/api/loginApi';
// import { loginUser } from '../api/loginApi';

const router = useRouter();
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
		{ required: true, message: 'please input your account name', trigger: 'blur' }
	],
	password: [
		{ required: true, message: 'please input your password', trigger: 'blur' }
	]
};

const clearForm = () => {
	form.username = '';
	form.password = '';
};

const onLogin = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			loginLoading.value = true;
			loginUser(form, captchaInput.value, captchaId.value)
				.then(res => {
					console.log('Login successful: ', res);
					ElMessage.success('Login successful');
					router.push('/'); // 登录成功跳转首页
				})
				.catch(err => {
					console.log('Error: ', err);
					ElMessage.error(err.message);
					changeCaptcha();
					clearForm();
				})
				.finally(() => {
					loginLoading.value = false;
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

const goToRegister = () => {
	router.push('/register');
};
</script>

<style scoped>
.text-morandi-dark {
	color: #4A4A4A;
}

.bg-white {
	background-color: #FFFFFF;
}

.morandi-button {
	background-color: #A1A8C1;
	border-color: #7A87A8;
	color: white;
}

.morandi-button2 {
	background-color: #83b59d;
	border-color: #7A87A8;
	color: white;
}

.morandi-button2:hover{
	background-color: #498c6c;
	border-color: #5A6788;
}
.morandi-button:hover {
	background-color: #7A87A8;
	border-color: #5A6788;
}

:deep(.el-input__inner) {
	color: #4A4A4A;
	background-color: #F8FAFC;
	border-color: #C1B8A8;
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
</style>
