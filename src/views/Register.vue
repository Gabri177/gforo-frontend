<template>
	<el-main class="flex justify-center items-center bg-[#E3E0DB]" style="margin-top: 60px;">
		<div class="w-full h-full flex justify-center items-center">
			<div v-if="isRegister"
				class="w-1/2 p-8 border border-[#C1B8A8] backdrop-blur-md bg-white shadow-lg rounded-2xl flex flex-col justify-center items-center">
				<h2 class="text-2xl font-bold mb-6 text-center text-morandi-dark">Register New Account</h2>
				<el-form :model="form" :rules="rules" ref="formRef" label-width="100px" class="w-3/4"
					label-position="top">
					<el-form-item label="Avatar" class="flex flex-col justify-center items-center">
						<div class="avatar-selector">
							<div class="avatar-preview mr-3" @click="showAvatarDialog = true">
								<el-avatar :size="100" :src="currentAvatarUrl" class="cursor-pointer hover:shadow-lg transition-all duration-300"></el-avatar>
							</div>
						</div>
					</el-form-item>
					<el-form-item label="Account" prop="username">
						<el-input v-model="form.username" placeholder="input your account name" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>
					<el-form-item label="Password" prop="password">
						<el-input v-model="form.password" type="password" placeholder="input your password" :show-password="true" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>
					<el-form-item label="Confirm Password" prop="confirmPassword" clearable>
						<el-input v-model="form.confirmPassword" type="password" placeholder="repeat your password"
							clearable :show-password="true" class="h-[2.80rem] px-3"/>
					</el-form-item>
					<el-form-item label="Email" prop="email">
						<el-input v-model="form.email" placeholder="input your email address" clearable
						class="h-[2.80rem] px-3" />
					</el-form-item>

					<el-form-item class="flex justify-center mb-0 h-[2.80rem] px-3">
						<div class="w-full flex items-center justify-center mt-4">
							<el-button type="primary" class="morandi-button2 mx-6" @click="onSubmit" size="large"	
								:loading="registerLoading">Register</el-button>
							<el-button type="primary" class="morandi-button mx-6" @click="onCancel" size="large">Cancel</el-button>
						</div>
					</el-form-item>
					<div class="w-full flex justify-center mt-7" >
						<el-link @click="goLogin" class="text-[#A1A8C1] hover:text-[#7A87A8]">Already have an account? Login</el-link>
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
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
	registerUser,
	verifyEmail
} from '~/api/registerApi'
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { avatarsPage1, avatarsPage2, avatarsPage3 } from '../assets/avatars'

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
		callback(new Error('请输入密码'))
	} else {
		if (form.confirmPassword !== '') {
			formRef.value?.validateField('confirmPassword')
		}
		callback()
	}
}

const validatePass2 = (rule, value, callback) => {
	if (value === '') {
		callback(new Error('请再次输入密码'))
	} else if (value !== form.password) {
		callback(new Error('两次输入密码不一致!'))
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
					// console.log('Error: ' , err.response.data.message);
					ElMessage.error(err.message);
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

const showAvatarDialog = ref(false);
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

:deep(.el-button--text) {
	padding: 0;
	height: auto;
	line-height: 1.5;
}

:deep(.el-button--text:hover) {
	background-color: transparent;
}

:deep(.el-link) {
	font-size: 14px;
	transition: all 0.3s ease;
}

:deep(.el-link:hover) {
	text-decoration: none;
}
</style>
