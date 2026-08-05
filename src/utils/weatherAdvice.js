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

/** 🌡️ 카드에 붙는 짧은 체감온도 뱃지 — getOutfitAdvice와 같은 5단계 기준을 재사용해 상세페이지 추천과 표현을 일치시킨다 */
export function getTempTierLabel(feelsLikeC) {
  const temp = feelsLikeC ?? 0

  if (temp >= 28) return { tier: 'hot', icon: '🥵', label: '더움' }
  if (temp >= 23) return { tier: 'warm', icon: '🙂', label: '따뜻함' }
  if (temp >= 17) return { tier: 'mild', icon: '😌', label: '선선함' }
  if (temp >= 9) return { tier: 'cool', icon: '🧶', label: '쌀쌀함' }
  return { tier: 'cold', icon: '🥶', label: '추움' }
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

const DAY_SWING_THRESHOLD = 8 // 하루 최저~최고 체감온도 차이가 이 이상이면 "겹쳐 입기"를 권한다

/**
 * getWeatherAdvice는 "지금 이 순간" 값만 보고 판단하는데, 실제로는 아침엔 쌀쌀하고 낮엔 더웠다가
 * 저녁에 비가 오는 것처럼 하루 안에서도 날씨가 여러 번 바뀐다. 이 함수는 오늘 하루치 시간대별
 * 예보(3시간 간격, 보통 8개 지점)를 전부 살펴서 "하루 전체"를 기준으로 조언을 만든다.
 *
 * @param {{ hour: number, tempC: number, feelsLikeC: number, humidityPct: number, windSpeedMs: number, statusMain: string }[]} points
 *   시간 순으로 정렬된 시간대별 예보 지점 목록. 비어 있으면 null을 돌려준다.
 */
export function getDayAdvice(points) {
  if (!points || points.length === 0) return null

  const feelsLikeTemps = points.map((point) => point.feelsLikeC)
  const minFeelsLike = Math.min(...feelsLikeTemps)
  const maxFeelsLike = Math.max(...feelsLikeTemps)
  const avgFeelsLike = feelsLikeTemps.reduce((sum, temp) => sum + temp, 0) / feelsLikeTemps.length

  const maxHumidity = Math.max(...points.map((point) => point.humidityPct ?? 0))
  const maxWindSpeed = Math.max(...points.map((point) => point.windSpeedMs ?? 0))
  const rainyPoints = points.filter((point) => RAIN_STATUSES.has(point.statusMain))

  const umbrella = buildDayUmbrellaAdvice(points, rainyPoints, maxHumidity)
  const outfit = buildDayOutfitAdvice(minFeelsLike, maxFeelsLike, avgFeelsLike)
  const wind = getWindAdvice({ windSpeedMs: maxWindSpeed })
  const place = buildPlaceAdvice({ rainyPoints, totalPoints: points.length, minFeelsLike, maxFeelsLike, maxWindSpeed })

  // WeatherCard/스타일 아이템 추천이 쓰는 태그와 같은 규격으로 맞춰서, 상세페이지의
  // "오늘의 추천" 문구와 추천 아이템 목록이 서로 다른 기준으로 어긋나지 않게 한다.
  const tags = []
  if (umbrella.needed) tags.push('rain')
  if (wind.warn) tags.push('windy')
  if (maxFeelsLike >= HOT_THRESHOLD) tags.push('hot')
  if (minFeelsLike <= COLD_THRESHOLD) tags.push('cold')

  return {
    umbrella,
    outfit,
    wind,
    place,
    tags,
    minFeelsLike: Math.round(minFeelsLike),
    maxFeelsLike: Math.round(maxFeelsLike),
  }
}

// 하루 중 비가 오는 시간대가 있으면 "몇 시부터"까지 구체적으로 짚어주고,
// 비 예보가 없어도 습도가 한 번이라도 임계치를 넘으면 여전히 우산을 권한다.
function buildDayUmbrellaAdvice(points, rainyPoints, maxHumidity) {
  if (rainyPoints.length > 0) {
    const isAllDay = rainyPoints.length === points.length
    const firstRainHour = rainyPoints[0].hour
    return {
      needed: true,
      icon: '☔',
      message: isAllDay
        ? '오늘은 하루 종일 비 소식이 있어요. 우산을 꼭 챙기세요.'
        : `오늘 ${firstRainHour}시쯤부터 비 예보가 있어요. 우산을 챙겨두면 안심이에요.`,
    }
  }
  if (maxHumidity >= HUMID_THRESHOLD) {
    return { needed: true, icon: '☔', message: `습도가 최대 ${maxHumidity}%까지 올라가요. 우산을 챙기면 안심이에요.` }
  }
  return { needed: false, icon: '🌤️', message: '오늘은 하루 종일 우산 없이도 괜찮아요.' }
}

// 최저~최고 체감온도 차이가 크면 5단계 옷차림 하나로는 부족하니 "겹쳐 입기"로 안내하고,
// 그렇지 않으면 하루 평균 체감온도로 기존 5단계 로직을 그대로 재사용한다.
function buildDayOutfitAdvice(minFeelsLike, maxFeelsLike, avgFeelsLike) {
  const swing = maxFeelsLike - minFeelsLike
  if (swing >= DAY_SWING_THRESHOLD) {
    return {
      tier: 'layered',
      icon: '🧥',
      message: `아침저녁 체감 ${Math.round(minFeelsLike)}°, 낮엔 ${Math.round(maxFeelsLike)}°까지 올라가는 날이에요. 벗고 입기 좋게 겹쳐 입으세요.`,
    }
  }
  return getOutfitAdvice({ feelsLikeC: avgFeelsLike })
}

// AI 없이도 오늘 하루의 비/바람/온도 프로필만으로 "실내가 낫다 / 밖이 좋다" 정도는 규칙으로 충분히 갈릴 수 있다.
function buildPlaceAdvice({ rainyPoints, totalPoints, minFeelsLike, maxFeelsLike, maxWindSpeed }) {
  if (rainyPoints.length > totalPoints / 2) {
    return { icon: '☕', message: '비 오는 시간이 많은 날이에요. 카페나 쇼핑몰처럼 실내에서 보내는 게 좋겠어요.' }
  }
  if (maxWindSpeed >= STRONG_WIND_THRESHOLD) {
    return { icon: '🏠', message: '바람이 많이 강한 날이에요. 오늘은 집에서 푹 쉬는 것도 좋겠어요.' }
  }
  if (maxFeelsLike >= 30) {
    return { icon: '🛍️', message: '낮 체감온도가 많이 올라가요. 에어컨이 있는 몰이나 카페가 낫겠어요.' }
  }
  if (minFeelsLike <= 0) {
    return { icon: '☕', message: '많이 추운 날이에요. 따뜻한 카페에서 시간을 보내는 게 어때요.' }
  }
  if (rainyPoints.length === 0 && maxWindSpeed < WINDY_THRESHOLD) {
    return { icon: '🌳', message: '하루 종일 날씨가 좋아요. 공원 산책하기 딱 좋은 날이에요.' }
  }
  return { icon: '🏙️', message: '무난한 날씨예요. 가고 싶은 곳 어디든 좋아요.' }
}
