<template>
  <AppLayout>
    <template v-slot:default>
      <router-view />
    </template>

    <template v-slot:footer>
      <nav class="bottom-nav">
        <div class="nav-item" @click="router.push({ name: 'Store'})">
          <div class="nav-icon">📁</div>
          <div class="nav-label">文件</div>
        </div>
        <div class="nav-item" @click="router.push({ name: 'Transfer'})">
          <div class="nav-icon">🚀</div>
          <div class="nav-label">传输</div>
        </div>
        <div class="nav-item" @click="router.push({ name: 'My'})">
          <div class="nav-icon">👩🏻</div>
          <div class="nav-label">我的</div>
        </div>
      </nav>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '~/components/AppLayout.vue' // 导入布局组件
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style>
/* 底部导航 */
.bottom-nav {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #ffffff;
  border-top: 1px solid #eee;
  padding-bottom: env(safe-area-inset-bottom, 8px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  gap: 4px;
}

.nav-item.active {
  color: #2d8cf0;
  font-weight: 600;
}
</style>