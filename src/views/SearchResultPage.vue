<template>
  <div class="w-full h-full p-6 bg-[#E3E0DB] min-h-screen">
    <h2 class="text-2xl font-semibold text-[#4A4A4A] mb-4">Search Results for "{{ keyword }}"</h2>

    <el-skeleton v-if="loading" rows="5" animated />

    <template v-else>
      <el-empty v-if="discussPosts.length === 0" description="No results found for your search." />

      <ul v-else class="space-y-4">
        <li v-for="item in discussPosts" :key="item.discussPosts.id" class="bg-white/60 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow">
          <div class="flex justify-between items-center">
            <h3 class="text-xl text-[#4A4A4A] font-medium hover:text-[#A1A8C1] cursor-pointer" @click="goToPost(item.discussPosts.id)">
              <span v-html="item.discussPosts.title"></span>
            </h3>
            <UserInfoCard :user="item.user" :boardId="item.discussPosts.boardId" placement="left" />
          </div>
          <p class="mt-2 text-sm text-[#6B7C93]" v-html="item.discussPosts.content"></p>
          <div class="mt-2 text-xs text-[#6B7C93] flex justify-between">
            <span>{{ formatDate(item.discussPosts.createTime) }}</span>
            <span>
              <i class="pi pi-thumbs-up mr-1"></i>{{ item.likeCount }} |
              <i class="pi pi-comments mx-1"></i>{{ item.commentCount }}
            </span>
          </div>
        </li>
      </ul>
    </template>

    <div class="flex justify-center mt-6">
      <el-pagination
          v-if="page.total > 0"
          background
          layout="prev, pager, next"
          :total="page.total"
          :page-size="page.size"
          :current-page="page.current"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>


<script setup>
  import { onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { searchPost } from '~/api/postApi';
  import UserInfoCard from '~/tools/UserInfoCard.vue';
  
  const route = useRoute();
  const router = useRouter();
  
  const keyword = ref(route.query.keyword || '');
  const page = ref({ total: 0, size: 10, current: 1 });
  const discussPosts = ref([]);
  const loading = ref(false);
  
  const fetchData = async () => {
	loading.value = true;
	try {
	  const res = await searchPost(keyword.value, page.value.current, page.value.size);
	  console.log(res);
	  page.value.total = res.totalRows;
	  discussPosts.value = res.discussPosts;
	} catch (err) {
	  console.error(err);
	} finally {
	  loading.value = false;
	}
  };
  
  const handlePageChange = (newPage) => {
	page.value.current = newPage;
	fetchData();
  };
  
  const goToPost = (id) => {
	router.push(`/board/0/post/${id}/1`);
  };
  
  const formatDate = (dateStr) => {
	const d = new Date(dateStr);
	return d.toLocaleString();
  };

  watch(
  () => route.query.keyword,
  (newKeyword, oldKeyword) => {
    if (newKeyword && newKeyword !== oldKeyword) {
      keyword.value = newKeyword
      fetchData(newKeyword) // 自定义的搜索函数
    }
  }
)
  
onMounted(() => {
  if (keyword.value) {
    fetchData(keyword.value)
  }
})
  </script>
  
  <style scoped>
:deep(.el-pagination.is-background .el-pager li) {
  background-color: #F8FAFC;
  color: #6B7C93;
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.2s ease;
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  background-color: #A1A8C1;
  color: white;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #83B59D !important;
  color: white !important;
  font-weight: bold;
}

:deep(.el-pagination button) {
  background-color: #F8FAFC;
  color: #6B7C93;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-pagination button:hover) {
  background-color: #A1A8C1;
  color: white;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  padding: 4px 12px;
  font-size: 14px;
}
</style>

  
  