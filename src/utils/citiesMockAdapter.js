// GitHub Pages 같은 정적 호스팅에는 mock-api Node 서버를 띄울 수 없다.
// 그래서 프로덕션 빌드에서는 axios 요청을 이 어댑터가 가로채 localStorage로 흉내 낸다.
// 로컬 개발(npm run dev)에서는 그대로 실제 mock-api 서버(mock-api/routes/citiesRoutes.js)를 쓴다.
const STORAGE_KEY = 'weather-stylist-server-cities'

function readCities() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function writeCities(cities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
  return cities
}

function respond(config, data) {
  return { data, status: 200, statusText: 'OK', headers: {}, config, request: null }
}

function fail(config, status, message) {
  const error = new Error(message)
  error.config = config
  error.response = { data: { message }, status, statusText: 'Error', headers: {}, config }
  return Promise.reject(error)
}

function parseBody(config) {
  if (config.data == null) return {}
  return typeof config.data === 'object' ? config.data : JSON.parse(config.data)
}

export async function citiesMockAdapter(config) {
  const method = (config.method ?? 'get').toUpperCase()
  const path = new URL(config.url ?? '/', 'https://mock.invalid').pathname

  if (method === 'GET' && path === '/cities') {
    return respond(config, readCities())
  }

  if (method === 'POST' && path === '/cities') {
    const body = parseBody(config)
    if (!Array.isArray(body.cities)) return fail(config, 400, 'cities는 배열이어야 합니다.')
    return respond(config, writeCities(body.cities))
  }

  const deleteMatch = path.match(/^\/cities\/(\d+)$/)
  if (method === 'DELETE' && deleteMatch) {
    const id = Number(deleteMatch[1])
    const cities = readCities()
    const target = cities.find((city) => city.id === id)
    if (!target) return fail(config, 404, '삭제할 도시를 찾을 수 없습니다.')
    writeCities(cities.filter((city) => city.id !== id))
    return respond(config, target)
  }

  return fail(config, 404, '존재하지 않는 브라우저 Mock API 경로입니다.')
}
