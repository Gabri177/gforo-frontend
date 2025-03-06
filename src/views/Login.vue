<template>
	<el-main class="flex justify-center items-center">
		<div class="w-full h-full flex justify-center items-center">
			<div
				class="w-1/2 p-4 border border-opacity-20 backdrop-blur-md bg-morandi-card shadow-md rounded-lg flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-text">Login</h2>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4">
					<el-form-item label="Account" prop="username">
						<el-input v-model="form.username" placeholder="input your account name" clearable />
					</el-form-item>
					<el-form-item label="Password" prop="password">
						<el-input v-model="form.password" type="password" placeholder="input your password"
							:show-password="true" clearable />
					</el-form-item>

					<el-form-item class="flex justify-center mb-0 noml">
						<div class="w-full flex justify-center items-center">
							<el-button type="primary" class="morandi-button2 mx-5" @click="onLogin"
								:loading="loginLoading">Login</el-button>
							<el-button type="primary" class="morandi-button mx-5" @click="onCancel">Cancel</el-button>
						</div>
					</el-form-item>

					<div class="w-full text-center mt-4 text-morandi-text">
						<el-link @click="goToRegister">Don't have an account? Register here</el-link>
					</div>
				</el-form>
			</div>
		</div>
	</el-main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// import { loginUser } from '../api/loginApi';

const router = useRouter();
const loginLoading = ref(false);
const formRef = ref(null);

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

const onLogin = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			loginLoading.value = true;
			loginUser(form)
				.then(res => {
					ElMessage.success('Login successful');
					router.push('/'); // 登录成功跳转首页
				})
				.catch(err => {
					ElMessage.error(err.message);
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
.text-morandi-text {
	color: #6D6875;
}

.bg-morandi-card {
	background-color: #EDEDED;
}

.morandi-button {
	background-color: #B5838D;
	border-color: #B5838D;
	color: white;
}

.morandi-button2 {
	background-color: #83b59d;
	border-color: #83b5b0;
	color: white;
}

.morandi-button:hover,
.morandi-button2:hover {
	background-color: #6D6875;
	border-color: #6D6875;
}

.el-input__inner {
	color: #6D6875;
}

.el-form-item__label {
	color: #6D6875;
}

:deep(.el-form-item__content) {
	margin-left: 0 !important;
}
</style>
