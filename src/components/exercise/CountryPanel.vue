<script setup>
import { ref, computed, watch } from 'vue'
import { getCountryInfo } from '@/data/countryInfo'
import { getPhrasesFor } from '@/data/countryPhrasebook'
import { fetchKrwRate, fetchRateHistory } from '@/utils/exchangeApi'

const props = defineProps({
  countryCode: { type: String, default: null },
})

// 정적 데이터에서 바로 조회 — 네트워크 요청이 없으므로 로딩 상태가 필요 없다
const countryInfo = computed(() => getCountryInfo(props.countryCode))
const phrases = computed(() => getPhrasesFor(countryInfo.value?.languages))

// 오늘 날짜(연중 몇째 날)를 시드로 써서 시작 위치를 정한다 — 번역 API 없이도
// "오늘 방문하면 어제와 다른 문구가 보인다"는 느낌을 낼 수 있다. 세션 중 "다음"을 누르면
// 그 뒤로는 평소처럼 순서대로 순환한다.
function todaySeed(len) {
  if (!len) return 0
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now - startOfYear) / 86400000)
  return dayOfYear % len
}

const phraseIndex = ref(todaySeed(phrases.value.length))

// 1 단위 외화가 원화로 얼마인지 (open.er-api.com, 무료·키 불필요, 하루 1회 갱신)
const exchangeRate = ref(null)
const isExchangeLoading = ref(false)
// 최근 3주 환율 히스토리 (Frankfurter API) — 주요 통화가 아니면 조용히 비워둔다
const rateHistory = ref(null)

