import { listCities, removeCityById, replaceCities } from '../data/citiesStore.js'
import { createHttpError, readJsonBody, sendJson } from '../utils/httpUtils.js'

// vue-mock-api-sample의 productRoutes.js 패턴(검증 → 정규화 → CRUD)을 그대로 응용했다.
function validateCity(input) {
  const errors = []

  if (!Number.isFinite(Number(input.id))) {
    errors.push('도시 id는 숫자여야 합니다.')
  }
  if (typeof input.name !== 'string' || !input.name.trim()) {
    errors.push('도시 이름은 필수입니다.')
  }

  return errors
}

export async function handleCitiesRoutes(request, response, url) {
  const cityMatch = url.pathname.match(/^\/api\/cities\/(\d+)$/)

  // GET /api/cities
  if (request.method === 'GET' && url.pathname === '/api/cities') {
    sendJson(response, 200, listCities())
    return true
  }

  // POST /api/cities  { cities: [{ id, name }, ...] }
  // 프론트엔드가 "현재 목록 전체"를 동기화하는 방식이라 배열 전체를 검증 후 통째로 저장한다.
  if (request.method === 'POST' && url.pathname === '/api/cities') {
    const body = await readJsonBody(request)

    if (!Array.isArray(body.cities)) {
      throw createHttpError(400, 'cities는 배열이어야 합니다.')
    }

    const errors = body.cities.flatMap((city) => validateCity(city))
    if (errors.length > 0) {
      throw createHttpError(400, errors.join(' '))
    }

    const normalized = body.cities.map((city) => ({
      id: Number(city.id),
      name: city.name.trim(),
    }))

    sendJson(response, 200, replaceCities(normalized))
    return true
  }

  // DELETE /api/cities/:id
  if (request.method === 'DELETE' && cityMatch) {
    const removed = removeCityById(Number(cityMatch[1]))

    if (!removed) {
      throw createHttpError(404, '삭제할 도시를 찾을 수 없습니다.')
    }

    sendJson(response, 200, removed)
    return true
  }

  // 이 라우터가 처리할 요청이 아니면 server.js로 제어권을 돌려준다.
  return false
}
