import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { http } from '@/utils/http'

// OpenWeatherMap 연동 규격 — 키는 .env의 VITE_OPENWEATHER_API_KEY로 관리
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'
// 지오코딩 API: 날씨 API와 달리 한글 도시명("대구")도 좌표로 변환해준다
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct'
// 역지오코딩 API: 좌표 → 지명 (내 위치 카드에서 한글 지명을 얻는 데 쓴다)
const REVERSE_GEO_URL = 'https://api.openweathermap.org/geo/1.0/reverse'

// 처음 방문했을 때 띄워줄 기본 도시 목록
const BASE_CITIES = [
  { query: 'New York', name: '뉴욕' },
  { query: 'Tokyo', name: '도쿄' },
  { query: 'Paris', name: '파리' },
  { query: 'Wellington', name: '웰링턴' },
]

// 브라우저에 목록을 남겨둘 localStorage 키
const STORAGE_KEY = 'weather-stylist-cities'

// 저장된 목록 읽기 — 값이 없으면 null(기본 도시 사용), 빈 배열이면 "모두 지운 상태"로 존중한다
function loadSavedCities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch (error) {
    console.error('🔴 저장된 도시 목록을 읽지 못했습니다:', error)
    return null
  }
}

// API 원본 응답을 카드가 쓰는 규격으로 정규화 (id는 OpenWeatherMap 도시 코드)
// timezone은 UTC 기준 오프셋(초) — 카드에서 현지 시각을 계산하는 데 쓴다.
// humidity/windSpeed는 이번에 추가된 필드 — 우산/옷차림 추천 계산의 입력값이 된다.
function toCityCard(raw, koreanName) {
  return {
    id: raw.id,
    name: koreanName,
    temp: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    status: raw.weather[0].description,
    statusMain: raw.weather[0].main,
    timezone: raw.timezone,
    humidity: raw.main.humidity,
    windSpeed: raw.wind.speed,
    // 국가 코드(alpha-2) — 국가 정보 패널이 이 값으로 countryInfo.js를 조회한다
    country: raw.sys?.country ?? null,
  }
}

// OpenWeatherMap의 weather[0].main 값을 배경 테마 키로 매핑
// (App.vue가 이 값에 따라 전체 화면 배경을 그 날씨처럼 바꾼다)
function mapStatusToTheme(statusMain) {
  if (statusMain === 'Clear') return 'sunny'
  if (['Rain', 'Drizzle', 'Thunderstorm'].includes(statusMain)) return 'rain'
  if (statusMain === 'Snow') return 'snow'
  if (statusMain === 'Clouds') return 'cloudy'
  return 'default'
}

