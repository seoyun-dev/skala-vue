// 사용자가 "☁️ 서버에도 저장"으로 동기화한 도시 목록을 서버 메모리에 보관합니다.
// 데이터베이스가 아니므로 서버를 재시작하면 초기화됩니다 (다른 mock-api들과 동일한 의도된 동작).
let cities = []

export function listCities() {
  return cities
}

export function getCityCount() {
  return cities.length
}

// 프론트엔드가 "현재 목록 전체"를 한 번에 보내는 동기화 방식이라 통째로 교체한다.
export function replaceCities(newCities) {
  cities = newCities
  return cities
}

export function removeCityById(id) {
  const index = cities.findIndex((city) => city.id === id)
  if (index === -1) return undefined

  const [removed] = cities.splice(index, 1)
  return removed
}
