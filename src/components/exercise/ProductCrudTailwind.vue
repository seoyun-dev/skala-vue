<script setup>
import { computed, reactive, ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

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
}

function remove(product) {
  if (window.confirm(`${product.name}을 삭제할까요?`)) {
    emit('delete', product.id)
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label class="relative block w-full max-w-xs">
        <span class="sr-only">상품 검색</span>
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">⌕</span>
        <input
          v-model="search"
          type="search"
          placeholder="상품명 검색"
          class="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[color:var(--sky-accent)] focus:bg-white/10"
        />
      </label>
      <button
        type="button"
        class="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[color:var(--sky-accent)] px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:opacity-90"
        @click="openCreate"
      >
        <span aria-hidden="true">＋</span> 상품 등록
      </button>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-white/10">
      <table class="w-full min-w-[560px] border-collapse text-left">
        <thead class="bg-white/5">
          <tr class="text-xs font-bold uppercase tracking-wider text-slate-400">
            <th class="px-4 py-3">상품</th>
            <th class="px-4 py-3">태그</th>
            <th class="px-4 py-3">가격</th>
            <th class="px-4 py-3">재고</th>
            <th class="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/10">
          <tr v-for="product in filteredProducts" :key="product.id" class="transition hover:bg-white/5">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <span class="text-lg">{{ product.icon }}</span>
                <span class="font-semibold text-white">{{ product.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-400">{{ tagLabel(product.tag) }}</td>
            <td class="px-4 py-3 text-sm text-slate-300">₩{{ product.price.toLocaleString('ko-KR') }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold"
                :class="product.stock === 0 ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'"
              >
                {{ product.stock === 0 ? '품절' : `${product.stock}개` }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <button
                type="button"
                class="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[color:var(--sky-accent)] transition hover:bg-white/10"
                @click="openEdit(product)"
              >
                수정
              </button>
              <button
                type="button"
                class="ml-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/10"
                @click="remove(product)"
              >
                삭제
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredProducts.length === 0" class="p-8 text-center text-sm text-slate-400">
        검색 결과가 없어요.
      </div>
    </div>

    <TransitionRoot appear :show="dialog" as="template">
      <Dialog as="div" class="relative z-[3000]" @close="dialog = false">
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-200 ease-out"
              enter-from="opacity-0 scale-95 translate-y-2"
              enter-to="opacity-100 scale-100 translate-y-0"
              leave="duration-150 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141a2c] shadow-2xl">
                <div class="border-b border-white/10 px-6 py-5">
                  <DialogTitle as="h3" class="m-0 text-lg font-bold text-white">
                    {{ editingId ? '상품 정보 수정' : '새 상품 등록' }}
                  </DialogTitle>
                </div>

                <form class="space-y-4 p-6" @submit.prevent="save">
                  <p v-if="errorMessage" class="m-0 rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
                    {{ errorMessage }}
                  </p>

                  <label class="block">
                    <span class="mb-1.5 block text-sm font-semibold text-slate-300">상품명</span>
                    <input
                      v-model="form.name"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[color:var(--sky-accent)]"
                      placeholder="상품명을 입력하세요"
                    />
                  </label>

                  <label class="block">
                    <span class="mb-1.5 block text-sm font-semibold text-slate-300">아이콘(이모지)</span>
                    <input
                      v-model="form.icon"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[color:var(--sky-accent)]"
                      placeholder="☔"
                    />
                  </label>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <label class="block">
                      <span class="mb-1.5 block text-sm font-semibold text-slate-300">날씨 태그</span>
                      <select
                        v-model="form.tag"
                        class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[color:var(--sky-accent)]"
                      >
                        <option v-for="tag in TAGS" :key="tag.value" :value="tag.value" class="bg-[#141a2c]">{{ tag.label }}</option>
                      </select>
                    </label>

                    <label class="block">
                      <span class="mb-1.5 block text-sm font-semibold text-slate-300">가격(원)</span>
                      <input
                        v-model.number="form.price"
                        type="number"
                        class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[color:var(--sky-accent)]"
                      />
                    </label>
                  </div>

                  <label class="block">
                    <span class="mb-1.5 block text-sm font-semibold text-slate-300">재고(개)</span>
                    <input
                      v-model.number="form.stock"
                      type="number"
                      class="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[color:var(--sky-accent)]"
                    />
                  </label>

                  <div class="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      class="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 transition hover:bg-white/10"
                      @click="dialog = false"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      class="rounded-xl bg-[color:var(--sky-accent)] px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:opacity-90"
                    >
                      {{ editingId ? '수정 완료' : '상품 등록' }}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
