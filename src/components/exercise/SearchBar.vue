<script setup>
// 1. 상위로 입력 텍스트를 전달할 커스텀 이벤트 등록 (매크로)
defineEmits(['update-query'])

// 2. 상위로부터 현재 검색 상태 값을 수신 (한글 동기화 상태 유지용)
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="search-inner">
    <label class="search-field">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" />
        <path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      <input
        type="text"
        :value="currentQuery"
        @input="$emit('update-query', $event.target.value)"
        placeholder="어느 도시가 궁금하세요?"
      />
      <transition name="chip">
        <span v-if="currentQuery" class="query-chip">{{ currentQuery }}</span>
      </transition>
    </label>
  </div>
</template>

<style scoped>
.search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 6px 18px;
  border-radius: 999px;
  background: rgba(5, 5, 5, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.09);
  transition: all 0.5s var(--sky-ease);
  cursor: text;
}
.search-field:focus-within {
  border-color: rgba(125, 211, 252, 0.45);
  box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.08), 0 0 30px rgba(125, 211, 252, 0.08);
}

.search-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: rgba(244, 246, 251, 0.4);
  transition: color 0.5s var(--sky-ease);
}
.search-field:focus-within .search-icon {
  color: var(--sky-accent);
}

.search-field input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  padding: 12px 0;
  font-size: 15px;
  font-family: inherit;
  color: var(--sky-ink);
}
.search-field input::placeholder {
  color: rgba(244, 246, 251, 0.32);
}

.query-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #050505;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  transition: all 0.5s var(--sky-ease);
}

.chip-enter-from,
.chip-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
