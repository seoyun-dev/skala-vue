<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// 1. 컴포넌트 파일명 국룰 표기법(PascalCase) 매칭 수입
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { useWeatherStore } from '@/stores/weatherStore'

// 날씨 목록·검색·저장 로직은 모두 Pinia 스토어가 소유한다.
// 이 컴포넌트는 검색어 입력 상태(UI 전용)와 화면 표시만 담당하는 얇은 뷰로 정리했다.
const weatherStore = useWeatherStore()
const router = useRouter()

const searchQuery = ref('')

onMounted(() => weatherStore.init())
onUnmounted(() => weatherStore.dispose())

// 로컬 목록에서 검색어로 즉시 필터링
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  if (!query) return weatherStore.weatherList
  return weatherStore.weatherList.filter((item) => item.name.includes(query))
})

// 로컬 목록에 없는 검색어면 스토어에 디바운스 원격검색을 위임
watch(searchQuery, (value) => {
  const query = value.trim()
  if (!query || filteredWeatherList.value.length > 0) {
    weatherStore.clearSearchState()
    return
  }
  weatherStore.scheduleSearch(query)
})

// 기본 목록 우선, 비어 있으면 원격 검색 결과로 대체
const displayList = computed(() => {
  if (filteredWeatherList.value.length > 0) return filteredWeatherList.value
  return weatherStore.remoteCity ? [weatherStore.remoteCity] : []
})

// 지금 보여주는 카드가 저장된 목록이 아니라 원격 검색 결과인지
const isRemoteResult = computed(
  () => filteredWeatherList.value.length === 0 && weatherStore.remoteCity !== null,
)

const addCity = (city) => {
  weatherStore.addCity(city)
  // 검색어를 비우면 watch가 원격 검색 상태까지 정리하고 전체 목록으로 되돌아간다
  searchQuery.value = ''
}

// 상세보기 클릭 시 라우터로 동적 파라미터(/weather/:cityId) 상세 페이지 이동
// 한글 지명은 API가 돌려주지 않으므로 쿼리로 함께 넘긴다
const goDetail = (city) => {
  router.push({ name: 'WeatherDetail', params: { cityId: city.id }, query: { name: city.name } })
}

const syncLabel = computed(() => {
  switch (weatherStore.serverSyncStatus) {
    case 'syncing':
      return '동기화 중…'
    case 'success':
      return '✅ 서버에 저장됨'
    case 'error':
      return '⚠️ 서버 연결 실패'
    default:
      return '☁️ 서버에도 저장'
  }
})
</script>

