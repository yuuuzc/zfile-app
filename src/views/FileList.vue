<template>
  <div class="storage-files-page">
    <div class="header">
      <el-button type="text" @click="goBack()">返回</el-button>
      <div class="title">{{ storageName || ('存储 ' + storageKey) }}</div>
    </div>

    <div class="list-wrap">
      <div v-if="loading" class="loading">加载中…</div>

      <div v-else>
        <div v-if="items.length === 0" class="empty">暂无文件</div>

        <div v-for="f in items" :storageKey="f.path + f.name" class="file-item" @click="openFile(f)">
          <div class="left">
            <div class="file-icon" v-if="f.type === 'FILE'">📄</div>
            <div class="file-icon" v-else>📁</div>
          </div>
          <div class="center">
            <div class="name">{{ f.name }}</div>
            <div class="meta">{{ f.time || formatDate(f.time) }} · {{ formatSize(f.size) }}</div>
          </div>
          <div class="right" v-if="f.type === 'FILE'">
            <el-button type="text" @click.stop="openFile(f)">下载</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { filesReq } from '~/api/fileApi';

const route = useRoute();
const router = useRouter();
const storageKey = String(route.params.storageKey ?? '');
const storageName = (route.query.storageName as string) ?? '';
const items = ref<any[]>([]);
const loading = ref(false);

// 可由用户导航或面包屑改变
const path = ref<string>(String(route.query.path ?? '/'));

function formatSize(n: number | undefined) {
  if (!n && n !== 0) return '';
  const bytes = Number(n);
  if (isNaN(bytes)) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatDate(val: any) {
  if (!val) return '';
  try { return String(val); } catch { return ''; }
}

async function fetchFiles() {
  if (!storageKey) return;
  loading.value = true;
  try {
    const body = {
      init: true,
      storageKey: storageKey,
      path: path.value || '/',
      password: '',
      orderBy: 'name',
      orderDirection: 'asc',
    };
    const res = await filesReq(body);
    const payload = (res as any).data ?? res;

    const files = payload && payload.data && Array.isArray(payload.data.files)
      ? payload.data.files
      : Array.isArray(payload)
        ? payload
        : (payload && Array.isArray(payload.files) ? payload.files : []);

    items.value = files;
  } catch (err: any) {
    console.error('fetch files error', err);
    ElMessage.error(err?.message || '获取文件失败');
    items.value = [];
  } finally {
    loading.value = false;
  }
}

function openFile(f: any) {
  if (f.type === 'FILE' && f.url) {
    window.open(f.url, '_blank');
    return;
  }
  if (f.type !== 'FILE') {
    path.value = f.path === '/' ? `/${f.name}` : `${f.path}/${f.name}`;
    router.replace({ name: 'FileList', params: { storageKey: f.storageKey, fullpath: f.name} });
    fetchFiles();
  }
}

function goBack() {
  router.back();
}

function reload() {
  fetchFiles();
}

onMounted(() => {
  fetchFiles();
});
</script>

<style scoped>
.storage-files-page { padding: 12px; min-height: 100vh; background: #f6f7f9; box-sizing: border-box; }
.header { display:flex; align-items:center; gap:12px; margin-bottom:10px; }
.title { font-size:18px; font-weight:600; }
.path-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; color:#666; font-size:13px; }
.list-wrap { margin-top:6px; }
.file-item { display:flex; gap:12px; align-items:center; padding:12px; background:#fff; border-radius:10px; margin-bottom:10px; border:1px solid rgba(0,0,0,0.04); }
.left { width:44px; text-align:center; font-size:22px; }
.center { flex:1; }
.name { font-weight:600; color:#111; }
.meta { color:#999; font-size:13px; margin-top:6px; }
.right { padding-left:8px; }
.empty { text-align:center; color:#999; padding:18px; }
</style>