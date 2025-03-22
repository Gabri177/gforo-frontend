<template>
	<el-dialog
		v-model="dialogVisible"
		title="Enter Verification Code"
		width="400px"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:show-close="false"
		class="morandi-dialog rounded rounded-3xl"
		align-center
	>
		<template #header>
			<div class="text-center text-[#6B7C93] text-xl font-semibold">
				Enter Verification Code
			</div>
		</template>
		<el-form :model="verificationForm" :rules="verificationRules" ref="verificationFormRef" label-width="0">
			<el-form-item prop="code">
				<div class="flex justify-center items-center h-full w-full min-h-[60px] mt-1">
					<div class="flex space-x-2">
						<el-input
							v-for="(digit, index) in 6"
							:key="index"
							v-model="verificationForm.digits[index]"
							ref="digitInputs"
							class="w-12 h-12 text-center text-xl morandi-input"
							maxlength="1"
							@input="handleDigitInput($event, index)"
							@keydown.delete="handleDelete($event, index)"
							@click="handleInputClick(index)"
						/>
					</div>
				</div>
			</el-form-item>
		</el-form>
		<div class="flex justify-center space-x-6 pt-4">
			<el-button size="large" type="primary" @click="handleCancel" class="morandi-button w-[120px]">Cancel</el-button>
			<el-button size="large" type="primary" @click="handleVerify" class="morandi-button2 w-[120px]" :loading="verifying">
				Verify
			</el-button>
		</div>
	</el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:modelValue', 'verify', 'cancel'])

const dialogVisible = ref(props.modelValue)
const verifying = ref(false)
const verificationFormRef = ref(null)
const digitInputs = ref([])

const verificationForm = reactive({
	digits: ['', '', '', '', '', ''],
	code: ''
})

// 监听 digits 数组变化，更新 code 字段
watch(() => verificationForm.digits, (newDigits) => {
	verificationForm.code = newDigits.join('')
}, { deep: true })

const verificationRules = {
	code: [
		{ required: true, message: 'Please enter verification code', trigger: 'blur' },
		{ pattern: /^\d{6}$/, message: 'Please enter 6-digit code', trigger: 'blur' }
	]
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
	dialogVisible.value = newVal
})

// 监听 dialogVisible 变化
watch(() => dialogVisible.value, (newVal) => {
	emit('update:modelValue', newVal)
	if (!newVal) {
		// 关闭时重置表单
		verificationForm.digits = ['', '', '', '', '', '']
	}
})

// 显示验证码对话框
const showVerifyCode = () => {
	dialogVisible.value = true
	// 自动聚焦第一个输入框
	nextTick(() => {
		if (digitInputs.value && digitInputs.value[0]) {
			digitInputs.value[0].focus()
		}
	})
}

// 隐藏验证码对话框
const hideVerifyCode = () => {
	dialogVisible.value = false
	verificationForm.digits = ['', '', '', '', '', '']
}

// 设置验证按钮的loading状态
const setVerifying = (status) => {
	verifying.value = status
}

// 暴露方法给父组件
defineExpose({
	showVerifyCode,
	hideVerifyCode,
	setVerifying
})

const handleDigitInput = (value, index) => {
	// 只允许输入数字
	if (!/^\d*$/.test(value)) {
		verificationForm.digits[index] = ''
		return
	}
	
	// 如果输入了数字且不是最后一个输入框，自动跳转到下一个
	if (value && index < 5) {
		nextTick(() => {
			digitInputs.value[index + 1].focus()
		})
	}
}

const handleDelete = (event, index) => {
	// 如果当前输入框为空且按下删除键，跳转到上一个输入框
	if (!verificationForm.digits[index] && event.key === 'Backspace' && index > 0) {
		nextTick(() => {
			digitInputs.value[index - 1].focus()
		})
	}
}

const handleInputClick = (index) => {
	// 找到第一个空输入框的位置
	const firstEmptyIndex = verificationForm.digits.findIndex(digit => digit === '')
	
	// 如果点击的位置在已输入的范围之外，则跳转到第一个空输入框
	if (index > firstEmptyIndex && firstEmptyIndex !== -1) {
		nextTick(() => {
			digitInputs.value[firstEmptyIndex].focus()
		})
	} else {
		// 如果点击的是已输入的输入框，清空当前输入框的内容
		verificationForm.digits[index] = ''
	}
}

const handleVerify = async () => {
	if (!verificationFormRef.value) return
	
	// 将6个数字组合成验证码
	const code = verificationForm.digits.join('')
	
	await verificationFormRef.value.validate(async (valid) => {
		if (valid) {
			verifying.value = true
			try {
				emit('verify', code)
				hideVerifyCode()
			} catch (error) {
				ElMessage.error(error.message || 'Verification failed')
			} finally {
				verifying.value = false
			}
		} else {
			// 如果验证失败，显示错误提示
			ElMessage.warning('Please enter 6-digit verification code')
		}
	})
}

const handleCancel = () => {
	hideVerifyCode()
	emit('cancel')
}
</script>

<style scoped>
/* 对话框样式 */
:deep(.el-dialog) {
	border-radius: 32px !important;
	overflow: hidden !important;
}

:deep(.el-dialog__wrapper) {
	display: flex;
	align-items: center;
	justify-content: center;
}

:deep(.el-dialog) {
	margin: 0 !important;
	position: relative;
	top: 50%;
	transform: translateY(-50%);
}

:deep(.el-dialog__header) {
	margin: 0;
	padding: 20px 24px;
	background-color: #F8FAFC;
	border-bottom: 1px solid #A1A8C1;
	border-radius: 32px 32px 0 0;
	text-align: center;
}

:deep(.el-dialog__title) {
	display: none;
}

:deep(.el-dialog__headerbtn) {
	display: none;
}

:deep(.el-dialog__body) {
	padding: 0;
}

:deep(.el-dialog__footer) {
	margin-top: -20px !important;
	padding-top: 0 !important;
	background-color: #F8FAFC;
	border-top: 1px solid #A1A8C1;
	border-radius: 0 0 32px 32px;
}

/* 验证码输入框样式 */
:deep(.el-input__wrapper) {
	padding: 0 !important;
	background-color: #F8FAFC !important;
	border: 1px solid #A1A8C1 !important;
	border-radius: 16px !important;
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

:deep(.el-input__inner) {
	text-align: center !important;
	font-size: 1.25rem !important;
	font-weight: 600 !important;
	color: #4A4A4A !important;
}

:deep(.el-input__inner::-webkit-inner-spin-button),
:deep(.el-input__inner::-webkit-outer-spin-button) {
	-webkit-appearance: none;
	margin: 0;
}

.morandi-button {
	background-color: #A1A8C1;
	border: none;
	color: white;
	transition: all 0.3s ease !important;
	border-radius: 16px !important;
}

.morandi-button2 {
	background-color: #83b59d;
	border: none;
	color: white;
	transition: all 0.3s ease !important;
	border-radius: 16px !important;
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

/* 添加表单错误提示样式 */
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
</style>
