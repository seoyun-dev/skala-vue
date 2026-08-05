import { createRouter, createWebHashHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  // GitHub Pages는 서버 쪽 URL 재작성을 지원하지 않아서, HTML5 history 모드로 배포하면
  // /weather/123을 새로고침하거나 직접 열었을 때 404가 뜬다. 해시 라우팅(#/weather/123)은
  // 항상 index.html 하나로만 요청이 들어가므로 정적 호스팅에서도 안전하게 동작한다.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // 첫 화면이라 항상 바로 필요하므로 지연 로딩 없이 위에서 직접 import한다.
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      // 나머지 페이지는 route-level code-splitting으로 방문 시점에만 불러와 초기 로딩 크기를 줄인다.
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/about',
      name: 'WeatherAbout',
      component: () => import('../views/WeatherAboutView.vue'),
    },
    {
      path: '/shop',
      name: 'WeatherShop',
      component: () => import('../views/WeatherShopView.vue'),
    },
    {
      path: '/login',
      name: 'WeatherAuth',
      component: () => import('../views/WeatherAuthView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
})

export default router
