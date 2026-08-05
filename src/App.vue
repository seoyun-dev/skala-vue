<script setup>
import { ref, watch } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useAuthStore } from '@/stores/authStore'
import { useConfigStore } from '@/stores/configStore'
import { fetchThemeBackground } from '@/utils/unsplashApi'

// 카드를 선택하거나 상세페이지에 들어가면 그 도시의 실제 날씨에 맞춰
// 화면 전체 배경(그라디언트·오브 색상·포인트 컬러)이 바뀐다.
const weatherStore = useWeatherStore()
const authStore = useAuthStore()
const configStore = useConfigStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/')
}

// Unsplash 키가 설정돼 있으면 테마에 맞는 실제 사진으로, 없으면 기존 그라디언트로 자동 대체
const photoBgUrl = ref(null)
watch(
  () => weatherStore.activeTheme,
  async (theme) => {
    photoBgUrl.value = await fetchThemeBackground(theme)
  },
  { immediate: true },
)
</script>

<template>
  <div class="sky-shell" :class="`theme-${weatherStore.activeTheme}`">
    <div
      class="photo-bg"
      :class="{ 'is-visible': photoBgUrl }"
      :style="photoBgUrl ? { backgroundImage: `url(${photoBgUrl})` } : {}"
      aria-hidden="true"
    ></div>

    <div class="orb orb-a" aria-hidden="true"></div>
    <div class="orb orb-b" aria-hidden="true"></div>
    <div class="orb orb-c" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>

    <header class="app-header">
      <div class="app-header-inner">
        <RouterLink to="/" class="brand">
          <span class="brand-glyph">🌤️</span>
          <span class="brand-text">한눈에 보는 하늘</span>
        </RouterLink>

        <nav class="top-nav">
          <RouterLink to="/" class="nav-link">대시보드</RouterLink>
          <RouterLink to="/shop" class="nav-link">상점</RouterLink>
          <RouterLink to="/about" class="nav-link">소개</RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="nav-link nav-link-accent">로그인</RouterLink>
          <template v-else>
            <span class="nav-user">{{ authStore.currentUser.name }}님</span>
            <button class="nav-link" @click="logout">로그아웃</button>
          </template>
          <button
            class="unit-toggle"
            type="button"
            :title="`단위 변경 (현재 ${configStore.unitSymbol})`"
            @click="configStore.toggleUnit"
          >
            {{ configStore.unitSymbol }}
          </button>
        </nav>
      </div>
    </header>

    <main class="sky-main">
      <header class="hero">
        <h1 class="hero-title">
          오늘의 하늘을<br />
          <em>한눈에</em> 읽어드립니다
        </h1>
        <p class="hero-sub">도시를 검색하고 카드를 눌러 실시간 날씨와 스타일 추천을 확인하세요.</p>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

:root {
  --sky-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --sky-accent: #7dd3fc;
  --sky-accent-deep: #818cf8;
  --sky-ink: #f4f6fb;
  --sky-ink-dim: rgba(244, 246, 251, 0.55);
  --orb-a: rgba(129, 140, 248, 0.4);
  --orb-b: rgba(125, 211, 252, 0.32);
  --orb-c: rgba(56, 189, 248, 0.24);
}

body {
  background: #0b0f18;
  min-height: 100dvh;
}

