<template>
  <el-dialog
    v-model="visible"
    :title="props.title"
    custom-class="morandi-dialog"
    width="50%"
    @close="$emit('update:visible', false)"
  >
    <div class="p-6 mt-0 py-0">
      <el-form :model="postForm">
        <el-form-item v-if="props.needReplyTitle">
          <el-input v-model="postForm.title" class="title-input"></el-input>
        </el-form-item>
        <el-form-item>
          <v-md-editor
            v-model="postForm.content"
            height="400px"
            class="content-editor"
            left-toolbar="clear | h bold italic strikethrough quote | ul ol table hr | link image code"
            right-toolbar="sync-scroll fullscreen"
            @save="handleSave" 
          ></v-md-editor>  <!-- 上面我先隐藏了save组件  后续可以扩展  -->

        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="mr-2">
        <el-button class="cancel-button" @click="$emit('update:visible', false)" 
      size="large" style="margin-top: -16px;">
        <span class="text-white font-bold">cancel</span>
      </el-button>
      <el-button class="confirm-button" type="primary" @click="handleConfirm" 
      size="large" style="margin-top: -16px;">
        <span class="text-white font-bold">post</span>
      </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import VueMarkdownEditor, { xss } from '@kangc/v-md-editor';

VMdEditor.use(githubTheme);

// 这里的save方法暴露给父组件，用于保存编辑器中的内容 
const handleSave = (text, html) => {

    console.log('text:', text);
    console.log('html:', html);
};

const getHtml = (markdownContent) => {
  const html = xss.process(VueMarkdownEditor.vMdParser.themeConfig.markdownParser.render(markdownContent));
  return html;
}

const props = defineProps({
  title: {
    type: String,
    default: 'New Post'
  },
  visible: {
    type: Boolean,
    default: false
  },
  needReplyTitle: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:visible', 'publish']);

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});


const postForm = ref({
  title: '',
  content: ''
});

const handleConfirm = () => {
  emit('publish', postForm.value);
  emit('update:visible', false); // 关闭对话框
};

const clearForm = () => {
  postForm.value = {
    title: '',
    content: ''
  };
};

defineExpose({
  clearForm,
  getHtml
});

</script>

<style scoped>
.morandi-dialog {
  background-color: #E3E0DB; /* 莫兰迪冷色调 */
  color: #4a4a4a; /* 字体颜色 */
  border-radius: 8px; /* 圆角 */
  padding: 20px; /* 内边距 */
}

:deep(.el-dialog__body) {
  padding: 0 !important;
}

:deep(.el-dialog__footer) {
  padding: 0 !important;
  margin-top: 20px;
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
.title-input {
  min-width: 300px; /* 最小宽度 */
  border-radius: 4px; /* 圆角 */
}
.content-editor {
  min-height: 400px; /* 最小高度 */
  border-radius: 4px; /* 圆角 */
  padding: 10px; /* 内边距 */
}

</style>






