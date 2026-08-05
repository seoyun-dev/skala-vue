import { http } from './http'

// 날씨 상점 상품·주문 — 로컬에서는 mock-api 서버(mock-api/routes/shopRoutes.js)를,
// 배포 환경에서는 shopMockAdapter를 거쳐 동일한 규격으로 동작한다.
export const shopApi = {
  async listProducts() {
    const res = await http.get('/products')
    return res.data
  },
  async createProduct(product) {
    const res = await http.post('/products', product)
    return res.data
  },
  async updateProduct(id, patch) {
    const res = await http.patch(`/products/${id}`, patch)
    return res.data
  },
  async removeProduct(id) {
    const res = await http.delete(`/products/${id}`)
    return res.data
  },
  async listOrders() {
    const res = await http.get('/orders')
    return res.data
  },
  // items: [{ productId, qty }] — 성공하면 { order, products(재고 반영된 최신 목록) }를 돌려준다.
  async placeOrder(items) {
    const res = await http.post('/orders', { items })
    return res.data
  },
}
