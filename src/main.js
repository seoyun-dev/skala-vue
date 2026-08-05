import './assets/main.css'
// 재고 관리 화면의 Tailwind+Headless UI 스타일에서만 쓴다 — preflight 없이 유틸리티만 있어서
// 클래스를 붙이지 않은 다른 요소에는 영향이 없다.
import './assets/tailwind.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 이 앱이 항상 다크 테마라 Element Plus 다크 변형 CSS를 같이 불러온다.
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import ko from 'element-plus/es/locale/lang/ko'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: ko })

app.mount('#app')
