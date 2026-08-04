import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'WeatherHome',
      component: WeatherHomeView,
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      // route level code-splitting: 상세 페이지 방문 시점에 지연 로딩
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/',
    },
  ],
})

export default router
