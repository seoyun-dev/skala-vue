// 도시별 날씨 메모를 서버 메모리에 보관합니다. DB가 아니므로 재시작하면 초기화됩니다.
let notes = []
let nextId = 1

export function listNotes(cityId) {
  if (cityId == null) return notes
  return notes.filter((note) => note.cityId === cityId)
}

export function createNote({ cityId, cityName, mood, content }) {
  const now = new Date().toISOString()
  const note = { id: nextId++, cityId, cityName, mood, content, createdAt: now, updatedAt: now }
  notes.push(note)
  return note
}

export function updateNote(id, patch) {
  const note = notes.find((item) => item.id === id)
  if (!note) return undefined

  Object.assign(note, patch, { updatedAt: new Date().toISOString() })
  return note
}

export function removeNoteById(id) {
  const index = notes.findIndex((item) => item.id === id)
  if (index === -1) return undefined

  const [removed] = notes.splice(index, 1)
  return removed
}