const CHART_WIDTH = 280
const CHART_HEIGHT = 60
const rateChart = computed(() => {
  const points = rateHistory.value
  if (!points || points.length < 2) return { path: '', area: '' }

  const rates = points.map((p) => p.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const range = max - min || 1
  const stepX = CHART_WIDTH / (points.length - 1)

  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: CHART_HEIGHT - 6 - ((p.rate - min) / range) * (CHART_HEIGHT - 12),
  }))
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${path} L${coords[coords.length - 1].x.toFixed(1)},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`
  return { path, area, min, max }
})

// 나라가 바뀌면 그 나라 언어 목록 기준으로 오늘의 시작 위치를 다시 잡고, 환율도 새로 조회한다
watch(
  () => props.countryCode,
  async () => {
    phraseIndex.value = todaySeed(phrases.value.length)

    exchangeRate.value = null
    rateHistory.value = null
    const code = countryInfo.value?.currencyCode
    if (!code || code === 'KRW') return

    isExchangeLoading.value = true
    const [rate, history] = await Promise.all([fetchKrwRate(code), fetchRateHistory(code)])
    exchangeRate.value = rate
    rateHistory.value = history
    isExchangeLoading.value = false
  },
)

// 매 클릭마다 서로 다른 3개 구문이 보이도록 순환 윈도우로 슬라이스
const visiblePhrases = computed(() => {
  const list = phrases.value
  if (list.length === 0) return []
  const size = Math.min(3, list.length)
  const start = phraseIndex.value % list.length
  return Array.from({ length: size }, (_, i) => list[(start + i) % list.length])
})

function nextPhrases() {
  if (phrases.value.length === 0) return
  phraseIndex.value = (phraseIndex.value + 3) % phrases.value.length
}

function formatPopulation(pop) {
  if (pop == null) return '-'
  return `${(pop / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만 명`
}
</script>

<template>
  <div class="country-panel">
    <div v-if="!countryCode" class="panel-empty">
      <span class="empty-glyph">🌍</span>
      <p>카드를 클릭하면 그 나라의 정보가 여기에 표시돼요.</p>
    </div>

    <div v-else-if="countryInfo" class="panel-body">
      <div class="country-head">
        <img v-if="countryInfo.flagUrl" class="flag-img" :src="countryInfo.flagUrl" :alt="countryInfo.name" />
        <div>
          <h4>{{ countryInfo.name }}</h4>
          <p class="country-region">{{ countryInfo.region }}</p>
        </div>
      </div>

      <div class="country-stats">
        <div class="stat">
          <span class="stat-label">🏛️ 수도</span>
          <strong>{{ countryInfo.capital }}</strong>
        </div>
        <div class="stat">
          <span class="stat-label">👥 인구</span>
          <strong>{{ formatPopulation(countryInfo.population) }}</strong>
        </div>
        <div v-if="countryInfo.currencies.length" class="stat">
          <span class="stat-label">💰 화폐</span>
          <strong>{{ countryInfo.currencies.join(', ') }}</strong>
        </div>
        <div v-if="countryInfo.currencyCode && countryInfo.currencyCode !== 'KRW'" class="stat">
          <span class="stat-label">💱 환율</span>
          <strong v-if="isExchangeLoading">조회 중...</strong>
          <strong v-else-if="exchangeRate">1 {{ countryInfo.currencyCode }} ≈ {{ Math.round(exchangeRate).toLocaleString('ko-KR') }}원</strong>
          <strong v-else>조회 실패</strong>
        </div>
      </div>

      <div v-if="rateChart.path" class="rate-chart-block">
        <div class="rate-chart-head">
          <span>최근 3주 환율 변화</span>
          <span class="rate-chart-range">
            {{ Math.round(rateChart.min).toLocaleString('ko-KR') }}~{{ Math.round(rateChart.max).toLocaleString('ko-KR') }}원
          </span>
        </div>
        <svg :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`" class="rate-chart" preserveAspectRatio="none">
          <path :d="rateChart.area" class="rate-chart-area" />
          <path :d="rateChart.path" class="rate-chart-line" fill="none" stroke-width="2" />
        </svg>
      </div>

      <div v-if="visiblePhrases.length > 0" class="phrase-box">
        <div class="phrase-head">
          <span class="phrase-title">💬 한마디 배우기</span>
          <button v-if="phrases.length > 3" class="phrase-next" @click="nextPhrases">다음 ↻</button>
        </div>
        <ul class="phrase-list">
          <li v-for="item in visiblePhrases" :key="item.text" class="phrase-row">
            <span class="phrase-left">
              <span class="phrase-text">{{ item.text }}</span>
              <span v-if="item.pronunciation" class="phrase-pronunciation">({{ item.pronunciation }})</span>
            </span>
            <span class="phrase-meaning">{{ item.meaning }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="panel-empty">
      <span class="empty-glyph">🌏</span>
      <p>이 나라의 정보는 아직 준비되지 않았어요.</p>
    </div>
  </div>
</template>

<style scoped>
.country-panel {
  margin-top: 16px;
  padding: 18px;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  animation: cardRise 0.7s var(--sky-ease) both;
}

.panel-empty {
  text-align: center;
  padding: 20px 4px;
  color: var(--sky-ink-dim);
}
.empty-glyph {
  display: block;
  font-size: 28px;
  margin-bottom: 8px;
}
.panel-empty p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.country-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.flag-img {
  width: 44px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.country-head h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--sky-ink);
}
.country-region {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--sky-ink-dim);
}

.country-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
.stat-label {
  font-size: 12px;
  color: var(--sky-ink-dim);
}
.stat strong {
  font-size: 13px;
  color: var(--sky-ink);
  text-align: right;
}

.rate-chart-block {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
}
.rate-chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--sky-ink-dim);
}
.rate-chart {
  width: 100%;
  height: 48px;
  display: block;
  overflow: visible;
}
.rate-chart-line {
  stroke: var(--sky-accent);
  transition: stroke 1s var(--sky-ease);
}
.rate-chart-area {
  fill: color-mix(in srgb, var(--sky-accent) 16%, transparent);
  transition: fill 1s var(--sky-ease);
}

.phrase-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--sky-accent) 12%, transparent),
    color-mix(in srgb, var(--sky-accent-deep) 8%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--sky-accent) 24%, transparent);
}
.phrase-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.phrase-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--sky-ink);
}
.phrase-next {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  cursor: pointer;
  transition: background 0.3s var(--sky-ease);
}
.phrase-next:hover {
  background: rgba(255, 255, 255, 0.16);
}
.phrase-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.phrase-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
}
.phrase-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.phrase-text {
  font-weight: 700;
  color: var(--sky-ink);
}
.phrase-pronunciation {
  font-size: 11px;
  color: var(--sky-ink-dim);
}
.phrase-meaning {
  color: var(--sky-ink-dim);
  white-space: nowrap;
}

@keyframes cardRise {
  from {
    opacity: 0;
    transform: translateY(1.2rem);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}
</style>
