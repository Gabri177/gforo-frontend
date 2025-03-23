<template>
  <div class="flex justify-center items-center mb-5 mt-2">
    <el-input 
      v-model="captchaInput" 
      placeholder="Input captcha"
      :class="[
        'rounded rounded-2xl ml-10 pl-5 w-[140px] h-[3.00rem]',
        `morandi-input-${colorStyle}`
      ]"
      clearable 
      @input="handleInput"
    />

    <img 
      ref="captchaImg" 
      alt="captcha"
      :class="[
        'mx-3 rounded rounded-xl border border-solid',
        `border-morandi-${colorStyle}`
      ]"
    />
    
    <el-button 
      @click="changeCaptcha" 
      type="text"
      :class="[
        `text-morandi-${colorStyle}`,
        `hover:text-morandi-${colorStyle}-dark`,
        `morandi-button-${colorStyle}`
      ]"
    >
      <el-icon size="30">
        <Refresh />
      </el-icon>
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getCaptcha, deleteCaptcha, verifyCaptcha } from '~/api/captchaApi'
import { ElMessage } from 'element-plus'

const captchaImg = ref(null)
const captchaInput = ref('')
const captchaId = ref('')

const props = defineProps({
	username: {
		type: String,
		required: true
	},
	colorStyle: {
		type: String,
		default: 'green',
		validator: (value) => {
			return ['green', 'purple', 'blue', 'brown', 'gray'].includes(value)
		}
	}
})

// 监听输入值变化
const handleInput = (value) => {
  captchaInput.value = value
}

// 刷新验证码
const changeCaptcha = async () => {
  if (captchaId.value) {
    try {
      await deleteCaptcha(captchaId.value)
      const res = await getCaptcha()
      captchaImg.value.src = res.captchaBase64
      captchaId.value = res.captchaId
      captchaInput.value = ''
    } catch (err) {
      console.error(err)
      ElMessage.error('Failed to refresh captcha')
    }
  } else {
    try {
      const res = await getCaptcha()
      captchaImg.value.src = res.captchaBase64
      captchaId.value = res.captchaId
    } catch (err) {
      console.error(err)
      ElMessage.error('Failed to get captcha')
    }
  }
}

// 验证验证码
const verify = async () => {
	console.log('verify')
  if (!captchaInput.value) {
    ElMessage.warning('Please enter the captcha')
    return false
  }
  
  try {
	console.log(captchaInput.value, captchaId.value, props.username)
    const res = await verifyCaptcha(captchaInput.value, captchaId.value, props.username)
    return true
  } catch (err) {
	console.log(err)
    console.error(err)
    ElMessage.error('Captcha verification failed')
    return false
  }
}

// 向父组件暴露必要的值和方法
defineExpose({
  captchaId,
  captchaInput,
  changeCaptcha,
  verify
})

// 组件挂载时获取验证码
onMounted(() => {
  changeCaptcha()
})
</script>

