// mock-api/routes/shopRoutes.js와 같은 규격(GET/POST/PATCH/DELETE)을 서버 없이 흉내 낸다.
// citiesMockAdapter.js/notesMockAdapter.js와 같은 패턴 — 서버가 없는 배포 환경에서만 이 어댑터가 쓰인다.
const STORAGE_KEY_PRODUCTS = 'weather-stylist-shop-products'
const STORAGE_KEY_ORDERS = 'weather-stylist-shop-orders'

// mock-api/data/shopStore.js의 초기 재고와 동일하게 맞춘다 — 서버로 접속하든 이 어댑터로 접속하든
// 첫 화면이 같은 상품 목록으로 보이게 하기 위해서다.
const SEED_PRODUCTS = [
  { id: 1, name: '우산', icon: '☔', tag: 'rain', price: 15000, stock: 24 },
  { id: 2, name: '우비', icon: '🧥', tag: 'rain', price: 39000, stock: 12 },
  { id: 3, name: '장화', icon: '👢', tag: 'rain', price: 45000, stock: 8 },
  { id: 4, name: '바람막이 자켓', icon: '🌬️', tag: 'windy', price: 52000, stock: 10 },
  { id: 5, name: '선글라스', icon: '🕶️', tag: 'hot', price: 32000, stock: 15 },
  { id: 6, name: '샌들', icon: '🩴', tag: 'hot', price: 25000, stock: 30 },
  { id: 7, name: '목도리', icon: '🧣', tag: 'cold', price: 22000, stock: 20 },
  { id: 8, name: '장갑', icon: '🧤', tag: 'cold', price: 18000, stock: 18 },
]

let nextProductId = SEED_PRODUCTS.length + 1
let nextOrderId = 1

function readProducts() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_PRODUCTS))
    if (Array.isArray(raw) && raw.length > 0) {
      nextProductId = raw.reduce((max, product) => Math.max(max, product.id + 1), 1)
      return raw
    }
  } catch {
    // 손상된 데이터는 초기 재고로 대체
  }
  return SEED_PRODUCTS.map((product) => ({ ...product }))
}

function writeProducts(products) {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products))
  return products
}

function readOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS))
    if (Array.isArray(raw)) {
      nextOrderId = raw.reduce((max, order) => Math.max(max, order.id + 1), 1)
      return raw
    }
  } catch {
    // 손상된 데이터는 빈 목록으로 대체
  }
  return []
}

function writeOrders(orders) {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
  return orders
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

export async function shopMockAdapter(config) {
  const method = (config.method ?? 'get').toUpperCase()
  const path = new URL(config.url ?? '/', 'https://mock.invalid').pathname
  const productMatch = path.match(/^\/products\/(\d+)$/)

  if (method === 'GET' && path === '/products') {
    return respond(config, 200, readProducts())
  }

  if (method === 'POST' && path === '/products') {
    const body = parseBody(config)
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return fail(config, 400, '상품명은 필수입니다.')
    }
    const products = readProducts()
    const product = {
      id: nextProductId++,
      name: body.name.trim(),
      icon: String(body.icon ?? '🛍️').trim(),
      tag: body.tag,
      price: Number(body.price),
      stock: Number(body.stock),
    }
    products.push(product)
    writeProducts(products)
    return respond(config, 201, product)
  }

  if (method === 'PATCH' && productMatch) {
    const products = readProducts()
    const product = products.find((item) => item.id === Number(productMatch[1]))
    if (!product) return fail(config, 404, '수정할 상품을 찾을 수 없습니다.')

    const body = parseBody(config)
    if (Object.hasOwn(body, 'name')) product.name = String(body.name).trim()
    if (Object.hasOwn(body, 'icon')) product.icon = String(body.icon).trim()
    if (Object.hasOwn(body, 'tag')) product.tag = body.tag
    if (Object.hasOwn(body, 'price')) product.price = Number(body.price)
    if (Object.hasOwn(body, 'stock')) product.stock = Number(body.stock)
    writeProducts(products)
    return respond(config, 200, product)
  }

  if (method === 'DELETE' && productMatch) {
    const products = readProducts()
    const index = products.findIndex((item) => item.id === Number(productMatch[1]))
    if (index === -1) return fail(config, 404, '삭제할 상품을 찾을 수 없습니다.')
    const [removed] = products.splice(index, 1)
    writeProducts(products)
    return respond(config, 200, removed)
  }

  if (method === 'GET' && path === '/orders') {
    return respond(config, 200, readOrders())
  }

  if (method === 'POST' && path === '/orders') {
    const body = parseBody(config)
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) return fail(config, 400, '주문할 상품을 1개 이상 담아주세요.')

    const products = readProducts()
    const resolved = []
    for (const { productId, qty } of items) {
      const product = products.find((item) => item.id === Number(productId))
      if (!product) return fail(config, 400, `상품(id: ${productId})을 찾을 수 없습니다.`)
      if (product.stock < qty) return fail(config, 400, `${product.name} 재고가 부족합니다. (재고 ${product.stock}개)`)
      resolved.push({ product, qty: Number(qty) })
    }

    resolved.forEach(({ product, qty }) => {
      product.stock -= qty
    })
    writeProducts(products)

    const orderItems = resolved.map(({ product, qty }) => ({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      price: product.price,
      qty,
    }))
    const order = {
      id: nextOrderId++,
      items: orderItems,
      totalPrice: orderItems.reduce((sum, item) => sum + item.price * item.qty, 0),
      createdAt: new Date().toISOString(),
    }
    const orders = readOrders()
    orders.unshift(order)
    writeOrders(orders)

    return respond(config, 201, { order, products })
  }

  return fail(config, 404, '존재하지 않는 브라우저 Mock API 경로입니다.')
}