// 날씨 목록·검색·저장(localStorage)·서버 동기화(mock-api)를 모두 이 스토어가 소유한다.
// (원래 WeatherParent.vue의 컴포넌트 로컬 ref였던 것을 Pinia로 승격)
export const useWeatherStore = defineStore('weather', () => {
  const weatherList = ref([])
  const isLoading = ref(false)
  const hasError = ref(false)
  const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
  // 선택된 카드의 전체 데이터 — 사이드바 국가 정보 패널이 country 코드를 읽는 데 쓴다
  const selectedCity = ref(null)

  // 카드를 선택하거나 상세페이지에 들어가면 그 도시의 날씨에 맞춰
  // App.vue의 전체 배경이 바뀌도록 하는 전역 테마 상태 ('default'|'sunny'|'cloudy'|'rain'|'snow')
  const activeTheme = ref('default')
  function setActiveTheme(statusMain) {
    activeTheme.value = mapStatusToTheme(statusMain)
  }
  function resetTheme() {
    activeTheme.value = 'default'
  }

  // ── 목록에 없는 도시 원격 검색 ────────────────────────────
  const remoteCity = ref(null)
  const isSearching = ref(false)
  const searchNotFound = ref(false)
  let searchTimer = null

  // 카드마다 현지 시각을 흘려보내기 위한 공용 시계 (1초마다 갱신)
  const now = ref(Date.now())
  let clockTimer = null

  // mock-api 서버 동기화 상태 ('idle' | 'syncing' | 'success' | 'error')
  const serverSyncStatus = ref('idle')

  // 내 위치 기반 날씨 (대시보드 상단에 고정 표시되는 별도 카드)
  // 'idle' | 'loading' | 'ready' | 'error'
  const myLocation = ref(null)
  const myLocationStatus = ref('idle')

  // 좌표로 날씨를 조회하고 역지오코딩으로 한글 지명을 붙여 myLocation에 채운다.
  // isApprox: true면 브라우저 GPS가 아니라 IP 기반 대략적인 위치라는 뜻 (카드에 안내 문구 표시용)
  async function resolveMyLocation(lat, lon, isApprox) {
    try {
      const [weatherRes, geoRes] = await Promise.all([
        axios.get(BASE_URL, {
          params: { lat, lon, appid: API_KEY, units: 'metric', lang: 'kr' },
        }),
        axios.get(REVERSE_GEO_URL, { params: { lat, lon, limit: 1, appid: API_KEY } }).catch(() => ({ data: [] })),
      ])
      const place = geoRes.data?.[0]
      const koreanName = place?.local_names?.ko || place?.name || weatherRes.data.name
      myLocation.value = { ...toCityCard(weatherRes.data, koreanName), isApprox }
      myLocationStatus.value = 'ready'
    } catch (error) {
      console.error('🔴 내 위치 날씨 조회 실패:', error.response?.status, error.message)
      myLocationStatus.value = 'error'
    }
  }

  // 브라우저 GPS/Wi-Fi 위치가 권한 문제·시스템 설정 등으로 실패하는 경우가 많아,
  // 실패하면 곧바로 IP 기반 대략적 위치(ipwho.is, 무료·키 불필요)로 자동 대체한다.
  async function resolveByIp() {
    try {
      const res = await axios.get('https://ipwho.is/')
      if (!res.data?.success) throw new Error('ip lookup failed')
      await resolveMyLocation(res.data.latitude, res.data.longitude, true)
    } catch (error) {
      console.error('🔴 IP 기반 위치 조회도 실패:', error.message)
      myLocationStatus.value = 'error'
    }
  }

  function loadMyLocation() {
    myLocationStatus.value = 'loading'
    if (!('geolocation' in navigator)) {
      resolveByIp()
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolveMyLocation(coords.latitude, coords.longitude, false),
      (geoError) => {
        // code 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT — 어떤 사유든 IP 기반으로 대체
        console.error('🔴 브라우저 위치 확인 실패, IP 기반으로 대체합니다:', geoError.code, geoError.message)
        resolveByIp()
      },
      { timeout: 15000, maximumAge: 5 * 60 * 1000 },
    )
  }

  // 대상 도시들의 실시간 날씨를 병렬(Promise.all)로 수신해 반응형 장부에 동기화.
  // 기온·상태는 저장하지 않고 매번 새로 받아오므로 항상 최신값이 표시된다.
  async function fetchRealTimeWeather(targets = null) {
    const cities = targets ?? BASE_CITIES
    isLoading.value = true
    hasError.value = false
    try {
      if (cities.length === 0) {
        weatherList.value = []
        return
      }

      const responses = await Promise.all(
        cities.map((city) =>
          axios.get(BASE_URL, {
            params: {
              // 저장된 도시는 도시 코드로, 기본 도시는 영문명으로 조회
              ...(city.id != null ? { id: city.id } : { q: city.query }),
              appid: API_KEY,
              units: 'metric',
              lang: 'kr',
            },
          }),
        ),
      )

      weatherList.value = responses.map((res, idx) => toCityCard(res.data, cities[idx].name))
    } catch (error) {
      console.error('🔴 날씨 API 연동 실패:', error)
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }

  // 저장 기록을 지우고 기본 도시 목록으로 되돌린다
  function resetToDefault() {
    localStorage.removeItem(STORAGE_KEY)
    fetchRealTimeWeather()
  }

  // 지오코딩으로 좌표를 먼저 얻고, 그 좌표로 실시간 날씨를 조회하는 2단 요청
  async function searchRemoteCity(query) {
    isSearching.value = true
    searchNotFound.value = false
    remoteCity.value = null
    try {
      const geoRes = await axios.get(GEO_URL, {
        params: { q: query, limit: 1, appid: API_KEY },
      })
      const place = geoRes.data[0]
      if (!place) {
        searchNotFound.value = true
        return
      }

      const weatherRes = await axios.get(BASE_URL, {
        params: { lat: place.lat, lon: place.lon, appid: API_KEY, units: 'metric', lang: 'kr' },
      })
      // 현지 표기(local_names.ko)가 있으면 한글 지명을 우선 사용
      remoteCity.value = toCityCard(weatherRes.data, place.local_names?.ko || place.name)
    } catch (error) {
      console.error('🔴 도시 검색 실패:', error)
      searchNotFound.value = true
    } finally {
      isSearching.value = false
    }
  }

  // 검색어가 바뀔 때 컴포넌트가 호출: 로컬 목록에 없으면 디바운스 후 원격 검색
  function scheduleSearch(query) {
    clearTimeout(searchTimer)
    remoteCity.value = null
    searchNotFound.value = false
    isSearching.value = false

    if (!query) return
    isSearching.value = true
    searchTimer = setTimeout(() => searchRemoteCity(query), 500)
  }

  // 검색어를 지웠을 때 원격 검색 관련 상태를 정리
  function clearSearchState() {
    clearTimeout(searchTimer)
    remoteCity.value = null
    searchNotFound.value = false
    isSearching.value = false
  }

  // ── 목록 추가 / 제거 ──────────────────────────────────
  function addCity(city) {
    if (weatherList.value.some((item) => item.id === city.id)) {
      selectedCityInfo.value = `${city.name} 카드는 이미 목록에 있습니다.`
      return
    }
    weatherList.value.push(city)
    selectedCityInfo.value = `${city.name} 카드를 목록에 추가했습니다.`
  }

  function removeCity(city) {
    weatherList.value = weatherList.value.filter((item) => item.id !== city.id)
    selectedCityInfo.value = `${city.name} 카드를 목록에서 제거했습니다.`
  }

  // 목록이 바뀔 때마다 도시 신원(코드·한글명)만 브라우저에 저장 (기존 동작 그대로 유지)
  watch(
    weatherList,
    (list) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.map(({ id, name }) => ({ id, name }))))
    },
    { deep: true },
  )

  // 현재 목록을 mock-api에 동기화한다. 서버가 꺼져 있어도 나머지 기능엔 영향 없는 부가 기능.
  async function syncToServer() {
    serverSyncStatus.value = 'syncing'
    try {
      await http.post('/cities', {
        cities: weatherList.value.map(({ id, name }) => ({ id, name })),
      })
      serverSyncStatus.value = 'success'
    } catch (error) {
      console.error('🔴 서버 동기화 실패 (mock-api가 꺼져 있을 수 있습니다):', error)
      serverSyncStatus.value = 'error'
    }
  }

  function init() {
    fetchRealTimeWeather(loadSavedCities())
    loadMyLocation()
    clockTimer = setInterval(() => (now.value = Date.now()), 1000)
  }

  function dispose() {
    clearTimeout(searchTimer)
    clearInterval(clockTimer)
  }

  return {
    weatherList,
    isLoading,
    hasError,
    selectedCityInfo,
    selectedCity,
    remoteCity,
    isSearching,
    searchNotFound,
    now,
    serverSyncStatus,
    myLocation,
    myLocationStatus,
    loadMyLocation,
    activeTheme,
    setActiveTheme,
    resetTheme,
    init,
    dispose,
    fetchRealTimeWeather,
    resetToDefault,
    scheduleSearch,
    clearSearchState,
    addCity,
    removeCity,
    syncToServer,
  }
})
