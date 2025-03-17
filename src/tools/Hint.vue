<template>
	<el-dialog
	  v-model="visible"
	  :title="props.title"
	  custom-class="morandi-dialog"
	  width="40%"
	  @close="$emit('update:visible', false)"
	>
	  <div class="p-6 mt-0">
		<p class="text-lg">{{ props.message }}</p>
	  </div>
	  <template #footer>
		<el-button class="cancel-button" @click="$emit('update:visible', false)">
			<span class="text-white font-bold">关闭</span>
		</el-button>
		<el-button v-if="props.confirmButton" class="confirm-button" type="primary" @click="handleConfirm">
			<span class="text-white font-bold">确认</span>
		</el-button>
	  </template>
	</el-dialog>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, computed } from 'vue';
  
  const props = defineProps({
	title: {
	  type: String,
	  default: '提示'
	},
	message: {
	  type: String,
	  default: '这是一个提示信息。'
	},
	visible: {
	  type: Boolean,
	  default: false
	},
	confirmButton: {
	  type: Boolean,
	  default: false
	}
  });
  
  const emit = defineEmits(['update:visible', 'confirm']);
  
  const visible = computed({
	get: () => props.visible,
	set: (value) => emit('update:visible', value)
  });

  const handleConfirm = () => {
	emit('confirm');
	emit('update:visible', false);
  };
  </script>
  
  <style scoped>
  .morandi-dialog {
	background-color: #E3E0DB; /* 莫兰迪冷色调 */
	color: #4a4a4a; /* 字体颜色 */
	border-radius: 8px; /* 圆角 */
	padding: 20px; /* 内边距 */
}
.el-button.cancel-button {
	background-color: #C1A1A1; /* 莫兰迪红色 */
	color: #ffffff; /* 按钮字体颜色 */
	border: none; /* 去掉边框 */
	font-family: 'Arial', sans-serif; /* 修改字体 */
	margin-right: 10px; /* 按钮间距 */
}
.el-button.cancel-button:hover {
	background-color: #A87A7A; /* 按钮悬停红色 */
	color: #ffffff; /* 按钮悬停字体颜色 */
}
.el-button.confirm-button {
	background-color: #A1A8C1; /* 莫兰迪蓝色 */
	color: #ffffff; /* 按钮字体颜色 */
	border: none; /* 去掉边框 */
	font-family: 'Arial', sans-serif; /* 修改字体 */
}
.el-button.confirm-button:hover {
	background-color: #7A87A8; /* 按钮悬停蓝色 */
	color: #ffffff; /* 按钮悬停字体颜色 */
}
  </style>
