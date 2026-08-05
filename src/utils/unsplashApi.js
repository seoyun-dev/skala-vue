import axios from 'axios'

// Unsplash 무료 티어(비인증 데모 앱 기준 시간당 약 50회) — 키는 .env의 VITE_UNSPLASH_ACCESS_KEY로 관리.
// 키가 비어 있으면 네트워크 요청을 전혀 하지 않고 null을 돌려줘서, App.vue의 기존 CSS 그라디언트 테마로
// 그대로 폴백된다 (키가 없어도 절대 깨지지 않아야 한다는 요구사항).
const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

// App.vue의 activeTheme 값('sunny'|'cloudy'|'rain'|'snow'|'default')을 검색어로 매핑
const THEME_QUERY = {
  sunny: 'clear blue sky sunny',
  cloudy: 'cloudy overcast sky',
  rain: 'rain storm sky',
  snow: 'snow winter landscape',
  default: 'blue sky white clouds daytime',
}

// 같은 테마를 반복 조회하지 않도록 검색어 기준으로 캐시
const cache = new Map()

export async function fetchThemeBackground(theme) {
  if (!ACCESS_KEY) return null

  const query = THEME_QUERY[theme] ?? THEME_QUERY.default
  if (cache.has(query)) return cache.get(query)

  try {
    const res = await axios.get('https://api.unsplash.com/photos/random', {
      params: { query, orientation: 'landscape' },
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    })
    const url = res.data?.urls?.regular ?? null
    cache.set(query, url)
    return url
  } catch (error) {
    console.error('🔴 Unsplash 배경 이미지 조회 실패 (그라디언트 테마로 대체됩니다):', error)
    return null
  }
}
