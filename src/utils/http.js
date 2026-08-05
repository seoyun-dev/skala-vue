import axios from 'axios'
import { citiesMockAdapter } from './citiesMockAdapter'
import { notesMockAdapter } from './notesMockAdapter'
import { shopMockAdapter } from './shopMockAdapter'

// 로컬 개발(npm run dev)에서는 실제 mock-api 서버를, 프로덕션 빌드(GitHub Pages)에서는
// 서버가 없으므로 아래 어댑터들이 axios 요청을 가로채 localStorage로 흉내 낸다.
export const isStaticApiMode = import.meta.env.PROD

async function mockAdapter(config) {
  const path = new URL(config.url ?? '/', 'https://mock.invalid').pathname
  if (path.startsWith('/notes')) return notesMockAdapter(config)
  if (path.startsWith('/products') || path.startsWith('/orders')) return shopMockAdapter(config)
  return citiesMockAdapter(config)
}

export const http = axios.create({
  baseURL: isStaticApiMode ? '/api' : import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3011/api',
  ...(isStaticApiMode ? { adapter: mockAdapter } : {}),
})

// 로컬 개발에서 mock-api 서버를 안 띄웠을 때(npm run dev만 실행)도 같은 어댑터로 자동 대체한다.
// 서버가 응답한 4xx/5xx는 그대로 오류로 처리하고, 서버 자체가 없어 요청이 도달하지 못한
// 경우(error.response가 없음)에만 대체한다.
if (!isStaticApiMode) {
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      if (!error.response && error.config) return mockAdapter(error.config)
      return Promise.reject(error)
    },
  )
}