<style scoped>
/* 莫兰迪绿色系 */
.text-morandi-green { color: #8BA888; }
.text-morandi-green-dark { color: #6B8368; }
.border-morandi-green { border-color: #A5B8A3; }
.morandi-input-green :deep(.el-input__wrapper) {
  background-color: #F8FAF8;
  border: 1px solid #A5B8A3;
}
.morandi-input-green :deep(.el-input__wrapper:hover) {
  border-color: #8BA888;
  background-color: #F1F5F1;
}
.morandi-input-green :deep(.el-input__wrapper.is-focus) {
  border-color: #8BA888;
  box-shadow: 0 0 0 1px #8BA888;
}
.morandi-button-green:deep(.el-button) {
  background-color: transparent !important;
  border: none !important;
  transition: all 0.3s ease !important;
}
.morandi-button-green:deep(.el-button:hover) {
  background-color: #F1F5F1 !important;
  color: #6B8368 !important;
}

/* 莫兰迪紫色系 */
.text-morandi-purple { color: #9B8E9B; }
.text-morandi-purple-dark { color: #7B6E7B; }
.border-morandi-purple { border-color: #B5A8B5; }
.morandi-input-purple :deep(.el-input__wrapper) {
  background-color: #FAF8FA;
  border: 1px solid #B5A8B5;
}
.morandi-input-purple :deep(.el-input__wrapper:hover) {
  border-color: #9B8E9B;
  background-color: #F5F1F5;
}
.morandi-input-purple :deep(.el-input__wrapper.is-focus) {
  border-color: #9B8E9B;
  box-shadow: 0 0 0 1px #9B8E9B;
}
.morandi-button-purple:deep(.el-button) {
  background-color: transparent !important;
  border: none !important;
  transition: all 0.3s ease !important;
}
.morandi-button-purple:deep(.el-button:hover) {
  background-color: #F5F1F5 !important;
  color: #7B6E7B !important;
}

/* 莫兰迪蓝色系 */
.text-morandi-blue { color: #8E9EAB; }
.text-morandi-blue-dark { color: #6E7E8B; }
.border-morandi-blue { border-color: #A8B8C5; }
.morandi-input-blue :deep(.el-input__wrapper) {
  background-color: #F8FAFA;
  border: 1px solid #A8B8C5;
}
.morandi-input-blue :deep(.el-input__wrapper:hover) {
  border-color: #8E9EAB;
  background-color: #F1F5F7;
}
.morandi-input-blue :deep(.el-input__wrapper.is-focus) {
  border-color: #8E9EAB;
  box-shadow: 0 0 0 1px #8E9EAB;
}
.morandi-button-blue:deep(.el-button) {
  background-color: transparent !important;
  border: none !important;
  transition: all 0.3s ease !important;
}
.morandi-button-blue:deep(.el-button:hover) {
  background-color: #F1F5F7 !important;
  color: #6E7E8B !important;
}

/* 莫兰迪棕色系 */
.text-morandi-brown { color: #A69B8D; }
.text-morandi-brown-dark { color: #867B6D; }
.border-morandi-brown { border-color: #C0B5A7; }
.morandi-input-brown :deep(.el-input__wrapper) {
  background-color: #FAF9F7;
  border: 1px solid #C0B5A7;
}
.morandi-input-brown :deep(.el-input__wrapper:hover) {
  border-color: #A69B8D;
  background-color: #F5F4F2;
}
.morandi-input-brown :deep(.el-input__wrapper.is-focus) {
  border-color: #A69B8D;
  box-shadow: 0 0 0 1px #A69B8D;
}
.morandi-button-brown:deep(.el-button) {
  background-color: transparent !important;
  border: none !important;
  transition: all 0.3s ease !important;
}
.morandi-button-brown:deep(.el-button:hover) {
  background-color: #F5F4F2 !important;
  color: #867B6D !important;
}

/* 莫兰迪灰色系 */
.text-morandi-gray { color: #9A9B9B; }
.text-morandi-gray-dark { color: #7A7B7B; }
.border-morandi-gray { border-color: #B4B5B5; }
.morandi-input-gray :deep(.el-input__wrapper) {
  background-color: #F9F9F9;
  border: 1px solid #B4B5B5;
}
.morandi-input-gray :deep(.el-input__wrapper:hover) {
  border-color: #9A9B9B;
  background-color: #F4F4F4;
}
.morandi-input-gray :deep(.el-input__wrapper.is-focus) {
  border-color: #9A9B9B;
  box-shadow: 0 0 0 1px #9A9B9B;
}
.morandi-button-gray:deep(.el-button) {
  background-color: transparent !important;
  border: none !important;
  transition: all 0.3s ease !important;
}
.morandi-button-gray:deep(.el-button:hover) {
  background-color: #F4F4F4 !important;
  color: #7A7B7B !important;
}
</style>
