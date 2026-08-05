import { createNote, listNotes, removeNoteById, updateNote } from '../data/notesStore.js'
import { createHttpError, readJsonBody, sendJson } from '../utils/httpUtils.js'

const MOODS = ['sunny', 'good', 'ok', 'bad', 'terrible']

function validateNote(input, partial = false) {
  const errors = []

  if (!partial || Object.hasOwn(input, 'content')) {
    if (typeof input.content !== 'string' || !input.content.trim()) {
      errors.push('메모 내용은 필수입니다.')
    }
  }
  if (!partial && !Number.isFinite(Number(input.cityId))) {
    errors.push('cityId는 필수입니다.')
  }
  if (Object.hasOwn(input, 'mood') && !MOODS.includes(input.mood)) {
    errors.push(`mood는 ${MOODS.join('/')} 중 하나여야 합니다.`)
  }

  return errors
}

export async function handleNotesRoutes(request, response, url) {
  const noteMatch = url.pathname.match(/^\/api\/notes\/(\d+)$/)

  // GET /api/notes?cityId=5128581
  if (request.method === 'GET' && url.pathname === '/api/notes') {
    const cityId = url.searchParams.get('cityId')
    sendJson(response, 200, listNotes(cityId ? Number(cityId) : null))
    return true
  }

  // POST /api/notes  { cityId, cityName, mood, content }
  if (request.method === 'POST' && url.pathname === '/api/notes') {
    const body = await readJsonBody(request)
    const errors = validateNote(body)
    if (errors.length > 0) throw createHttpError(400, errors.join(' '))

    const note = createNote({
      cityId: Number(body.cityId),
      cityName: String(body.cityName ?? ''),
      mood: body.mood ?? 'ok',
      content: body.content.trim(),
    })
    sendJson(response, 201, note)
    return true
  }

  // PATCH /api/notes/:id  { content?, mood? }
  if (request.method === 'PATCH' && noteMatch) {
    const body = await readJsonBody(request)
    const errors = validateNote(body, true)
    if (errors.length > 0) throw createHttpError(400, errors.join(' '))

    const patch = {}
    if (Object.hasOwn(body, 'content')) patch.content = body.content.trim()
    if (Object.hasOwn(body, 'mood')) patch.mood = body.mood

    const updated = updateNote(Number(noteMatch[1]), patch)
    if (!updated) throw createHttpError(404, '수정할 메모를 찾을 수 없습니다.')
    sendJson(response, 200, updated)
    return true
  }

  // DELETE /api/notes/:id
  if (request.method === 'DELETE' && noteMatch) {
    const removed = removeNoteById(Number(noteMatch[1]))
    if (!removed) throw createHttpError(404, '삭제할 메모를 찾을 수 없습니다.')
    sendJson(response, 200, removed)
    return true
  }

  return false
}
