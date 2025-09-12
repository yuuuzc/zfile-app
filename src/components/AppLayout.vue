<template>
  <!-- 根容器，占据整个视口并隐藏溢出 -->
  <div class="app-layout" :style="rootStyle">
    
    <!-- 顶部导航栏 (固定) -->
    <header v-if="$slots.header" class="app-header">
      <slot name="header"></slot>
    </header>

    <!-- 主体内容区域 (Flex 布局) -->
    <div class="app-body">
      
      <!-- 侧边栏 (可选) -->
      <aside v-if="$slots.sidebar" class="app-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-inner">
          <slot name="sidebar"></slot>
        </div>
        <!-- 侧边栏折叠/展开按钮 -->
        <button v-if="showSidebarToggle" class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          {{ sidebarCollapsed ? '→' : '←' }}
        </button>
      </aside>

      <!-- 主内容区域 (可滚动) -->
      <main class="app-main">
        <div class="main-content">
          <slot></slot> <!-- 默认插槽，用于放置主要内容 -->
        </div>
      </main>

    </div>

    <!-- 底部栏 (固定, 可选) -->
    <footer v-if="$slots.footer" class="app-footer">
      <slot name="footer"></slot>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props 定义
interface Props {
  // 是否显示侧边栏切换按钮
  showSidebarToggle?: boolean
  // 侧边栏初始是否折叠
  initialSidebarCollapsed?: boolean
  // 自定义顶部高度 (用于固定定位的元素，如自定义导航栏)
  headerHeight?: string
  // 自定义底部高度
  footerHeight?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSidebarToggle: false,
  initialSidebarCollapsed: false,
  headerHeight: '0px',
  footerHeight: '0px'
})

// 状态管理
const sidebarCollapsed = ref(props.initialSidebarCollapsed)
const windowHeight = ref(window.innerHeight)

// 计算样式，动态适应移动端顶部底部栏（如iOS Safari）
const rootStyle = computed(() => {
  return {
    '--window-height': `${windowHeight.value}px`,
    '--header-height': props.headerHeight,
    '--footer-height': props.footerHeight,
  }
})

// 处理移动端视口高度变化
const handleResize = () => {
  windowHeight.value = window.innerHeight
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
  // 初始化时计算一次，解决移动端100vh问题
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 核心样式：解决移动端100vh问题 */
.app-layout {
  --header-height: 60px; /* 默认值，会被JS覆盖 */
  --footer-height: 0px;
  --sidebar-width: 250px;
  --sidebar-collapsed-width: 60px;
  
  position: fixed; /* 使用 fixed 而非 100vh 来更好地处理移动端 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--window-height);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 禁用全局滚动 */
}

/* 顶部导航 */
.app-header {
  flex-shrink: 0;
  z-index: 100;
  /* 背景色、阴影等根据实际需求添加 */
  /* background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); */
}

/* 主体内容区域 (Flex 容器) */
.app-body {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  min-height: 0; /* 关键：允许内部内容溢出并滚动 */
}

/* 侧边栏样式 */
.app-sidebar {
  position: relative;
  flex-shrink: 0;
  width: var(--sidebar-width);
  transition: width 0.3s ease;
  background-color: #f8f9fa; /* 示例背景色 */
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-inner {
  flex: 1;
  overflow-y: auto; /* 侧边栏内部可滚动 */
  -webkit-overflow-scrolling: touch; /* iOS 弹性滚动 */
}

.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: -15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止内容溢出 */
  position: relative;
}

.main-content {
  flex: 1;
  overflow-y: auto; /* 主内容区可滚动 */
  -webkit-overflow-scrolling: touch; /* iOS 弹性滚动 */
  /* 可选：添加内边距 */
  padding: 16px;
}

/* 底部栏 */
.app-footer {
  flex-shrink: 0;
  z-index: 100;
  /* background-color: #f8f9fa;
  border-top: 1px solid #e9ecef; */
}

/* 移动端适配 */
@media (max-width: 768px) {
  .app-sidebar {
    position: absolute; /* 在移动端侧边栏可以覆盖式出现 */
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 90;
    transform: translateX(-100%);
    width: 80%; /* 移动端侧边栏宽度 */
  }

  .sidebar-collapsed {
    transform: translateX(0);
    width: 80%;
  }

  .sidebar-toggle {
    display: none; /* 在移动端可以隐藏切换按钮，改用滑动手势或菜单按钮 */
  }

  .main-content {
    padding: 12px; /* 移动端减少内边距 */
  }
}

/* 可选：自定义滚动条样式 (Webkit 浏览器) */
.main-content::-webkit-scrollbar,
.sidebar-inner::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track,
.sidebar-inner::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-content::-webkit-scrollbar-thumb,
.sidebar-inner::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover,
.sidebar-inner::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>