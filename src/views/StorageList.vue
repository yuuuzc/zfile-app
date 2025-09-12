<template>
  <div class="file-list-page">
    <!-- 顶部标题与操作（简洁） -->
    <div class="title-row">
      <div class="title-left">
        <div class="title-text">存储源列表</div>
      </div>
      <div class="title-right">
        <button class="icon-btn" @click="onMore">⋯</button>
        <button class="icon-btn" @click="onClose">✕</button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-wrap">
      <el-input ref="searchComp" v-model="keyword" placeholder="搜索网盘文件" clearable @clear="onSearchClear"
        @keyup.enter.native="onSearch" class="search-input">
        <template #prefix>
          <i class="search-icon">🔍</i>
        </template>
        <template #suffix>
          <el-button type="text" @click="onSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 排序与视图切换 -->
    <div class="toolbar-row">
      <div class="sort-label">按文件名 <span class="arrow">▾</span></div>
      <div class="toolbar-actions">
        <el-button type="text" circle @click="toggleView">▦</el-button>
        <el-button type="text" circle @click="openFilter">⚲</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <main class="list-wrap">
      <div v-if="loading" class="loading">加载中…</div>

      <div class="mobile-list">
        <div v-for="it in items" :key="it.key" class="mobile-item" @click="openItem(it)">
          <div class="left">
            <div class="folder-icon">📁</div>
          </div>
          <div class="center">
            <div class="name-row">
              <div class="name">{{ it.name }}</div>
              <!-- 若后端返回设备数量，优先显示；否则显示圆点占位 -->
              <div class="right-dot">
                <template v-if="getDeviceCount(it) !== null">{{ getDeviceCount(it) }} 台设备</template>
                <template v-else>◯</template>
              </div>
            </div>
            <div class="meta">
              <span class="source">来自：{{ it.type?.description || '—' }}</span>
              <span class="time">{{ formatDate(it.modified) }}</span>
            </div>
          </div>
        </div>

        <div v-if="!loading && items.length === 0" class="empty">暂无文件</div>
      </div>
    </main>

    <!-- 底部空间提示（在底部导航之上） -->
    <div class="space-row">
      <div class="space-text">共 {{ items.length }} 项 &nbsp; 剩余可用空间 5.38TB</div>
      <a class="space-link" @click.prevent="onGetMore">获取更多空间</a>
    </div>

    <!-- 浮动新增按钮 -->
    <el-button class="fab" type="primary" circle @click="onAdd">＋</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { storageListReq } from '~/api/fileApi';

const router = useRouter();

const items = ref<any[]>([]);
const loading = ref(false);
const keyword = ref('');
const searchComp = ref<any>(null);

function formatDate(val: any) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  // 格式与示例接近：yyyy-mm-dd hh:mm
  return d.toLocaleString();
}

async function fetchList() {
  loading.value = true;
  try {
    // 使用后端接口 /api/storage/list（后端返回的 data 数组即为已启用存储源，且已按后台顺序）
    const res = await storageListReq();
    const payload = (res as any).data ?? res;
    // 直接采用后端 data，保持后台顺序；兼容直接返回数组或 { code, data }
    if (Array.isArray(payload)) {
      items.value = payload;
    } else if (payload && (payload.code === 0 || payload.code === '0')) {
      items.value = Array.isArray(payload.data) ? payload.data : [];
    } else if (payload && Array.isArray(payload.data)) {
      items.value = payload.data;
    } else {
      items.value = [];
      ElMessage.error(payload?.msg || payload?.message || '获取列表失败');
    }
  } catch (err: any) {
    console.error('fetch list error', err);
    ElMessage.error(err?.message || '获取列表失败');
  } finally {
    loading.value = false;
  }
}

// 在组件里添加一个小工具函数以兼容多种设备字段名
function getDeviceCount(it: any): number | null {
  if (!it) return null;
  if (typeof it.deviceCount === 'number') return it.deviceCount;
  if (typeof it.devicesCount === 'number') return it.devicesCount;
  if (Array.isArray(it.devices)) return it.devices.length;
  return null;
}

function openItem(it: any) {
  // 跳转到存储源文件列表页，传递 key 并携带 name 为查询参数
  router.push({ name: 'FileList', params: { storageKey: it.key}, query: { storageName: it.name} });
}

function onSearch() {
  if (!keyword.value) { fetchList(); return; }
  // 简单前端过滤，复杂搜索可调用后端接口
  items.value = items.value.filter(i => (i.name || '').toLowerCase().includes(keyword.value.toLowerCase()));
}

function onSearchClear() { fetchList(); }
function toggleView() { /* 切换视图（此处保留）*/ }
function openFilter() { /* 打开筛选面板 */ }
function onAdd() { console.log('add'); }
function onMore() { console.log('more'); }
function onClose() { router.push('/'); }
function onGetMore() { console.log('get more space'); }

// 监听外部事件：刷新与搜索聚焦
function handleFocusSearch() { try { searchComp.value?.focus?.(); } catch { } }
onMounted(() => {
  fetchList();
  window.addEventListener('zfile-refresh-list', fetchList as EventListener);
  window.addEventListener('zfile-focus-search', handleFocusSearch as EventListener);
});
onUnmounted(() => {
  window.removeEventListener('zfile-refresh-list', fetchList as EventListener);
  window.removeEventListener('zfile-focus-search', handleFocusSearch as EventListener);
});
</script>

<style scoped>
.file-list-page {
  padding: calc(env(safe-area-inset-top, 20px)) 12px 86px;
  background: #f6f7f9;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 标题行 */
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 0 10px;
}

.title-text {
  font-size: 20px;
  font-weight: 600;
  color: #111;
}

.title-right {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
}

/* 搜索 */
.search-wrap {
  margin: 8px 0;
}

.search-input .el-input__inner {
  border-radius: 12px;
  background: #fff;
  padding-left: 12px;
  height: 44px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 工具条 */
.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  color: #666;
  font-size: 13px;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 列表项 */
.list-wrap {
  margin-bottom: 12px;
}

.mobile-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-item {
  display: flex;
  gap: 12px;
  align-items: center;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.left .folder-icon {
  font-size: 34px;
  width: 44px;
  text-align: center;
}

.center {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-weight: 600;
  font-size: 16px;
  color: #111;
}

.right-dot {
  color: #999;
  font-size: 18px;
}

.meta {
  margin-top: 6px;
  color: #9b9b9b;
  font-size: 13px;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 空状态 */
.empty {
  text-align: center;
  color: #999;
  padding: 18px;
}

/* 底部空间提示 */
.space-row {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background: transparent;
  padding: 8px 16px;
  z-index: 30;
  pointer-events: none;
}

.space-text {
  color: #999;
  font-size: 13px;
  pointer-events: auto;
}

.space-link {
  color: #2d8cf0;
  font-size: 13px;
  cursor: pointer;
  pointer-events: auto;
}

/* fab */
.fab {
  position: fixed;
  right: 18px;
  bottom: 76px;
  z-index: 50;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  box-shadow: 0 8px 20px rgba(45, 140, 240, 0.18);
}

/* 小屏优化 */
@media (max-width:420px) {
  .name {
    font-size: 15px;
  }

  .meta {
    font-size: 12px;
  }

  .fab {
    width: 52px;
    height: 52px;
    bottom: 72px;
    right: 14px;
  }
}
</style>