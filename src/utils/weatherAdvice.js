// 날씨(기온·체감온도·습도·풍속·상태)를 바탕으로 우산/옷차림/강풍 관련 조언을 계산하는 순수 함수 모음.
// 입력 규격: { tempC, feelsLikeC, humidityPct, windSpeedMs, statusMain }
// - tempC/feelsLikeC: 섭씨 숫자
// - humidityPct: 0~100 숫자
// - windSpeedMs: m/s 숫자
// - statusMain: OpenWeatherMap의 weather[0].main 값 (Clear/Rain/Clouds/Snow 등)
// 서버 호출이나 컴포넌트 상태에 의존하지 않아 카드 뱃지와 상세페이지 양쪽에서 동일하게 재사용할 수 있다.

const RAIN_STATUSES = new Set(['Rain', 'Drizzle', 'Thunderstorm', 'Snow'])
const HUMID_THRESHOLD = 80
const WINDY_THRESHOLD = 8 // m/s (경보용 지표풍속 대략 강한 바람 수준)
const STRONG_WIND_THRESHOLD = 14
const HOT_THRESHOLD = 25
const COLD_THRESHOLD = 10

/** ☔ 우산이 필요한지 */
export function getUmbrellaAdvice({ statusMain, humidityPct }) {
  const isRainy = RAIN_STATUSES.has(statusMain)
  const isHumid = (humidityPct ?? 0) >= HUMID_THRESHOLD

  if (isRainy) {
    return { needed: true, icon: '☔', message: '비 예보가 있어요. 우산을 꼭 챙기세요.' }
  }
  if (isHumid) {
    return { needed: true, icon: '☔', message: `습도가 ${humidityPct}%로 높아요. 우산을 챙기면 안심이에요.` }
  }
  return { needed: false, icon: '🌤️', message: '오늘은 우산 없이도 괜찮아요.' }
}

/** 👕 체감온도 기준 옷차림 추천 (5단계) */
export function getOutfitAdvice({ feelsLikeC }) {
  const temp = feelsLikeC ?? 0

  if (temp >= 28) {
    return { tier: 'hot', icon: '🩳', message: '반팔·반바지처럼 시원한 옷차림이 좋아요.' }
  }
  if (temp >= 23) {
    return { tier: 'warm', icon: '👕', message: '얇은 셔츠나 반팔 하나로 충분해요.' }
  }
  if (temp >= 17) {
    return { tier: 'mild', icon: '🧥', message: '가디건이나 얇은 자켓을 걸치기 좋은 날씨예요.' }
  }
  if (temp >= 9) {
    return { tier: 'cool', icon: '🧶', message: '자켓이나 니트로 보온하는 게 좋아요.' }
  }
  return { tier: 'cold', icon: '🧣', message: '코트·패딩에 목도리까지 챙기세요.' }
}

/** 💨 강풍 주의 — 짧은 스커트·우산이 뒤집히는 것 같은 실질적인 팁 포함 */
export function getWindAdvice({ windSpeedMs }) {
  const speed = windSpeedMs ?? 0

  if (speed >= STRONG_WIND_THRESHOLD) {
    return {
      warn: true,
      icon: '🌬️',
      message: `바람이 초당 ${speed}m로 매우 강해요. 짧은 치마·우산은 뒤집히기 쉬우니 피하고, 바람막이를 입으세요.`,
    }
  }
  if (speed >= WINDY_THRESHOLD) {
    return {
      warn: true,
      icon: '💨',
      message: `바람이 다소 강해요(초당 ${speed}m). 헐렁한 치마나 큰 우산보다는 바람막이나 접이식 우산이 나아요.`,
    }
  }
  return { warn: false, icon: '🍃', message: '바람은 크게 신경 쓰지 않아도 돼요.' }
}

/**
 * 위 세 가지 조언을 종합해 조건 태그 배열을 리턴한다.
 * `styleItems.js`의 아이템을 태그로 필터링할 때 이 배열을 그대로 사용한다.
 * @returns {('rain'|'windy'|'hot'|'cold')[]}
 */
export function getConditionTags(input) {
  const tags = []
  if (getUmbrellaAdvice(input).needed) tags.push('rain')
  if (getWindAdvice(input).warn) tags.push('windy')
  if ((input.feelsLikeC ?? 0) >= HOT_THRESHOLD) tags.push('hot')
  if ((input.feelsLikeC ?? 0) <= COLD_THRESHOLD) tags.push('cold')
  return tags
}

/** 카드/상세페이지에서 한 번에 쓰기 좋은 종합 결과 */
export function getWeatherAdvice(input) {
  return {
    umbrella: getUmbrellaAdvice(input),
    outfit: getOutfitAdvice(input),
    wind: getWindAdvice(input),
    tags: getConditionTags(input),
  }
}
