import { http } from './http'

// 도시별 날씨 메모 CRUD — 로컬에서는 mock-api 서버(mock-api/routes/notesRoutes.js)를,
// 배포 환경에서는 notesMockAdapter를 거쳐 동일한 규격으로 동작한다.
export const notesApi = {
  async list(cityId) {
    const res = await http.get('/notes', { params: { cityId } })
    return res.data
  },
  async create(note) {
    const res = await http.post('/notes', note)
    return res.data
  },
  async update(id, patch) {
    const res = await http.patch(`/notes/${id}`, patch)
    return res.data
  },
  async remove(id) {
    const res = await http.delete(`/notes/${id}`)
    return res.data
  },
}
