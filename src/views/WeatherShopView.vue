<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { shopApi } from '@/utils/shopApi'
import ProductCrudElementPlus from '@/components/exercise/ProductCrudElementPlus.vue'
import ProductCrudTailwind from '@/components/exercise/ProductCrudTailwind.vue'

const TAG_LABEL = { rain: '☔ 비', windy: '💨 강풍', hot: '🥵 더위', cold: '🥶 추위' }

const activeTab = ref('shop') // 'shop' | 'admin'
const adminStyle = ref('element') // 'element' | 'tailwind' — 재고 관리 화면의 표현 스타일

const products = ref([])
const orders = ref([])
const isLoading = ref(false)
const hasError = ref(false)

// 상품 id -> 담을 수량. 상품 목록이 바뀔 때마다 새로 생긴 상품은 1로, 재고가 줄어든 상품은
// 재고를 넘지 않게 다시 맞춰준다(예: 다른 탭에서 재고 관리로 재고를 줄인 직후).
const quantities = reactive({})
function syncQuantities() {
  products.value.forEach((product) => {
    const current = quantities[product.id] ?? 1
    quantities[product.id] = Math.min(Math.max(current, product.stock > 0 ? 1 : 0), Math.max(product.stock, 0))
  })
}

const cart = ref([]) // { productId, name, icon, price, qty }
const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))
const isPlacingOrder = ref(false)

