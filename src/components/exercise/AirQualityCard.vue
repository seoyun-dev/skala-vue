<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// OpenWeatherMap 무료 Air Pollution API — 같은 .env 키를 그대로 재사용한다
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const AQI_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
})

const aqi = ref(null)
const components = ref(null)
const isLoading = ref(false)
const hasError = ref(false)

// OpenWeatherMap 대기질 지수(1~5)를 한글 등급/색상/한마디 조언으로 매핑
const AQI_LEVELS = {
  1: { label: '좋음', color: '#4ade80', tip: '야외 활동에 좋은 날이에요.' },
  2: { label: '양호', color: '#86efac', tip: '평소처럼 야외 활동해도 괜찮아요.' },
  3: { label: '보통', color: '#facc15', tip: '민감군은 장시간 외출을 주의하세요.' },
  4: { label: '나쁨', color: '#fb923c', tip: '외출 시 마스크 착용을 권장해요.' },
  5: { label: '매우 나쁨', color: '#f87171', tip: '외출을 자제하고 마스크를 꼭 착용하세요.' },
}

async function fetchAqi() {
  isLoading.value = true
  hasError.value = false
  try {
    const res = await axios.get(AQI_URL, {
      params: { lat: props.lat, lon: props.lon, appid: API_KEY },
    })
    const data = res.data.list[0]
    aqi.value = data.main.aqi
    components.value = data.components
  } catch (error) {
    console.error('🔴 대기질 조회 실패:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAqi)
</script>

<template>
  <div class="aqi-card">
    <h4>😷 대기질</h4>

    <div v-if="isLoading" class="aqi-status">불러오는 중...</div>
    <div v-else-if="hasError" class="aqi-status">대기질 정보를 가져오지 못했어요.</div>

    <div v-else-if="aqi && AQI_LEVELS[aqi]" class="aqi-body">
      <div class="aqi-level" :style="{ color: AQI_LEVELS[aqi].color }">
        <span class="aqi-dot" :style="{ background: AQI_LEVELS[aqi].color }"></span>
        {{ AQI_LEVELS[aqi].label }}
      </div>
      <p class="aqi-tip">{{ AQI_LEVELS[aqi].tip }}</p>
      <div class="aqi-metrics">
        <span>PM2.5 <strong>{{ Math.round(components.pm2_5) }}</strong></span>
        <span>PM10 <strong>{{ Math.round(components.pm10) }}</strong></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aqi-card {
  margin-top: 22px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  /* 상위 .info-card가 text-align:center를 내려주므로, flex로 배치되는 아래 요소들도
     justify-content로 맞춰줘야 "양호" 뱃지만 왼쪽으로 치우치는 문제가 생기지 않는다 */
  text-align: center;
}
.aqi-card h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.aqi-status {
  padding: 6px 0 2px;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.aqi-level {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
}
.aqi-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}
.aqi-tip {
  margin: 6px 0 12px;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.aqi-metrics {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.aqi-metrics strong {
  color: var(--sky-ink);
}
</style>
