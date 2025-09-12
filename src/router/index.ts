import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { useUserStore } from '~/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('~/components/Login.vue'),
  },
  {
    path: '/store',
    name: 'Store',
    component: () => import('~/views/StorageList.vue'),
  },
  {
    path: '/transfer',
    name: 'Transfer',
    component: () => import('~/views/Transfer.vue'),
  },
  {
    path: '/my',
    name: 'My',
    component: () => import('~/views/My.vue'),
  },
  {
    path: '/store/:storageKey/:fullpath(.*)*',
    name: 'FileList',
    component: () => import('~/views/FileList.vue'),
    props: true,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 全局守卫：访问任意页面（除登录页）时若未登录则跳转到 /login
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  // 尽量兼容多种 store 写法：token / getToken() / isLoggedIn
  const token =
    (userStore as any).token ??
    (typeof (userStore as any).getToken === 'function' ? (userStore as any).getToken() : undefined) ??
    (userStore as any).isLoggedIn

  const isLogged = Boolean(token)
  // 允许访问登录页和静态资源（如需要可扩展白名单）
  if (to.path === '/login' || to.name === 'Login') {
    next()
    return
  }

  if (!isLogged) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
