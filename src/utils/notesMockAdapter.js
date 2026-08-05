// mock-api/routes/notesRoutes.js와 같은 규격(GET/POST/PATCH/DELETE)을 서버 없이 흉내 낸다.
// citiesMockAdapter.js와 같은 패턴 — 서버가 없는 배포 환경에서만 이 어댑터가 쓰인다.
const STORAGE_KEY = 'weather-stylist-server-notes'
let nextId = 1

function readNotes() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(raw)) {
      nextId = raw.reduce((max, note) => Math.max(max, note.id + 1), 1)
      return raw
    }
  } catch {
    // 손상된 데이터는 빈 목록으로 대체
  }
  return []
}

function writeNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  return notes
}

function respond(config, status, data) {
  return { data, status, statusText: 'OK', headers: {}, config, request: null }
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

function buildUrl(config) {
  const url = new URL(config.url ?? '/', 'https://mock.invalid')
  const params = config.params
  if (params && typeof params === 'object') {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url
}

export async function notesMockAdapter(config) {
  const method = (config.method ?? 'get').toUpperCase()
  const url = buildUrl(config)
  const path = url.pathname
  const itemMatch = path.match(/^\/notes\/(\d+)$/)

  if (method === 'GET' && path === '/notes') {
    const cityId = url.searchParams.get('cityId')
    const notes = readNotes()
    return respond(config, 200, cityId ? notes.filter((note) => note.cityId === Number(cityId)) : notes)
  }

  if (method === 'POST' && path === '/notes') {
    const body = parseBody(config)
    if (typeof body.content !== 'string' || !body.content.trim()) {
      return fail(config, 400, '메모 내용은 필수입니다.')
    }
    const notes = readNotes()
    const now = new Date().toISOString()
    const note = {
      id: nextId++,
      cityId: Number(body.cityId),
      cityName: String(body.cityName ?? ''),
      mood: body.mood ?? 'ok',
      content: body.content.trim(),
      createdAt: now,
      updatedAt: now,
    }
    notes.push(note)
    writeNotes(notes)
    return respond(config, 201, note)
  }

  if (method === 'PATCH' && itemMatch) {
    const notes = readNotes()
    const note = notes.find((item) => item.id === Number(itemMatch[1]))
    if (!note) return fail(config, 404, '수정할 메모를 찾을 수 없습니다.')

    const body = parseBody(config)
    if (Object.hasOwn(body, 'content')) note.content = String(body.content).trim()
    if (Object.hasOwn(body, 'mood')) note.mood = body.mood
    note.updatedAt = new Date().toISOString()
    writeNotes(notes)
    return respond(config, 200, note)
  }

  if (method === 'DELETE' && itemMatch) {
    const notes = readNotes()
    const index = notes.findIndex((item) => item.id === Number(itemMatch[1]))
    if (index === -1) return fail(config, 404, '삭제할 메모를 찾을 수 없습니다.')
    const [removed] = notes.splice(index, 1)
    writeNotes(notes)
    return respond(config, 200, removed)
  }

  return fail(config, 404, '존재하지 않는 브라우저 Mock API 경로입니다.')
}