/* ── 화면 전체 배경: 선택한 도시의 날씨에 맞춰 부드럽게 전환된다 ───────────── */
.sky-shell {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background:
    radial-gradient(1200px 800px at 85% -10%, rgba(129, 140, 248, 0.2), transparent 60%),
    radial-gradient(1000px 700px at -10% 30%, rgba(125, 211, 252, 0.16), transparent 55%),
    linear-gradient(165deg, #141a2c 0%, #0d111c 55%, #0a0e17 100%);
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: var(--sky-ink);
  word-break: keep-all;
  transition: background 1.4s var(--sky-ease);
}

/* ☀️ 맑음일 때 선택/조회하면 따뜻한 노을빛 배경으로 */
.sky-shell.theme-sunny {
  --sky-accent: #fbbf24;
  --sky-accent-deep: #f97316;
  --orb-a: rgba(251, 191, 36, 0.45);
  --orb-b: rgba(249, 115, 22, 0.32);
  --orb-c: rgba(253, 224, 71, 0.26);
  background:
    radial-gradient(1100px 750px at 82% -8%, rgba(251, 191, 36, 0.28), transparent 60%),
    radial-gradient(950px 650px at -10% 25%, rgba(249, 115, 22, 0.16), transparent 55%),
    linear-gradient(165deg, #241c0d 0%, #17130c 55%, #0e0d12 100%);
}

/* ☁️ 구름일 때는 뽀얗게 낀 하늘처럼 확 밝고 흐린 회색 톤으로 (기본 톤과 뚜렷이 대비되도록) */
.sky-shell.theme-cloudy {
  --sky-accent: #e2e8f0;
  --sky-accent-deep: #94a3b8;
  --orb-a: rgba(226, 232, 240, 0.55);
  --orb-b: rgba(203, 213, 225, 0.42);
  --orb-c: rgba(241, 245, 249, 0.32);
  background:
    radial-gradient(1100px 750px at 82% -8%, rgba(226, 232, 240, 0.34), transparent 60%),
    radial-gradient(950px 650px at -10% 25%, rgba(148, 163, 184, 0.26), transparent 55%),
    linear-gradient(165deg, #2b2f38 0%, #20232b 55%, #17191e 100%);
}

/* 🌧️ 비일 때는 깊은 청록빛 + 빗줄기 오버레이 */
.sky-shell.theme-rain {
  --sky-accent: #38bdf8;
  --sky-accent-deep: #1d4ed8;
  --orb-a: rgba(56, 130, 246, 0.45);
  --orb-b: rgba(30, 64, 175, 0.34);
  --orb-c: rgba(14, 165, 233, 0.26);
  background:
    radial-gradient(1100px 750px at 82% -8%, rgba(56, 130, 246, 0.24), transparent 60%),
    radial-gradient(950px 650px at -10% 25%, rgba(30, 64, 175, 0.18), transparent 55%),
    linear-gradient(165deg, #0d1830 0%, #0a1220 55%, #070b12 100%);
}
.sky-shell.theme-rain::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 55;
  pointer-events: none;
  opacity: 0.3;
  background-image: repeating-linear-gradient(
    100deg,
    transparent 0 4px,
    rgba(186, 230, 253, 0.16) 4px 5px,
    transparent 5px 42px
  );
  background-size: 140px 240px;
  animation: rainFall 0.85s linear infinite;
}
@keyframes rainFall {
  from {
    background-position: 0 0;
  }
  to {
    background-position: -18px 240px;
  }
}

/* ❄️ 눈일 때는 새하얀 얼음빛 톤으로 */
.sky-shell.theme-snow {
  --sky-accent: #bae6fd;
  --sky-accent-deep: #7dd3fc;
  --orb-a: rgba(224, 242, 254, 0.42);
  --orb-b: rgba(186, 230, 253, 0.32);
  --orb-c: rgba(240, 249, 255, 0.24);
  background:
    radial-gradient(1100px 750px at 82% -8%, rgba(224, 242, 254, 0.22), transparent 60%),
    radial-gradient(950px 650px at -10% 25%, rgba(186, 230, 253, 0.16), transparent 55%),
    linear-gradient(165deg, #16202e 0%, #101822 55%, #0a0f16 100%);
}

/* ── Unsplash 사진 배경 (키가 없으면 opacity 0으로 완전히 숨겨져 그라디언트만 보인다) ───── */
.photo-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.6s var(--sky-ease);
  pointer-events: none;
}
.photo-bg.is-visible {
  opacity: 1;
}
.photo-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    rgba(10, 14, 23, 0.78) 0%,
    rgba(10, 14, 23, 0.5) 55%,
    rgba(10, 14, 23, 0.82) 100%
  );
}
/* ☁️ 기본(default) 테마일 때만 — 밝은 하늘 사진 위로 구름이 천천히 흘러가는 느낌을 더한다 */
.sky-shell.theme-default .photo-bg::before {
  content: '';
  position: absolute;
  inset: -10% -60%;
  background-image:
    radial-gradient(ellipse 260px 90px at 15% 30%, rgba(255, 255, 255, 0.4), transparent 70%),
    radial-gradient(ellipse 320px 100px at 55% 60%, rgba(255, 255, 255, 0.3), transparent 70%),
    radial-gradient(ellipse 220px 80px at 85% 20%, rgba(255, 255, 255, 0.32), transparent 70%);
  animation: cloudDrift 50s linear infinite alternate;
  opacity: 0.55;
}
@keyframes cloudDrift {
  from {
    transform: translateX(-8%);
  }
  to {
    transform: translateX(8%);
  }
}

/* ── 떠다니는 배경 오브 (테마에 따라 색이 함께 바뀐다) ───────────────────────── */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.6;
  pointer-events: none;
  animation: orbFloat 9s var(--sky-ease) infinite;
  transition: background 1.4s var(--sky-ease);
}
.orb-a {
  width: 420px;
  height: 420px;
  top: -140px;
  right: -80px;
  background: radial-gradient(circle, var(--orb-a), transparent 70%);
}
.orb-b {
  width: 360px;
  height: 360px;
  bottom: 5%;
  left: -120px;
  background: radial-gradient(circle, var(--orb-b), transparent 70%);
  animation-delay: -3s;
}
.orb-c {
  width: 260px;
  height: 260px;
  top: 45%;
  right: 8%;
  background: radial-gradient(circle, var(--orb-c), transparent 70%);
  animation-delay: -6s;
}
@keyframes orbFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-18px);
  }
}

