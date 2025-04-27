<template>
	<el-button @click="returnHome" size="large" circle class="morandi-blue-btn">
		<el-icon>
			<Back />
		</el-icon>
	</el-button>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Back } from '@element-plus/icons-vue';

const router = useRouter();
const emits = defineEmits(['return']);

const returnHome = () => {
	router.push('/');
	emits('return');
};
</script>

<style scoped>
.morandi-blue-btn {
	background-color: #A1A8C1;
	/* 莫兰迪柔和蓝色 */
	border: none;
	color: #4A5568;
	/* 深一点的莫兰迪蓝字体 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.morandi-blue-btn:hover {
	background-color: #7A87A8;
	/* 深一些的莫兰迪蓝 */
	color: #FFFFFF;
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.morandi-blue-btn:active {
	background-color: #6B7C93;
	/* 按下更深色 */
	box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
	transform: translateY(0);
}
</style>