<template>
  <div class="dashboard-wrapper">
    <aside class="dash-side">
      <BaseDashboardCard style="--index: 1">
        <SearchBar :current-query="searchQuery" @update-query="(val) => (searchQuery = val)" />
      </BaseDashboardCard>

      <div class="status-bar">
        <span class="status-dot"></span>
        {{ weatherStore.selectedCityInfo }}
      </div>
    </aside>

    <BaseDashboardCard class="dash-list" style="--index: 2">
      <div class="section-head">
        <h3>지역별 날씨 현황</h3>
        <div class="head-actions">
          <button
            class="sync-btn"
            :class="weatherStore.serverSyncStatus"
            :disabled="weatherStore.serverSyncStatus === 'syncing'"
            title="mock-api 서버에 현재 목록을 저장합니다 (npm run dev:all 로 서버를 켠 경우에만 동작)"
            @click="weatherStore.syncToServer"
          >
            {{ syncLabel }}
          </button>
          <span class="count-chip">{{ displayList.length }}개 도시</span>
        </div>
      </div>

      <div v-if="weatherStore.isLoading" class="loading-state">
        <span class="loading-glyph">🛰️</span>
        <p>실시간 기상 데이터를 수신 중입니다...</p>
      </div>

      <div v-else-if="weatherStore.hasError" class="error-state">
        <span class="error-glyph">🔴</span>
        <p>API 호출이 실패했습니다. (API 키 한도 초과이거나 네트워크 문제일 수 있습니다)</p>
        <button class="retry-btn" @click="weatherStore.fetchRealTimeWeather()">다시 시도</button>
      </div>

      <template v-else>
        <p v-if="isRemoteResult" class="remote-hint">
          🔎 목록에 없는 도시입니다. <strong>추가</strong> 버튼으로 목록에 담을 수 있어요.
        </p>

        <div class="card-grid">
          <WeatherCard
            v-for="(item, idx) in displayList"
            :key="item.id"
            :city-item="item"
            :now="weatherStore.now"
            :addable="isRemoteResult"
            :removable="!isRemoteResult"
            :style="{ '--index': idx }"
            @select-card="
              (msg) => {
                weatherStore.selectedCityInfo = msg
                weatherStore.setActiveTheme(item.statusMain)
              }
            "
            @click-detail="goDetail(item)"
            @add-card="addCity(item)"
            @remove-card="weatherStore.removeCity(item)"
          />
        </div>

        <div v-if="weatherStore.isSearching" class="loading-state">
          <span class="loading-glyph">🔎</span>
          <p>'{{ searchQuery }}' 도시를 전 세계에서 찾는 중입니다...</p>
        </div>

        <div v-else-if="weatherStore.searchNotFound" class="empty-state">
          <span class="empty-glyph">🌫️</span>
          <p>'{{ searchQuery }}' 이름의 도시를 찾지 못했습니다.</p>
          <p class="empty-tip">도시 이름을 한글 또는 영문으로 정확히 입력해 보세요.</p>
        </div>

        <div v-else-if="displayList.length === 0" class="empty-state">
          <span class="empty-glyph">🗂️</span>
          <p>목록에 담긴 도시가 없습니다.</p>
          <p class="empty-tip">위 검색창에서 도시를 찾아 추가해 보세요.</p>
          <button class="retry-btn" @click="weatherStore.resetToDefault">기본 도시 다시 불러오기</button>
        </div>
      </template>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
/* PC: 좌측 고정 사이드바(검색·상태) + 우측 카드 그리드 투컬럼 */
.dashboard-wrapper {
  width: 100%;
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 0 28px;
  align-items: start;
}

.dash-side {
  position: sticky;
  top: 32px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

/* 900px 이하: 사이드바를 해체해 검색 → 리스트 → 상태 바 순서의 단일 컬럼으로 */
@media (max-width: 900px) {
  .dashboard-wrapper {
    grid-template-columns: 1fr;
  }
  .dash-side {
    display: contents;
  }
  .dash-side .status-bar {
    order: 3;
  }
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.section-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
}
.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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
  white-space: nowrap;
}

.sync-btn {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s var(--sky-ease);
}
.sync-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.09);
  color: var(--sky-ink);
}
.sync-btn:disabled {
  cursor: default;
  opacity: 0.7;
}
.sync-btn.success {
  color: #86efac;
  border-color: rgba(134, 239, 172, 0.3);
  background: rgba(134, 239, 172, 0.08);
}
.sync-btn.error {
  color: #fca5a5;
  border-color: rgba(252, 165, 165, 0.3);
  background: rgba(252, 165, 165, 0.08);
}

.loading-state,
.error-state,
.empty-state {
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
  animation: pulse 1.6s var(--sky-ease) infinite;
}
.loading-state p,
.error-state p {
  margin: 0;
  font-size: 14px;
}
.error-state p {
  color: #f87171;
}
.empty-tip {
  margin-top: 8px !important;
  font-size: 12px;
  opacity: 0.7;
}
.remote-hint strong {
  font-weight: 700;
  color: var(--sky-ink);
}
.remote-hint {
  margin: 0 0 14px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  text-align: center;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.07);
  border: 1px solid rgba(125, 211, 252, 0.16);
}
.retry-btn {
  margin-top: 14px;
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
.retry-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.empty-glyph {
  display: block;
  font-size: 34px;
  margin-bottom: 10px;
}
.empty-state p {
  margin: 0;
  font-size: 14px;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
  animation: cardRise 0.8s var(--sky-ease) both;
  animation-delay: 360ms;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--sky-accent);
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.8);
  animation: pulse 2.4s var(--sky-ease) infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.8);
  }
}

@keyframes cardRise {
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
</style>
