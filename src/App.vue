<script setup>
import { RouterView } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'

// ✨ 추가: 카드를 선택하거나 상세페이지에 들어가면 그 도시의 실제 날씨에 맞춰
// 화면 전체 배경(그라디언트·오브 색상·포인트 컬러)이 바뀐다.
const weatherStore = useWeatherStore()
</script>

<template>
  <div class="sky-shell" :class="`theme-${weatherStore.activeTheme}`">
    <!-- 배경 장식: 메시 그라디언트 오브 -->
    <div class="orb orb-a" aria-hidden="true"></div>
    <div class="orb orb-b" aria-hidden="true"></div>
    <div class="orb orb-c" aria-hidden="true"></div>
    <div class="grain" aria-hidden="true"></div>

    <main class="sky-main">
      <header class="hero">
        <span class="eyebrow">Weather Intelligence</span>
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

/* 기본 템플릿(main.css)의 레이아웃 제약 해제 */
body {
  display: block !important;
  background: #0b0f18;
  min-height: 100dvh;
}
#app {
  max-width: none !important;
  padding: 0 !important;
  display: block !important;
  font-weight: normal;
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

/* ── 메인 레이아웃 ───────────────────────────── */
.sky-main {
  position: relative;
  z-index: 1;
  max-width: 1140px;
  margin: 0 auto;
  padding: 80px 32px 120px;
}

.hero {
  text-align: center;
  margin-bottom: 56px;
  animation: riseIn 0.9s var(--sky-ease) both;
}

.eyebrow {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.18);
  margin-bottom: 22px;
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
    padding: 64px 16px 96px;
  }
}
</style>
