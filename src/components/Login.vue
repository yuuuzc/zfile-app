<template>
  <div class="login-page">
    <el-card class="login-card">
      <el-form :model="form" class="login-form" @submit.prevent="onSubmit">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="用户名" autocomplete="username" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '~/stores/user';
import { loginReq } from '~/api/userApi';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: '',
  password: '',
});

const loading = ref(false);

async function onSubmit() {
  if (loading.value) return;
  loading.value = true;
  try {

    const res = await loginReq(form)

    // 兼容两种封装：axios 原始 AxiosResponse 或者拦截器直接返回的 data
    const loginData = res.data ?? res;
    if (loginData?.token) {
      userStore.token = loginData.token;
    }

    ElMessage.success('登录成功');

    // 跳转到文件列表页面：优先使用 /files，若你的路由用 name，请替换为对应的 name（如 'FileList'）
    await router.replace({ name: 'Store' });
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '登录失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 380px;
  padding: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
