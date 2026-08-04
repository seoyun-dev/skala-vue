<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { getWeatherAdvice } from '@/utils/weatherAdvice'
import { getStyleItemsFor } from '@/data/styleItems'
import { useWeatherStore } from '@/stores/weatherStore'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()

const cityData = ref(null)
const isLoading = ref(false)
const hasError = ref(false)

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 풍향(0~360°)을 8방위 한글 명칭으로 변환
const degToDirection = (deg) => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return directions[Math.round(deg / 45) % 8]
}

// 유닉스 타임스탬프(초)를 HH:MM 표기로 변환
const formatTime = (unix) =>
  new Date(unix * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

// 어떤 도시든 OpenWeatherMap 도시 코드(:cityId)로 조회한다.
// 한글 지명은 API가 돌려주지 않으므로 목록에서 넘겨준 ?name 쿼리를 우선 사용한다.
const fetchCityDetail = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const response = await axios.get(BASE_URL, {
      params: { id: route.params.cityId, appid: API_KEY, units: 'metric', lang: 'kr' },
    })

    const raw = response.data
    cityData.value = {
      name: route.query.name || raw.name,
      temp: Math.round(raw.main.temp),
      feelsLike: Math.round(raw.main.feels_like),
      tempMin: Math.round(raw.main.temp_min),
      tempMax: Math.round(raw.main.temp_max),
      status: raw.weather[0].description,
      statusMain: raw.weather[0].main,
      // 공식 아이콘 코드(예: 01d)를 이미지 URL로 조립
      icon: `https://openweathermap.org/img/wn/${raw.weather[0].icon}@4x.png`,
      humidity: `${raw.main.humidity}%`,
      humidityRaw: raw.main.humidity,
      pressure: `${raw.main.pressure}hPa`,
      wind: `${raw.wind.speed}m/s`,
      windSpeedRaw: raw.wind.speed,
      windDirection: raw.wind.deg != null ? `${degToDirection(raw.wind.deg)}풍` : '-',
      gust: raw.wind.gust != null ? `${raw.wind.gust}m/s` : '-',
      clouds: `${raw.clouds.all}%`,
      visibility: `${(raw.visibility / 1000).toFixed(1)}km`,
      sunrise: formatTime(raw.sys.sunrise),
      sunset: formatTime(raw.sys.sunset),
      observedAt: formatTime(raw.dt),
    }
    // ✨ 추가: 이 도시의 실제 날씨에 맞춰 전체 화면 배경을 바꾼다 (App.vue가 구독)
    weatherStore.setActiveTheme(raw.weather[0].main)
  } catch (error) {
    console.error('🔴 상세 정보 로딩 중 네트워크 에러 발생:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

// 상세 페이지가 화면에 장착되는 시점에 해당 도시의 관측 데이터 요청
onMounted(fetchCityDetail)

// ✨ 추가: "오늘의 추천" — 우산/옷차림/강풍 조언 + 조건에 맞는 스타일 아이템
const advice = computed(() => {
  if (!cityData.value) return null
  return getWeatherAdvice({
    tempC: cityData.value.temp,
    feelsLikeC: cityData.value.feelsLike,
    humidityPct: cityData.value.humidityRaw,
    windSpeedMs: cityData.value.windSpeedRaw,
    statusMain: cityData.value.statusMain,
  })
})
const recommendedItems = computed(() => (advice.value ? getStyleItemsFor(advice.value.tags) : []))
</script>

<template>
  <div class="detail-container">
    <div class="section-head">
      <h3>지역별 상세 기상 관측</h3>
      <span class="count-chip">LIVE</span>
    </div>

    <div v-if="isLoading" class="loading-state">
      <span class="loading-glyph">🛰️</span>
      <p>상세 관측 데이터를 수신 중입니다...</p>
    </div>

    <div v-else-if="hasError" class="error-state">
      <span class="error-glyph">🔴</span>
      <p>상세 데이터를 불러오지 못했습니다. (API 한도 초과이거나 네트워크 문제)</p>
      <button class="retry-btn" @click="fetchCityDetail">다시 시도</button>
    </div>

    <template v-else>
      <div v-if="cityData" class="info-card">
        <p class="city-name">📍 {{ cityData.name }}</p>
        <img class="weather-icon" :src="cityData.icon" :alt="cityData.status" />
        <p class="temp-hero">{{ cityData.temp }}<span>°C</span></p>
        <p class="status-line">{{ cityData.status }} · 체감 {{ cityData.feelsLike }}°C</p>
        <p class="range-line">
          최저 <strong>{{ cityData.tempMin }}°</strong> / 최고
          <strong>{{ cityData.tempMax }}°</strong>
        </p>

        <!-- ✨ 추가: 오늘의 추천 — 히어로 바로 아래, 눈에 띄는 배너로 배치 -->
        <div v-if="advice" class="advice-banner">
          <span class="advice-badge-label">✨ 오늘의 추천</span>

          <ul class="advice-list">
            <li class="advice-row">
              <span class="advice-icon">{{ advice.umbrella.icon }}</span>
              <span class="advice-text">{{ advice.umbrella.message }}</span>
            </li>
            <li class="advice-row">
              <span class="advice-icon">{{ advice.outfit.icon }}</span>
              <span class="advice-text">{{ advice.outfit.message }}</span>
            </li>
            <li class="advice-row">
              <span class="advice-icon">{{ advice.wind.icon }}</span>
              <span class="advice-text">{{ advice.wind.message }}</span>
            </li>
          </ul>

          <div v-if="recommendedItems.length > 0" class="item-grid">
            <div v-for="item in recommendedItems" :key="item.id" class="style-item">
              <span class="item-icon">{{ item.icon }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-tip">{{ item.tip }}</span>
            </div>
          </div>
        </div>

        <div class="metric-grid">
          <div class="metric">
            <span class="metric-label">💧 대기 습도</span>
            <strong>{{ cityData.humidity }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">🌬️ 풍속 · 풍향</span>
            <strong>{{ cityData.wind }} {{ cityData.windDirection }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">💨 순간 돌풍</span>
            <strong>{{ cityData.gust }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">☁️ 구름량</span>
            <strong>{{ cityData.clouds }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">🧭 해면 기압</span>
            <strong>{{ cityData.pressure }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">👁️ 가시거리</span>
            <strong>{{ cityData.visibility }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">🌅 일출</span>
            <strong>{{ cityData.sunrise }}</strong>
          </div>
          <div class="metric">
            <span class="metric-label">🌇 일몰</span>
            <strong>{{ cityData.sunset }}</strong>
          </div>
        </div>

        <p class="observed-line">관측 시각 기준 {{ cityData.observedAt }}</p>
      </div>

      <div v-if="!cityData" class="error-state">
        <span class="error-glyph">🌫️</span>
        <p>해당 지역의 상세 데이터 장부가 존재하지 않습니다.</p>
      </div>
    </template>

    <button class="back-btn" @click="router.push('/')">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
  animation: riseIn 0.7s var(--sky-ease) both;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.section-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
}
.count-chip {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
}

.info-card {
  text-align: center;
  padding: 28px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 20px;
}
.city-name {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sky-ink-dim);
}
.weather-icon {
  width: 96px;
  height: 96px;
  margin: -8px auto -14px;
  display: block;
  filter: drop-shadow(0 6px 18px rgba(125, 211, 252, 0.25));
}
.temp-hero {
  margin: 0;
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.temp-hero span {
  font-size: 26px;
  font-weight: 700;
}
.status-line {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--sky-ink-dim);
}
.range-line {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.range-line strong {
  color: var(--sky-ink);
  font-weight: 600;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
}
.observed-line {
  margin: 18px 0 0;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--sky-ink-dim);
}
.metric {
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.metric-label {
  display: block;
  font-size: 12px;
  color: var(--sky-ink-dim);
  margin-bottom: 6px;
}
.metric strong {
  font-size: 18px;
  color: var(--sky-ink);
}

/* ✨ 오늘의 추천 — 히어로 바로 아래, 테마 포인트 컬러로 눈에 띄게 강조 */
.advice-banner {
  position: relative;
  overflow: hidden;
  margin: 22px 0 4px;
  padding: 20px;
  border-radius: 18px;
  text-align: left;
  background: linear-gradient(135deg, color-mix(in srgb, var(--sky-accent) 16%, transparent), color-mix(in srgb, var(--sky-accent-deep) 10%, transparent));
  border: 1px solid color-mix(in srgb, var(--sky-accent) 32%, transparent);
  box-shadow: 0 10px 32px -14px color-mix(in srgb, var(--sky-accent) 45%, transparent);
  transition:
    background 1s var(--sky-ease),
    border-color 1s var(--sky-ease),
    box-shadow 1s var(--sky-ease);
}
.advice-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -15%;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--sky-accent), transparent 70%);
  opacity: 0.28;
  filter: blur(28px);
  pointer-events: none;
  transition: background 1s var(--sky-ease);
}
.advice-badge-label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0b0f18;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
}

.advice-list {
  position: relative;
  z-index: 1;
  list-style: none;
  margin: 0 0 4px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.advice-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--sky-ink);
}
.advice-icon {
  flex: none;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.advice-text {
  padding-top: 4px;
  color: var(--sky-ink);
}

.item-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 18px;
}
.style-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  padding: 14px 10px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--sky-accent);
  transition: border-color 1s var(--sky-ease);
}
.item-icon {
  font-size: 22px;
}
.item-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--sky-ink);
}
.item-tip {
  font-size: 11px;
  color: var(--sky-ink-dim);
  line-height: 1.4;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 36px 0 28px;
  color: var(--sky-ink-dim);
}
.loading-glyph,
.error-glyph {
  display: block;
  font-size: 34px;
  margin-bottom: 10px;
}
.loading-glyph {
  animation: detailPulse 1.6s var(--sky-ease) infinite;
}
.loading-state p,
.error-state p {
  margin: 0;
  font-size: 14px;
}
.error-state p {
  color: #f87171;
}
@keyframes detailPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.retry-btn,
.back-btn {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background 0.3s var(--sky-ease);
}
.retry-btn:hover,
.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.retry-btn {
  margin-top: 14px;
}
.back-btn {
  display: block;
  margin: 0 auto;
}
</style>
