<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useConfigStore } from '@/stores/configStore'
import { getDayAdvice } from '@/utils/weatherAdvice'

// OpenWeatherMap 무료 5일/3시간 예보 API — 같은 .env 키를 그대로 재사용한다
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

const configStore = useConfigStore()

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
})

// 이 컴포넌트가 하루치 시간대별 데이터를 이미 갖고 있으니, "오늘의 추천" 배너를 그리는
// 부모(WeatherDetailView)가 같은 API를 중복 호출하지 않도록 여기서 계산해 올려보낸다.
const emit = defineEmits(['day-advice'])

const dailyForecast = ref([])
const hourlyForecast = ref([])
const isLoading = ref(false)
const hasError = ref(false)

// 다음 24시간(3시간 간격 8개 지점) 온도를 얇은 SVG 선 그래프로 보여준다
const CHART_WIDTH = 600
const CHART_HEIGHT = 90
const chart = computed(() => {
  const temps = hourlyForecast.value.map((h) => h.temp)
  if (temps.length < 2) return { path: '', dots: [] }

  const min = Math.min(...temps)
  const max = Math.max(...temps)
  // 온도가 전부 같으면 나눗셈이 0이 되니 1로 대체해 평평한 직선을 그리게 한다.
  const range = max - min || 1
  const stepX = CHART_WIDTH / (temps.length - 1)

  // 온도를 그래프 높이에 그대로 매핑하면 점이 위/아래 끝에 딱 붙어버려서,
  // 위아래로 18px씩(총 36px) 여백을 두고 그 안에서만 오르내리게 한다.
  const dots = hourlyForecast.value.map((h, i) => ({
    x: i * stepX,
    y: CHART_HEIGHT - 18 - ((h.temp - min) / range) * (CHART_HEIGHT - 36),
    ...h,
  }))
  const path = dots.map((d, i) => `${i === 0 ? 'M' : 'L'}${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(' ')
  return { path, dots }
})

const STATUS_GLYPH = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️' }
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

async function fetchForecast() {
  isLoading.value = true
  hasError.value = false
  try {
    const res = await axios.get(FORECAST_URL, {
      params: { lat: props.lat, lon: props.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
    })

    // 다음 24시간 = 3시간 간격 8개 지점. 그래프에는 temp/time만 쓰지만, 습도·풍속·날씨상태까지
    // 같이 들고 있어야 아래 dayAdvice(하루 전체를 보는 오늘의 추천)를 계산할 수 있다.
    hourlyForecast.value = res.data.list.slice(0, 8).map((entry) => ({
      time: entry.dt_txt.slice(11, 16),
      hour: Number(entry.dt_txt.slice(11, 13)),
      temp: Math.round(entry.main.temp),
      feelsLikeC: entry.main.feels_like,
      humidityPct: entry.main.humidity,
      windSpeedMs: entry.wind.speed,
      statusMain: entry.weather[0].main,
      // 하루 안에서도 시간대별로 날씨가 바뀔 수 있어서(맑다가 비 오고 다시 맑아지는 식),
      // 온도 그래프 아래에 시간별 날씨 아이콘도 같이 보여준다.
      glyph: STATUS_GLYPH[entry.weather[0].main] ?? '🌤️',
    }))
    emit('day-advice', getDayAdvice(hourlyForecast.value))

    // 3시간 간격 목록(최대 40개)을 날짜별로 묶어 하루 최저/최고/대표 상태로 압축
    const groups = new Map()
    res.data.list.forEach((entry) => {
      const dateKey = entry.dt_txt.slice(0, 10) // 'YYYY-MM-DD'
      if (!groups.has(dateKey)) groups.set(dateKey, [])
      groups.get(dateKey).push(entry)
    })

    const today = new Date().toISOString().slice(0, 10)
    dailyForecast.value = Array.from(groups.entries())
      .slice(0, 5)
      .map(([dateKey, entries]) => {
        const temps = entries.map((entry) => entry.main.temp)
        // 정오(12시)에 가장 가까운 시간대를 그날의 대표 날씨로 사용
        const noonEntry = entries.reduce((closest, cur) => {
          const curHour = Number(cur.dt_txt.slice(11, 13))
          const closestHour = Number(closest.dt_txt.slice(11, 13))
          return Math.abs(curHour - 12) < Math.abs(closestHour - 12) ? cur : closest
        }, entries[0])

        return {
          dateKey,
          label: dateKey === today ? '오늘' : WEEKDAY[new Date(dateKey).getDay()],
          glyph: STATUS_GLYPH[noonEntry.weather[0].main] ?? '🌤️',
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
        }
      })
  } catch (error) {
    console.error('🔴 5일 예보 조회 실패:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchForecast)
</script>

<template>
  <div class="forecast-block">
    <h4>📅 5일 예보</h4>

    <div v-if="isLoading" class="forecast-status">예보를 불러오는 중...</div>
    <div v-else-if="hasError" class="forecast-status">예보를 가져오지 못했어요.</div>

    <div v-else class="forecast-strip">
      <div v-for="day in dailyForecast" :key="day.dateKey" class="forecast-day">
        <span class="day-label">{{ day.label }}</span>
        <span class="day-glyph">{{ day.glyph }}</span>
        <span class="day-temps">
          <strong>{{ configStore.formatTemp(day.max) }}°</strong>
          <span class="day-min">{{ configStore.formatTemp(day.min) }}°</span>
        </span>
      </div>
    </div>

    <div v-if="!isLoading && !hasError && chart.dots.length > 0" class="hourly-block">
      <h4>⏱️ 24시간 날씨</h4>
      <svg :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`" class="hourly-chart" preserveAspectRatio="none">
        <path :d="chart.path" class="hourly-line" fill="none" stroke-width="2.5" />
        <circle v-for="dot in chart.dots" :key="dot.time" :cx="dot.x" :cy="dot.y" r="3.2" class="hourly-dot" />
      </svg>
      <div class="hourly-labels">
        <span v-for="hour in hourlyForecast" :key="hour.time" class="hourly-label">
          <span class="hourly-glyph">{{ hour.glyph }}</span>
          {{ hour.time.slice(0, 5) }}
          <strong>{{ configStore.formatTemp(hour.temp) }}°</strong>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forecast-block {
  margin-top: 22px;
}
.forecast-block h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.forecast-status {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.forecast-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}
.forecast-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.day-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--sky-ink-dim);
}
.day-glyph {
  font-size: 22px;
}
.day-temps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 13px;
}
.day-temps strong {
  color: var(--sky-ink);
}
.day-min {
  color: var(--sky-ink-dim);
}

.hourly-block {
  margin-top: 20px;
}
.hourly-block h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.hourly-chart {
  width: 100%;
  height: 70px;
  display: block;
  overflow: visible;
}
.hourly-line {
  stroke: var(--sky-accent);
  transition: stroke 1s var(--sky-ease);
}
.hourly-dot {
  fill: var(--sky-accent);
  transition: fill 1s var(--sky-ease);
}
.hourly-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}
.hourly-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 10px;
  color: var(--sky-ink-dim);
}
.hourly-glyph {
  font-size: 15px;
  line-height: 1;
}
.hourly-label strong {
  font-size: 12px;
  color: var(--sky-ink);
}

@media (max-width: 480px) {
  .forecast-strip {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
  }
  .forecast-day {
    padding: 8px 2px;
  }
  .hourly-labels {
    font-size: 9px;
  }
}
</style>
