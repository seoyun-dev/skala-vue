<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { getConditionTags } from '@/utils/weatherAdvice'

const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const router = useRouter()

const statusGlyph = computed(
  () => ({ 맑음: '☀️', 비: '🌧️', 구름: '☁️', 눈: '❄️' })[weatherStore.myLocation?.status] ?? '🌤️',
)

const conditionTags = computed(() => {
  const city = weatherStore.myLocation
  if (!city) return []
  return getConditionTags({
    feelsLikeC: city.feelsLike,
    humidityPct: city.humidity,
    windSpeedMs: city.windSpeed,
    statusMain: city.statusMain,
  })
})
const tagGlyphMap = { rain: '☔', windy: '💨', hot: '🥵', cold: '🥶' }
const tagLabelMap = { rain: '우산 필요', windy: '강풍 주의', hot: '더움', cold: '추움' }

const goDetail = () => {
  const city = weatherStore.myLocation
  if (!city) return
  router.push({ name: 'WeatherDetail', params: { cityId: city.id }, query: { name: city.name } })
  weatherStore.setActiveTheme(city.statusMain)
}
</script>

<template>
  <div class="my-location-card" :class="`state-${weatherStore.myLocationStatus}`">
    <div class="loc-tag">📍 내 위치</div>

    <div v-if="weatherStore.myLocationStatus === 'loading'" class="loc-body loc-status">
      <span class="loc-glyph pulse">📡</span>
      <p>내 위치를 확인하는 중입니다...</p>
    </div>

    <div v-else-if="weatherStore.myLocationStatus === 'error'" class="loc-body loc-status">
      <span class="loc-glyph">🌫️</span>
      <p>위치 확인에 실패했어요. (브라우저 GPS와 IP 기반 위치 모두 실패했어요)</p>
      <button class="loc-retry" @click="weatherStore.loadMyLocation">다시 시도</button>
    </div>

    <div
      v-else-if="weatherStore.myLocationStatus === 'ready' && weatherStore.myLocation"
      class="loc-body loc-ready"
      @click="goDetail"
    >
      <div class="loc-glyph-tile">{{ statusGlyph }}</div>

      <div class="loc-info">
        <h4>
          {{ weatherStore.myLocation.name }}
          <span v-if="weatherStore.myLocation.isApprox" class="loc-approx" title="브라우저 GPS 대신 IP 기반으로 추정한 대략적인 위치예요">
            대략적 위치
          </span>
        </h4>
        <p>{{ weatherStore.myLocation.status }} · 체감 {{ configStore.formatTemp(weatherStore.myLocation.feelsLike) }}°</p>
        <div v-if="conditionTags.length > 0" class="loc-badges">
          <span v-for="tag in conditionTags" :key="tag" class="loc-badge" :title="tagLabelMap[tag]">
            {{ tagGlyphMap[tag] }}
          </span>
        </div>
      </div>

      <div class="loc-temp">
        {{ configStore.formatTemp(weatherStore.myLocation.temp) }}<small>{{ configStore.unitSymbol }}</small>
      </div>

      <button class="loc-detail-btn" @click.stop="goDetail">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
.my-location-card {
  position: relative;
  grid-column: 1 / -1;
  padding: 18px 22px;
  border-radius: 1.25rem;
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--sky-accent) 14%, transparent),
    color-mix(in srgb, var(--sky-accent-deep) 10%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--sky-accent) 30%, transparent);
  box-shadow: 0 12px 36px -18px color-mix(in srgb, var(--sky-accent) 45%, transparent);
  animation: cardRise 0.7s var(--sky-ease) both;
  transition:
    background 1.2s var(--sky-ease),
    border-color 1.2s var(--sky-ease);
}

.loc-tag {
  position: absolute;
  top: -11px;
  left: 20px;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #050505;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  box-shadow: 0 4px 14px -4px color-mix(in srgb, var(--sky-accent) 60%, transparent);
}

.loc-body {
  padding-top: 6px;
}

.loc-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.loc-status p {
  margin: 0;
  font-size: 14px;
  color: var(--sky-ink-dim);
  flex: 1;
  min-width: 180px;
}
.loc-glyph {
  font-size: 24px;
}
.loc-glyph.pulse {
  animation: pulse 1.6s var(--sky-ease) infinite;
}
.loc-retry {
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.3s var(--sky-ease);
}
.loc-retry:hover {
  background: rgba(255, 255, 255, 0.16);
}

.loc-ready {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}
.loc-glyph-tile {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
}
.loc-info h4 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 700;
  color: var(--sky-ink);
}
.loc-approx {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  color: var(--sky-ink-dim);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: help;
}
.loc-info p {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.loc-badges {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}
.loc-badge {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}
.loc-temp {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--sky-ink);
}
.loc-temp small {
  font-size: 16px;
  font-weight: 600;
  color: var(--sky-ink-dim);
}
.loc-detail-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  color: #050505;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.4s var(--sky-ease);
  white-space: nowrap;
}
.loc-detail-btn:hover {
  transform: scale(1.05);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.85);
  }
}

@keyframes cardRise {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (max-width: 640px) {
  .loc-ready {
    grid-template-columns: auto minmax(0, 1fr) auto;
    row-gap: 10px;
  }
  .loc-detail-btn {
    grid-column: 1 / -1;
  }
}
</style>
