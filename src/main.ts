import { createApp } from 'vue'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'

import App from '~/App.vue'
import router from '~/router'

createApp(App).use(createPinia().use(persistedstate))
              .use(elementPlus)
              .use(router)
              .mount('#app')