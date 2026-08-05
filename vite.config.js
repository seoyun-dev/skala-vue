import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/skala-vue/',
  plugins: [
    vue(),
    vueDevTools(),
    // 재고 관리 화면의 Tailwind+Headless UI 스타일 하나만 쓴다. src/assets/tailwind.css가
    // preflight(전역 리셋) 없이 theme+utilities만 불러오므로, 기존 다크 글래스모피즘 테마와
    // 충돌 없이 클래스를 붙인 요소에만 유틸리티가 적용된다.
    tailwindcss(),
    // ✨ 추가: 홈 화면에 앱처럼 설치하고, 마지막으로 본 화면을 오프라인에서도 볼 수 있게 해준다
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg'],
      manifest: {
        name: '한눈에 보는 하늘',
        short_name: '날씨 대시보드',
        description: '실시간 날씨, 우산·옷차림 추천, 기상 레이더, 국가 정보를 한눈에 보는 날씨 대시보드',
        theme_color: '#0b0f18',
        background_color: '#0b0f18',
        display: 'standalone',
        start_url: '/skala-vue/',
        scope: '/skala-vue/',
        icons: [
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 앱 셸(JS/CSS/HTML)은 캐시해 오프라인에서도 마지막 화면이 뜨게 하고,
        // 실시간 날씨 API 응답은 캐시하지 않아 항상 최신 데이터를 시도한다.
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
