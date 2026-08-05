import {
  createOrder,
  createProduct,
  listOrders,
  listProducts,
  removeProductById,
  updateProduct,
} from '../data/shopStore.js'
import { createHttpError, readJsonBody, sendJson } from '../utils/httpUtils.js'

const TAGS = ['rain', 'windy', 'hot', 'cold']

function validateProduct(input, partial = false) {
  const errors = []

  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim()) errors.push('상품명은 필수입니다.')
  }
  if (!partial || Object.hasOwn(input, 'icon')) {
    if (typeof input.icon !== 'string' || !input.icon.trim()) errors.push('아이콘은 필수입니다.')
  }
  if (!partial || Object.hasOwn(input, 'tag')) {
    if (!TAGS.includes(input.tag)) errors.push(`태그는 ${TAGS.join('/')} 중 하나여야 합니다.`)
  }
  if (!partial || Object.hasOwn(input, 'price')) {
    if (!Number.isFinite(Number(input.price)) || Number(input.price) < 0) errors.push('가격은 0 이상 숫자여야 합니다.')
  }
  if (!partial || Object.hasOwn(input, 'stock')) {
    if (!Number.isFinite(Number(input.stock)) || Number(input.stock) < 0) errors.push('재고는 0 이상 숫자여야 합니다.')
  }

  return errors
}

export async function handleShopRoutes(request, response, url) {
  const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/)

  // GET /api/products
  if (request.method === 'GET' && url.pathname === '/api/products') {
    sendJson(response, 200, listProducts())
    return true
  }

  // POST /api/products  { name, icon, tag, price, stock }
  if (request.method === 'POST' && url.pathname === '/api/products') {
    const body = await readJsonBody(request)
    const errors = validateProduct(body)
    if (errors.length > 0) throw createHttpError(400, errors.join(' '))

    const product = createProduct({
      name: body.name.trim(),
      icon: body.icon.trim(),
      tag: body.tag,
      price: Number(body.price),
      stock: Number(body.stock),
    })
    sendJson(response, 201, product)
    return true
  }

  // PATCH /api/products/:id  { name?, icon?, tag?, price?, stock? }
  if (request.method === 'PATCH' && productMatch) {
    const body = await readJsonBody(request)
    const errors = validateProduct(body, true)
    if (errors.length > 0) throw createHttpError(400, errors.join(' '))

    const patch = {}
    if (Object.hasOwn(body, 'name')) patch.name = body.name.trim()
    if (Object.hasOwn(body, 'icon')) patch.icon = body.icon.trim()
    if (Object.hasOwn(body, 'tag')) patch.tag = body.tag
    if (Object.hasOwn(body, 'price')) patch.price = Number(body.price)
    if (Object.hasOwn(body, 'stock')) patch.stock = Number(body.stock)

    const updated = updateProduct(Number(productMatch[1]), patch)
    if (!updated) throw createHttpError(404, '수정할 상품을 찾을 수 없습니다.')
    sendJson(response, 200, updated)
    return true
  }

  // DELETE /api/products/:id
  if (request.method === 'DELETE' && productMatch) {
    const removed = removeProductById(Number(productMatch[1]))
    if (!removed) throw createHttpError(404, '삭제할 상품을 찾을 수 없습니다.')
    sendJson(response, 200, removed)
    return true
  }

  // GET /api/orders
  if (request.method === 'GET' && url.pathname === '/api/orders') {
    sendJson(response, 200, listOrders())
    return true
  }

  // POST /api/orders  { items: [{ productId, qty }] }
  if (request.method === 'POST' && url.pathname === '/api/orders') {
    const body = await readJsonBody(request)
    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw createHttpError(400, '주문할 상품을 1개 이상 담아주세요.')
    }
    const items = body.items.map((item) => ({ productId: Number(item.productId), qty: Number(item.qty) }))
    if (items.some((item) => !Number.isFinite(item.qty) || item.qty < 1)) {
      throw createHttpError(400, '수량은 1개 이상이어야 합니다.')
    }

    try {
      const order = createOrder(items)
      sendJson(response, 201, { order, products: listProducts() })
    } catch (error) {
      // 재고 부족처럼 주문 자체의 문제는 상품이 없어졌다는 뜻이 아니라 400(잘못된 요청)에 해당한다.
      throw createHttpError(400, error.message)
    }
    return true
  }

  return false
}
