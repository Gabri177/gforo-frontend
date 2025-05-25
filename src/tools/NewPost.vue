<template>
  <el-dialog
      v-model="visible"
      :title="props.title"
      custom-class="morandi-dialog"
      width="50%"
      @close="$emit('update:visible', false)"
      :align-center="true"

  >
    <div class="p-0 mt-3 py-0">
      <el-form :model="postForm">
        <el-form-item v-if="props.needReplyTitle" class="relative">
          <el-input v-model="postForm.title" class="title-input" :maxlength="props.maxTitleLength" show-word-limit></el-input>
        </el-form-item>

        <el-form-item>
          <v-md-editor
              v-model="postForm.content"
              ref="editorRef"
              tab-size="4"
              height="400px"
              class="content-editor w-full h-full"
              left-toolbar="clear | h bold italic strikethrough quote | ul ol table hr | link image code"
              right-toolbar="preview sync-scroll fullscreen"
              mode="edit"
              @save="handleSave"
          ></v-md-editor>  <!-- 上面我先隐藏了save组件  后续可以扩展  -->

        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="footer-container flex justify-between items-center w-full px-4 py-2">
        <!-- 字数统计 -->
        <div class="text-sm font-medium text-[#6B7C93]">
          Characters:
          <span :class="contentLength > props.maxCharCount ? 'text-red-500' : 'text-[#4A4A4A]'"
                class="text-sm font-medium text-[#6B7C93]">
        {{ contentLength }}/{{ props.maxCharCount }}
      </span>
        </div>

        <!-- 按钮 -->
        <div class="mr-2 flex gap-2">
          <el-button class="cancel-button" @click="handleCancel" size="large" style="margin-top: -16px;">
            <span class="text-white font-bold">cancel</span>
          </el-button>
          <el-button class="confirm-button" type="primary" @click="handleConfirm" :loading="postLoading" size="large"
                     style="margin-top: -16px;">
            <span class="text-white font-bold">post</span>
          </el-button>
        </div>
      </div>
    </template>

  </el-dialog>
</template>

<script setup>
import {computed, defineEmits, defineProps, onMounted, ref} from 'vue';
const editorRef = ref(null);
onMounted(() => {
  setTimeout(() => {
    const codemirrorEl = editorRef.value?.$el?.querySelector?.('.CodeMirror');
    console.log('CodeMirror DOM:', codemirrorEl);
  }, 1000); // 等待 editor 挂载
});

const contentLength = computed(() => {
  return postForm.value.content?.length || 0;
});


const postLoading = ref(false);
// 这里的save方法暴露给父组件，用于保存编辑器中的内容 
const handleSave = (text, html) => {

  console.log('text:', text);
  console.log('html:', html);
};

const getHtml = (markdownContent) => {
  return xss.process(VMdEditor.vMdParser.themeConfig.markdownParser.render(markdownContent));
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
  },
  maxCharCount: {
    type: Number,
    default: 5000
  },
  maxTitleLength: {
    type: Number,
    default: 50
  }
});

const setPostLoading = (loading) => {
  postLoading.value = loading;
};

const endPostLoading = () => {
  postLoading.value = false;
}

const emit = defineEmits(['update:visible', 'publish', 'cancel']);

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};


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

const getContent = () => {
  return {
    title: postForm.value.title,
    content: postForm.value.content
  };
};

const setPostContent = (title, content) => {
  postForm.value = {
    title: title,
    content: content
  }
};

defineExpose({
  clearForm,
  getHtml,
  getContent,
  setPostContent,
  setPostLoading,
  endPostLoading
});



</script>

<style scoped>


.footer-container {
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 0 0 8px 8px;
  font-family: 'Arial', sans-serif;
}



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
  padding: 0; /* 内边距 */
}

</style>






