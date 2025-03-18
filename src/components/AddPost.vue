<template>
	<el-button @click="add" size="large" circle class="morandi-green-btn">
		<el-icon>
			<Plus />
		</el-icon>
	</el-button>
</template>

<script setup>
const emits = defineEmits(['add']);

const add = () => {
	emits('add');
};
</script>

<style scoped>
.morandi-green-btn {
	background-color: #A8B5A2;
	/* 莫兰迪柔和绿色 */
	border: none;
	color: #4F5D49;
	/* 深一点的莫兰迪绿字体 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.morandi-green-btn:hover {
	background-color: #94A38C;
	/* 深一些的莫兰迪绿 */
	color: #FFFFFF;
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.morandi-green-btn:active {
	background-color: #84937D;
	/* 按下更深色 */
	box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
	transform: translateY(0);
}
</style>
