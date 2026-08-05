<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  products: { type: Array, required: true },
})

const emit = defineEmits(['create', 'update', 'delete'])

const TAGS = [
  { value: 'rain', label: '☔ 비' },
  { value: 'windy', label: '💨 강풍' },
  { value: 'hot', label: '🥵 더위' },
  { value: 'cold', label: '🥶 추위' },
]

const search = ref('')
const dialog = ref(false)
const editingId = ref(null)
const errorMessage = ref('')
const form = reactive({ name: '', icon: '☔', tag: 'rain', price: 0, stock: 0 })

const filteredProducts = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return props.products
  return props.products.filter((product) => product.name.toLowerCase().includes(keyword))
})

function tagLabel(value) {
  return TAGS.find((tag) => tag.value === value)?.label ?? value
}

function resetForm() {
  Object.assign(form, { name: '', icon: '☔', tag: 'rain', price: 0, stock: 0 })
  errorMessage.value = ''
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialog.value = true
}

function openEdit(product) {
  editingId.value = product.id
  Object.assign(form, product)
  errorMessage.value = ''
  dialog.value = true
}

function save() {
  if (!form.name.trim() || !form.icon.trim() || Number(form.price) < 0 || Number(form.stock) < 0) {
    errorMessage.value = '상품명·아이콘을 입력하고, 가격·재고는 0 이상이어야 합니다.'
    return
  }
  const payload = { ...form, name: form.name.trim(), icon: form.icon.trim(), price: Number(form.price), stock: Number(form.stock) }
  if (editingId.value) emit('update', { ...payload, id: editingId.value })
  else emit('create', payload)
  dialog.value = false
  ElMessage.success(editingId.value ? '상품 정보를 수정했어요.' : '상품을 등록했어요.')
}

async function remove(product) {
  try {
    await ElMessageBox.confirm(`${product.name}을 삭제할까요?`, '상품 삭제', {
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      type: 'warning',
    })
    emit('delete', product.id)
    ElMessage.success('상품을 삭제했어요.')
  } catch {
    // 취소한 경우 아무 작업도 하지 않는다.
  }
}
</script>

<template>
  <div class="crud-block">
    <div class="crud-toolbar">
      <el-input v-model="search" clearable placeholder="상품명 검색" class="crud-search">
        <template #prefix>⌕</template>
      </el-input>
      <el-button type="primary" @click="openCreate">+ 상품 등록</el-button>
    </div>

    <el-table :data="filteredProducts" style="width: 100%">
      <el-table-column label="상품" min-width="180">
        <template #default="{ row }">
          <div class="product-cell">
            <span class="product-cell-icon">{{ row.icon }}</span>
            <strong>{{ row.name }}</strong>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="태그" width="100">
        <template #default="{ row }">{{ tagLabel(row.tag) }}</template>
      </el-table-column>
      <el-table-column label="가격" width="110">
        <template #default="{ row }">₩{{ row.price.toLocaleString('ko-KR') }}</template>
      </el-table-column>
      <el-table-column label="재고" width="100">
        <template #default="{ row }">
          <el-tag :type="row.stock === 0 ? 'danger' : 'success'" size="small">
            {{ row.stock === 0 ? '품절' : `${row.stock}개` }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="관리" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEdit(row)">수정</el-button>
          <el-button size="small" type="danger" plain @click="remove(row)">삭제</el-button>
        </template>
      </el-table-column>
      <template #empty>검색 결과가 없어요.</template>
    </el-table>

    <el-dialog
      v-model="dialog"
      :title="editingId ? '상품 정보 수정' : '새 상품 등록'"
      width="min(480px, 92vw)"
      :close-on-click-modal="false"
    >
      <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" class="form-alert" />
      <el-form :model="form" label-position="top">
        <el-form-item label="상품명" required>
          <el-input v-model="form.name" placeholder="상품명을 입력하세요" />
        </el-form-item>
        <el-form-item label="아이콘(이모지)" required>
          <el-input v-model="form.icon" placeholder="☔" />
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="날씨 태그">
            <el-select v-model="form.tag" style="width: 100%">
              <el-option v-for="tag in TAGS" :key="tag.value" :label="tag.label" :value="tag.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="가격(원)">
            <el-input v-model.number="form.price" type="number" />
          </el-form-item>
        </div>
        <el-form-item label="재고(개)">
          <el-input v-model.number="form.stock" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">취소</el-button>
        <el-button type="primary" @click="save">{{ editingId ? '수정 완료' : '상품 등록' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.crud-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.crud-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.crud-search {
  max-width: 260px;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.product-cell-icon {
  font-size: 18px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-alert {
  margin-bottom: 16px;
}

@media (max-width: 560px) {
  .crud-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .crud-search {
    max-width: none;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
