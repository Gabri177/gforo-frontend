<template>
	<el-dialog v-model="localVisible" custom-class="morandi-dialog" width="40%" @close="handleClose" center>
		<template #header>
			<div class="custom-header animate-fadein">
				{{ props.title }}
			</div>
		</template>

		<div class="p-6 text-center animate-fadein">
			<p class="dialog-message">{{ props.message }}</p>
		</div>
		<template #footer>
			<el-button class="cancel-button" @click="handleClose">
				<span class="text-white font-bold">Cancel</span>
			</el-button>
			<el-button v-if="props.confirmButton" class="confirm-button" type="primary" @click="handleConfirm">
				<span class="text-white font-bold" :loading="props.confirmLoading">Confirm</span>
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from 'vue';

const props = defineProps({
	title: { type: String, default: '提示' },
	message: { type: String, default: '这是一个提示信息。' },
	visible: { type: Boolean, default: false },
	confirmButton: { type: Boolean, default: false },
	confirmLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'confirm']);

const localVisible = ref(false)

watch(() => props.visible, (newVal) => {
	localVisible.value = newVal
}, { immediate: true })


const handleClose = () => {
	localVisible.value = false
	emit('update:visible', false)
}

const handleConfirm = () => {
	emit('confirm')
	handleClose()
}
</script>

<style scoped>

/* 正文样式 */
.dialog-message {
	font-size: 18px;
	font-weight: 400;
	line-height: 1.7;
	color: #5A5A5A;
	/* 柔和暗灰色 */
	word-break: break-word;
	transition: color 0.3s ease;
}


/* 淡入动画 */
@keyframes fadein {
	0% {
		opacity: 0;
		transform: translateY(-10px);
	}

	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

.animate-fadein {
	animation: fadein 0.4s ease-out;
}

:deep(.el-dialog__header .custom-header) {
	font-size: 22px;
	font-weight: 600;
	color: #7A87A8;
	text-align: center;
	line-height: 1.4;
	letter-spacing: 0.5px;
	animation: fadein 0.4s ease-out;
}
</style>
