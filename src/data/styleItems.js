// 날씨 조건 태그(rain/windy/hot/cold)별 추천 스타일 아이템 카탈로그.
// 순수 데이터 모듈이라 서버 없이도 즉시, 항상 동작한다 — weatherAdvice.js의 getConditionTags() 결과와 짝지어 쓴다.

export const STYLE_ITEMS = [
  { id: 'umbrella', tags: ['rain'], icon: '☔', name: '우산', tip: '접이식이면 가방에도 부담 없어요.' },
  { id: 'rain-jacket', tags: ['rain'], icon: '🧥', name: '방수 자켓', tip: '갑자기 쏟아져도 든든해요.' },
  { id: 'rain-boots', tags: ['rain'], icon: '👢', name: '방수 신발', tip: '발이 젖지 않게 도와줘요.' },

  { id: 'windbreaker', tags: ['windy'], icon: '🧥', name: '바람막이', tip: '체온 손실을 막아줘요.' },
  { id: 'hair-tie', tags: ['windy'], icon: '🎗️', name: '머리끈/모자 고정', tip: '강풍에 머리·모자가 날리지 않게.' },
  { id: 'no-full-skirt', tags: ['windy'], icon: '🚫', name: '통 넓은 치마는 피하기', tip: '바람에 뒤집히기 쉬워요. 슬랙스나 스키니핏을 추천해요.' },

  { id: 'sunglasses', tags: ['hot'], icon: '🕶️', name: '선글라스', tip: '자외선과 눈부심을 줄여줘요.' },
  { id: 'cap', tags: ['hot'], icon: '🧢', name: '모자', tip: '직사광선을 막아줘요.' },
  { id: 'cool-fabric', tags: ['hot'], icon: '🩳', name: '시원한 소재의 옷', tip: '린넨·메시 소재로 통풍이 잘 되게.' },

  { id: 'scarf', tags: ['cold'], icon: '🧣', name: '목도리', tip: '체감온도를 크게 낮추는 목 부위부터 보온해요.' },
  { id: 'gloves', tags: ['cold'], icon: '🧤', name: '장갑', tip: '손끝 보온으로 체감 추위를 줄여줘요.' },
  { id: 'thermal-layer', tags: ['cold'], icon: '🥼', name: '기모/발열 이너', tip: '겉옷 안에 하나 더 챙기면 확실히 따뜻해요.' },
]

/**
 * 주어진 조건 태그와 매칭되는 스타일 아이템만 반환한다.
 * @param {string[]} tags - getConditionTags()의 결과
 */
export function getStyleItemsFor(tags) {
  if (!tags || tags.length === 0) return []
  return STYLE_ITEMS.filter((item) => item.tags.some((tag) => tags.includes(tag)))
}