async function loadProducts() {
  isLoading.value = true
  hasError.value = false
  try {
    products.value = await shopApi.listProducts()
    syncQuantities()
  } catch (error) {
    console.error('🔴 상품 목록 조회 실패:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

async function loadOrders() {
  try {
    orders.value = await shopApi.listOrders()
  } catch (error) {
    console.error('🔴 주문 내역 조회 실패:', error)
  }
}

function stepQuantity(product, delta) {
  const next = (quantities[product.id] ?? 0) + delta
  quantities[product.id] = Math.min(Math.max(next, 0), product.stock)
}

function addToCart(product) {
  const qty = quantities[product.id] ?? 0
  if (qty <= 0) return

  const existing = cart.value.find((item) => item.productId === product.id)
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, product.stock)
  } else {
    cart.value.push({ productId: product.id, name: product.name, icon: product.icon, price: product.price, qty })
  }
  ElMessage.success(`${product.name} ${qty}개를 장바구니에 담았어요.`)
}

function removeFromCart(productId) {
  cart.value = cart.value.filter((item) => item.productId !== productId)
}

async function placeOrder() {
  if (cart.value.length === 0) return

  isPlacingOrder.value = true
  try {
    const { products: updated } = await shopApi.placeOrder(
      cart.value.map((item) => ({ productId: item.productId, qty: item.qty })),
    )
    products.value = updated
    syncQuantities()
    cart.value = []
    ElMessage.success('주문이 완료됐어요. 재고가 반영됐어요.')
    await loadOrders()
  } catch (error) {
    // 재고 부족 등 주문 자체가 거절된 사유를 그대로 보여준다.
    ElMessage.error(error.response?.data?.message ?? error.message ?? '주문에 실패했어요.')
  } finally {
    isPlacingOrder.value = false
  }
}

// 재고 관리 화면(ProductCrudElementPlus/Tailwind 둘 다 같은 이벤트 규격)에서 올라오는 CRUD 요청을
// 실제 API에 반영하고, "쇼핑" 탭과 같은 products 배열을 다시 채운다 — 그래서 화면을 옮기지 않아도
// 재고를 고치면 곧바로 상품 그리드에도 반영된다.
async function createProduct(product) {
  try {
    await shopApi.createProduct(product)
    await loadProducts()
  } catch (error) {
    ElMessage.error(error.response?.data?.message ?? error.message ?? '상품 등록에 실패했어요.')
  }
}

async function updateProduct(product) {
  try {
    await shopApi.updateProduct(product.id, product)
    await loadProducts()
  } catch (error) {
    ElMessage.error(error.response?.data?.message ?? error.message ?? '상품 수정에 실패했어요.')
  }
}

async function deleteProduct(id) {
  try {
    await shopApi.removeProduct(id)
    await loadProducts()
  } catch (error) {
    ElMessage.error(error.response?.data?.message ?? error.message ?? '상품 삭제에 실패했어요.')
  }
}

function formatPrice(value) {
  return `₩${value.toLocaleString('ko-KR')}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  loadProducts()
  loadOrders()
})
</script>

<template>
  <div class="detail-container">
    <div class="section-head">
      <h3>🛍️ 날씨 상점</h3>
      <span class="count-chip">SHOP</span>
    </div>

    <div class="shop-tabs" role="tablist">
      <button
        type="button"
        class="shop-tab"
        :class="{ active: activeTab === 'shop' }"
        role="tab"
        @click="activeTab = 'shop'"
      >
        쇼핑
      </button>
      <button
        type="button"
        class="shop-tab"
        :class="{ active: activeTab === 'admin' }"
        role="tab"
        @click="activeTab = 'admin'"
      >
        재고 관리
      </button>
    </div>

    <section v-if="activeTab === 'shop'" class="shop-body">
      <div v-if="isLoading" class="shop-status">상품을 불러오는 중...</div>
      <div v-else-if="hasError" class="shop-status">상품을 가져오지 못했어요.</div>

      <template v-else>
        <div class="product-grid">
          <article v-for="product in products" :key="product.id" class="product-card">
            <span class="product-icon">{{ product.icon }}</span>
            <p class="product-name">{{ product.name }}</p>
            <span class="product-tag">{{ TAG_LABEL[product.tag] ?? product.tag }}</span>
            <p class="product-price">{{ formatPrice(product.price) }}</p>
            <p class="product-stock" :class="{ low: product.stock === 0 }">
              {{ product.stock > 0 ? `재고 ${product.stock}개` : '품절' }}
            </p>

            <div class="qty-row">
              <button type="button" class="qty-btn" :disabled="quantities[product.id] <= 0" @click="stepQuantity(product, -1)">−</button>
              <span class="qty-value">{{ quantities[product.id] ?? 0 }}</span>
              <button type="button" class="qty-btn" :disabled="quantities[product.id] >= product.stock" @click="stepQuantity(product, 1)">+</button>
            </div>

            <button
              type="button"
              class="add-btn"
              :disabled="product.stock === 0 || (quantities[product.id] ?? 0) <= 0"
              @click="addToCart(product)"
            >
              장바구니에 담기
            </button>
          </article>
        </div>

        <div class="cart-block">
          <h4>🛒 장바구니</h4>
          <p v-if="cart.length === 0" class="shop-status">담은 상품이 없어요.</p>
          <ul v-else class="cart-list">
            <li v-for="item in cart" :key="item.productId" class="cart-row">
              <span class="cart-icon">{{ item.icon }}</span>
              <span class="cart-name">{{ item.name }} × {{ item.qty }}</span>
              <span class="cart-subtotal">{{ formatPrice(item.price * item.qty) }}</span>
              <button type="button" class="cart-remove" @click="removeFromCart(item.productId)">✕</button>
            </li>
          </ul>

          <div v-if="cart.length > 0" class="cart-footer">
            <span class="cart-total">총 {{ formatPrice(cartTotal) }}</span>
            <el-button type="primary" :loading="isPlacingOrder" @click="placeOrder">주문하기</el-button>
          </div>
        </div>

        <div class="order-history-block">
          <h4>📦 주문 내역</h4>
          <p v-if="orders.length === 0" class="shop-status">아직 주문한 내역이 없어요.</p>
          <ul v-else class="order-list">
            <li v-for="order in orders" :key="order.id" class="order-row">
              <div class="order-head">
                <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                <span class="order-total">{{ formatPrice(order.totalPrice) }}</span>
              </div>
              <p class="order-items">
                {{ order.items.map((item) => `${item.icon} ${item.name} ×${item.qty}`).join(', ') }}
              </p>
            </li>
          </ul>
        </div>
      </template>
    </section>

    <section v-else class="admin-body">
      <div class="admin-style-toggle">
        <button
          type="button"
          class="admin-style-btn"
          :class="{ active: adminStyle === 'element' }"
          @click="adminStyle = 'element'"
        >
          Element Plus
        </button>
        <button
          type="button"
          class="admin-style-btn"
          :class="{ active: adminStyle === 'tailwind' }"
          @click="adminStyle = 'tailwind'"
        >
          Tailwind
        </button>
      </div>

      <ProductCrudElementPlus
        v-if="adminStyle === 'element'"
        :products="products"
        @create="createProduct"
        @update="updateProduct"
        @delete="deleteProduct"
      />
      <ProductCrudTailwind
        v-else
        :products="products"
        @create="createProduct"
        @update="updateProduct"
        @delete="deleteProduct"
      />
    </section>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
  animation: riseIn 0.7s var(--sky-ease) both;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.section-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
}
.count-chip {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
}

.shop-tabs {
  display: flex;
  gap: 6px;
  padding: 4px;
  margin-bottom: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.shop-tab {
  flex: 1;
  padding: 9px 12px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s var(--sky-ease);
}
.shop-tab:hover {
  color: var(--sky-ink);
}
.shop-tab.active {
  color: var(--sky-ink);
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
}

.shop-status {
  padding: 16px 0;
  text-align: center;
  font-size: 13px;
  color: var(--sky-ink-dim);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}
.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  text-align: center;
}
.product-icon {
  font-size: 34px;
  line-height: 1;
}
.product-name {
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 700;
  color: var(--sky-ink);
}
.product-tag {
  font-size: 10px;
  color: var(--sky-ink-dim);
}
.product-price {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-accent);
}
.product-stock {
  margin: 0;
  font-size: 11px;
  color: var(--sky-ink-dim);
}
.product-stock.low {
  color: #f87171;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}
.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
}
.qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.qty-value {
  min-width: 20px;
  font-size: 13px;
  font-weight: 700;
  color: var(--sky-ink);
}

.add-btn {
  width: 100%;
  margin-top: 6px;
  padding: 7px 0;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background 0.3s var(--sky-ease);
}
.add-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
}
.add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cart-block,
.order-history-block {
  margin-top: 22px;
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.cart-block h4,
.order-history-block h4 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}

.cart-list,
.order-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cart-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
}
.cart-icon {
  font-size: 16px;
}
.cart-name {
  flex: 1;
  color: var(--sky-ink);
}
.cart-subtotal {
  color: var(--sky-ink-dim);
}
.cart-remove {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  color: var(--sky-ink-dim);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
.cart-remove:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.cart-total {
  font-size: 15px;
  font-weight: 700;
  color: var(--sky-ink);
}

.order-row {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
}
.order-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--sky-ink-dim);
}
.order-total {
  font-weight: 700;
  color: var(--sky-ink);
}
.order-items {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--sky-ink-dim);
}

.admin-style-toggle {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  margin-bottom: 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.admin-style-btn {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s var(--sky-ease);
}
.admin-style-btn:hover {
  color: var(--sky-ink);
}
.admin-style-btn.active {
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.08);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(2rem);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (max-width: 640px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }
}
</style>
