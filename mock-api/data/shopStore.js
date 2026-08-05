// 날씨 상점의 상품·주문을 서버 메모리에 보관한다. DB가 아니므로 재시작하면 초기 재고로 리셋된다.
// tags는 weatherAdvice.js의 getConditionTags() / styleItems.js와 같은 값(rain/windy/hot/cold)을 써서,
// "오늘의 추천" 아이템과 상점 상품을 같은 기준으로 연결할 수 있게 한다.
let products = [
  { id: 1, name: '우산', icon: '☔', tag: 'rain', price: 15000, stock: 24 },
  { id: 2, name: '우비', icon: '🧥', tag: 'rain', price: 39000, stock: 12 },
  { id: 3, name: '장화', icon: '👢', tag: 'rain', price: 45000, stock: 8 },
  { id: 4, name: '바람막이 자켓', icon: '🌬️', tag: 'windy', price: 52000, stock: 10 },
  { id: 5, name: '선글라스', icon: '🕶️', tag: 'hot', price: 32000, stock: 15 },
  { id: 6, name: '샌들', icon: '🩴', tag: 'hot', price: 25000, stock: 30 },
  { id: 7, name: '목도리', icon: '🧣', tag: 'cold', price: 22000, stock: 20 },
  { id: 8, name: '장갑', icon: '🧤', tag: 'cold', price: 18000, stock: 18 },
]
let nextProductId = products.length + 1

let orders = []
let nextOrderId = 1

export function listProducts() {
  return products
}

export function getProduct(id) {
  return products.find((product) => product.id === id)
}

export function createProduct({ name, icon, tag, price, stock }) {
  const product = { id: nextProductId++, name, icon, tag, price, stock }
  products.push(product)
  return product
}

export function updateProduct(id, patch) {
  const product = products.find((item) => item.id === id)
  if (!product) return undefined

  Object.assign(product, patch)
  return product
}

export function removeProductById(id) {
  const index = products.findIndex((item) => item.id === id)
  if (index === -1) return undefined

  const [removed] = products.splice(index, 1)
  return removed
}

export function listOrders() {
  return orders
}

// items: [{ productId, qty }]. 하나라도 재고가 부족하면 아무것도 바꾸지 않고 실패 사유를 던진다 —
// "우산은 되고 장화는 안 된다" 식으로 절반만 처리되면 주문 내역과 실제 재고가 어긋나기 때문이다.
export function createOrder(items) {
  const resolved = items.map(({ productId, qty }) => {
    const product = getProduct(productId)
    if (!product) throw new Error(`상품(id: ${productId})을 찾을 수 없습니다.`)
    if (product.stock < qty) throw new Error(`${product.name} 재고가 부족합니다. (재고 ${product.stock}개)`)
    return { product, qty }
  })

  resolved.forEach(({ product, qty }) => {
    product.stock -= qty
  })

  const orderItems = resolved.map(({ product, qty }) => ({
    productId: product.id,
    name: product.name,
    icon: product.icon,
    price: product.price,
    qty,
  }))
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  const order = {
    id: nextOrderId++,
    items: orderItems,
    totalPrice,
    createdAt: new Date().toISOString(),
  }
  orders.unshift(order)
  return order
}
