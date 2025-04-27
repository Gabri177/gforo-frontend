<template>
	<el-button @click="like" size="large" circle class="morandi-red-btn">
		<el-icon size="20px">
			<!-- <StarFilled v-if="internalIsFilled" />
			<Star v-else /> -->
			<i v-if="!internalIsFilled" class="pi pi-thumbs-up" style="font-size: 1rem"></i>
			<i v-else class="pi pi-thumbs-up-fill" style="font-size: 1rem"></i>
		</el-icon>
	</el-button>
</template>

<script setup>
import { Star, StarFilled } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'

const props = defineProps({
	isFilled: {
		type: Boolean,
		default: false
	}
});

const emits = defineEmits(['like', 'update:isFilled']);

// 内部状态
const internalIsFilled = ref(props.isFilled);

// 监听父组件传入的 isFilled 变化
watch(() => props.isFilled, (newVal) => {
	internalIsFilled.value = newVal;
});

const like = () => {
	internalIsFilled.value = !internalIsFilled.value;
	emits('like');
	emits('update:isFilled', internalIsFilled.value);
};
</script>

<style scoped>
.morandi-red-btn {
	background-color: #A87A7A;
	/* 莫兰迪柔和红色 */
	border: none;
	color: #4A4A4A;
	/* 默认黑色 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.morandi-red-btn:hover {
	background-color: #946B6B;
	/* 深一些的莫兰迪红 */
	color: #FFFFFF;
	/* 悬停时白色 */
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.morandi-red-btn:active {
	background-color: #845C5C;
	/* 按下更深色 */
	color: #FFFFFF;
	/* 点击时白色 */
	box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
	transform: translateY(0);
}
</style>
