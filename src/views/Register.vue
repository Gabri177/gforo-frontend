<template>
	<el-main class="flex justify-center items-center">
		<div class="w-full h-full flex justify-center items-center">
			<div v-if="isRegister"
				class="w-1/2 p-8 border border-opacity-20 backdrop-blur-md bg-morandi-card shadow-md rounded-lg flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-text">Register New Account</h2>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4">
					<el-form-item label="Account" prop="username">
						<el-input v-model="form.username" placeholder="input your account name" clearable />
					</el-form-item>
					<el-form-item label="Password" prop="password">
						<el-input v-model="form.password" type="password" placeholder="input your password" :show-password="true" clearable />
					</el-form-item>
					<el-form-item label="Confirm Pw" prop="confirmPassword" clearable>
						<el-input v-model="form.confirmPassword" type="password" placeholder="repeat your password"
							clearable :show-password="true" />
					</el-form-item>
					<el-form-item label="Email" prop="email">
						<el-input v-model="form.email" placeholder="input your email address" clearable />
					</el-form-item>

					<el-form-item class="flex justify-center mb-0">
						<div class="w-full flex items-center mt-3">
							<el-button type="primary" class="morandi-button2 mx-7" @click="onSubmit"
								:loading="registerLoading">Register</el-button>
							<el-button type="primary" class="morandi-button mx-10" @click="onCancel">Cancel</el-button>
						</div>
					</el-form-item>
				</el-form>
			</div>
			<div v-else
				class="w-1/2 p-8 border border-opacity-20 backdrop-blur-md bg-morandi-card shadow-md rounded-lg flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-text">{{ verifyInfo.title }}</h2>
				<el-skeleton :rows="5" animated class="my-3" v-if="isVerifying" />
				<div class="text-center font-bold text-xl text-morandi-cool-blue mb-4" v-else>
					<span>{{ verifyInfo.content }}</span>
				</div>

				<div>
					<el-button type="primary" class="morandi-button3 mx-10" @click="onCancel">Home</el-button>
					<el-button type="success" class="morandi-button2 mx-10" @click="goLogin" v-if="isActivated">Login</el-button>
				</div>

			</div>
		</div>
	</el-main>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
	registerUser,
	verifyEmail
} from '~/api/registerApi'
import { useRoute } from 'vue-router';

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
const form = reactive({
	username: '',
	password: '',
	confirmPassword: '',
	email: ''
});

const rules = {
	username: [
		{ required: true, message: 'please input your account name', trigger: 'blur' }
	],
	password: [
		{ required: true, message: 'please input your password', trigger: 'blur' }
	],
	confirmPassword: [
		{ required: true, message: 'please confirm your password', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value !== form.password) {
					callback(new Error('the two passwords are inconsistent'));
				} else {
					callback();
				}
			}, trigger: 'blur'
		}
	],
	email: [
		{ required: true, message: 'please input your email address', trigger: 'blur' },
		{ type: 'email', message: 'please input currect format of email address', trigger: ['blur', 'change'] }
	]
};


const router = useRouter();

const onSubmit = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			registerLoading.value = true;
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
					console.log('Error: ' , err.response.data.message);
					ElMessage.error(err.response.data.message);
					registerLoading.value = false;
				})
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
</script>

<style scoped>
.text-morandi-cool-blue {
	color: #90a6a1;
}

.el-input__inner {
	color: #6D6875;
}

.el-form-item__label {
	color: #6D6875;
}

.bg-morandi-card {
	background-color: #EDEDED;
}

.text-morandi-text {
	color: #6D6875;
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

.morandi-button3 {
	background-color: #8397b5;
	border-color: #8397b5;
	color: white;
}

.morandi-button:hover {
	background-color: #6D6875;
	border-color: #6D6875;
}

.morandi-button2:hover {
	background-color: #6D6875;
	border-color: #6D6875;
}

.morandi-button3:hover {
	background-color: #6D6875;
	border-color: #6D6875;
}
</style>