/* 필름 그레인 질감 */
.grain {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ── 상단 헤더 바: 화면을 스크롤해도 항상 붙어 있는 브랜드 + 내비게이션 ───── */
/* 배경 바(blur)는 뷰포트 전체 너비로 깔고, 그 안의 내용만 가운데로 모아서 화면이 넓어져도
   헤더가 좁은 상자처럼 붙어있지 않고 진짜 화면 상단 바처럼 보이게 한다. */
.app-header {
  position: sticky;
  top: 0;
  z-index: 80;
  width: 100%;
  background: rgba(11, 15, 24, 0.55);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  animation: riseIn 0.7s var(--sky-ease) both;
}
.app-header-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
  text-decoration: none;
}
.brand-glyph {
  font-size: 20px;
}

.top-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.nav-link {
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: transparent;
  border: 1px solid transparent;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.4s var(--sky-ease);
}
.nav-link:hover {
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.08);
}
.nav-link.router-link-exact-active {
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.12);
}
.nav-link-accent {
  color: #0b0f18;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
}
.nav-link-accent:hover {
  color: #0b0f18;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  filter: brightness(1.08);
}
.nav-user {
  padding: 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sky-ink);
  white-space: nowrap;
}

.unit-toggle {
  margin-left: 4px;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  font-family: inherit;
  letter-spacing: -0.02em;
  color: #0b0f18;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  border: none;
  cursor: pointer;
  transition:
    background 1.2s var(--sky-ease),
    transform 0.3s var(--sky-ease);
}
.unit-toggle:hover {
  transform: scale(1.05);
}
.unit-toggle:active {
  transform: scale(0.95);
}

/* ── 메인 레이아웃 ───────────────────────────── */
.sky-main {
  position: relative;
  z-index: 1;
  /* 헤더(.app-header-inner)와 같은 폭으로 맞춰서 좌우 정렬이 어긋나지 않게 한다. */
  max-width: 1320px;
  margin: 0 auto;
  padding: 56px 32px 120px;
}

.hero {
  text-align: center;
  margin-bottom: 48px;
  animation: riseIn 0.9s var(--sky-ease) both;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 2.9rem);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-sub {
  font-size: 15px;
  color: var(--sky-ink-dim);
  line-height: 1.6;
  margin: 0;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(2rem);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (max-width: 768px) {
  .sky-main {
    padding: 40px 16px 96px;
  }
  .app-header-inner {
    flex-wrap: wrap;
    padding: 12px 16px;
  }
  .top-nav {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
