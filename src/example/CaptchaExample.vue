<template>
	<div class="captcha-example">
		<Captcha ref="captcha" :username="username" colorStyle="green" />
		<el-button @click="verifyC">verify</el-button>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import Captcha from '~/components/Captcha.vue'

const captcha = ref(null)
const username = ref('11111111')



const verifyC = async () => {
	console.log('verifyC')
	const res = await captcha.value.verify()
	console.log(res)
}
</script>

<style scoped>
.captcha-example {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 60px;
	height: calc(100vh - 120px);
}
</style>