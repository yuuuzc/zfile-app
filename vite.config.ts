import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// import VueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // VueDevTools(), // 👈 开启 Devtools
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    host: '0.0.0.0', // 方便局域网调试
    port: 5174,
    // proxy: {
    //   // 仅代理后端接口前缀，保留 Vite 的静态与 HMR 请求
    //   '/api': {
    //     target: 'http://127.0.0.1:8080',
    //     changeOrigin: true,
    //     // 保持 /api 前缀转发，如果后端不需要前缀可使用 rewrite 去掉
    //     rewrite: path => path.replace(/^\/api/, ''),
    //   },
    //   '/user': {
    //     target: 'http://127.0.0.1:8080',
    //     changeOrigin: true,
    //   }
    // }
  }
})
