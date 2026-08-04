<script setup>
import { computed } from 'vue'
import { getConditionTags } from '@/utils/weatherAdvice'

// 1. 상위로부터 단방향 주입받을 객체 데이터 규격 검수 (매크로)
const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },
  // 부모가 1초마다 내려주는 공용 시계 (현지 시각 계산 기준점)
  now: {
    type: Number,
    default: 0,
  },
  // 검색 결과 카드에는 담기 버튼, 저장된 카드에는 빼기 버튼을 노출
  addable: {
    type: Boolean,
    default: false,
  },
  removable: {
    type: Boolean,
    default: false,
  },
})

// 2. 상위로 송신할 커스텀 이벤트 식별자 등록 (매크로)
const emit = defineEmits(['select-card', 'click-detail', 'add-card', 'remove-card'])

// 한글 받침 유무에 따라 주격 조사(이/가)를 자동으로 붙인다
const withJosa = (word) => {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return `${word}가`
  const hasBatchim = (code - 0xac00) % 28 !== 0
  return `${word}${hasBatchim ? '이' : '가'}`
}

const statusGlyph = computed(
  () => ({ 맑음: '☀️', 비: '🌧️', 구름: '☁️', 눈: '❄️' })[props.cityItem.status] ?? '🌤️',
)
const isHot = computed(() => props.cityItem.temp >= 25)

// UTC 시각에 도시의 오프셋(초)을 더하면 그 도시의 벽시계 시각이 된다
const localDate = computed(() => {
  const offset = props.cityItem.timezone
  if (offset == null || !props.now) return null
  return new Date(props.now + offset * 1000)
})

const localTime = computed(() => {
  if (!localDate.value) return null
  const hours = String(localDate.value.getUTCHours()).padStart(2, '0')
  const minutes = String(localDate.value.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
})

// 우리나라 시각과 몇 시간 차이인지 (KST는 UTC+9 = 32400초)
const timeDiffLabel = computed(() => {
  const offset = props.cityItem.timezone
  if (offset == null) return null
  const diffHours = (offset - 32400) / 3600
  if (diffHours === 0) return null
  const sign = diffHours > 0 ? '+' : '−'
  const size = Math.abs(diffHours)
  return `한국 ${sign}${Number.isInteger(size) ? size : size.toFixed(1)}h`
})

// 현지가 낮인지 밤인지 (06~18시를 낮으로 본다)
const isNight = computed(() => {
  if (!localDate.value) return false
  const hour = localDate.value.getUTCHours()
  return hour < 6 || hour >= 18
})

// ✨ 추가: 우산/강풍/더위/추위 조건 뱃지 — 상세페이지의 "오늘의 추천"과 동일한 계산 로직을 재사용
const conditionTags = computed(() =>
  getConditionTags({
    feelsLikeC: props.cityItem.feelsLike,
    humidityPct: props.cityItem.humidity,
    windSpeedMs: props.cityItem.windSpeed,
    statusMain: props.cityItem.statusMain,
  }),
)
const tagGlyphMap = { rain: '☔', windy: '💨', hot: '🥵', cold: '🥶' }
const tagLabelMap = { rain: '우산 필요', windy: '강풍 주의', hot: '더움', cold: '추움' }
</script>

<template>
  <div
    class="weather-card"
    :class="isHot ? 'is-hot' : 'is-cool'"
    @click="emit('select-card', `${withJosa(cityItem.name)} 선택되었습니다.`)"
  >
    <div class="glyph-tile">{{ statusGlyph }}</div>

    <div class="card-info">
      <h4 class="city-name">
        {{ cityItem.name }}
        <span v-if="localTime" class="local-clock" :title="timeDiffLabel ?? '한국과 시차 없음'">
          {{ isNight ? '🌙' : '☀️' }} {{ localTime }}
        </span>
      </h4>
      <p class="city-status">
        {{ cityItem.status }}
        <span v-if="timeDiffLabel" class="time-diff">· {{ timeDiffLabel }}</span>
      </p>

      <!-- ✨ 추가: 우산/강풍/더위/추위 추천 뱃지 (상세페이지에는 전체 문구로 더 자세히 나옴) -->
      <div v-if="conditionTags.length > 0" class="advice-badges">
        <span v-for="tag in conditionTags" :key="tag" class="advice-badge" :title="tagLabelMap[tag]">
          {{ tagGlyphMap[tag] }}
        </span>
      </div>
    </div>

    <div class="card-temp">
      <span class="temp-value">{{ cityItem.temp }}<small>°</small></span>
      <span v-if="isHot" class="badge hot">더움</span>
      <span v-else class="badge cool">선선함</span>
    </div>

    <div class="card-actions">
      <button
        v-if="addable"
        class="btn-add"
        title="이 도시를 목록에 추가"
        @click.stop="emit('add-card')"
      >
        + 추가
      </button>

      <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
        상세보기
        <span class="btn-arrow">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8H13M13 8L9 4M13 8L9 12"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>

      <button
        v-if="removable"
        class="btn-remove"
        :aria-label="`${cityItem.name} 목록에서 제거`"
        title="목록에서 제거"
        @click.stop="emit('remove-card')"
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4 4L12 12M12 4L4 12"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px 14px;
  padding: 16px 18px;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  cursor: pointer;
  transition: all 0.5s var(--sky-ease);
  animation: cardRise 0.7s var(--sky-ease) both;
  animation-delay: calc(var(--index, 0) * 80ms);
}
.weather-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(255, 255, 255, 0.14);
}
.weather-card.is-hot:hover {
  box-shadow: 0 12px 40px -12px rgba(251, 146, 60, 0.25);
}
.weather-card.is-cool:hover {
  box-shadow: 0 12px 40px -12px rgba(125, 211, 252, 0.25);
}
.weather-card:active {
  transform: scale(0.985);
}

.glyph-tile {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
  transition: transform 0.5s var(--sky-ease);
}
.weather-card:hover .glyph-tile {
  transform: scale(1.08) rotate(-4deg);
}

.city-name {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
}
.local-clock {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.09);
  border: 1px solid rgba(125, 211, 252, 0.18);
}
.city-status {
  margin: 3px 0 0;
  font-size: 13px;
  color: var(--sky-ink-dim);
}
.time-diff {
  opacity: 0.65;
}

.advice-badges {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}
.advice-badge {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: default;
}

.card-temp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}
.temp-value {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--sky-ink);
}
.temp-value small {
  font-size: 17px;
  font-weight: 600;
  color: var(--sky-ink-dim);
}

.badge {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: 999px;
}
.badge.hot {
  color: #fdba74;
  background: rgba(251, 146, 60, 0.12);
  border: 1px solid rgba(251, 146, 60, 0.25);
}
.badge.cool {
  color: #7dd3fc;
  background: rgba(125, 211, 252, 0.1);
  border: 1px solid rgba(125, 211, 252, 0.22);
}

.card-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.btn-add {
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  color: #050505;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.5s var(--sky-ease);
}
.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px -8px rgba(125, 211, 252, 0.6);
}
.btn-add:active {
  transform: scale(0.97);
}

.btn-remove {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: var(--sky-ink-dim);
  cursor: pointer;
  transition: all 0.4s var(--sky-ease);
}
.btn-remove svg {
  width: 13px;
  height: 13px;
}
.btn-remove:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35);
  transform: scale(1.08);
}
.btn-remove:active {
  transform: scale(0.95);
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 7px 7px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--sky-ink);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.5s var(--sky-ease);
}
.btn-detail:hover {
  transform: scale(1.04);
  background: rgba(255, 255, 255, 0.1);
}
.btn-detail:active {
  transform: scale(0.97);
}

.btn-arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  color: #050505;
  transition: transform 0.5s var(--sky-ease);
}
.btn-arrow svg {
  width: 13px;
  height: 13px;
}
.btn-detail:hover .btn-arrow {
  transform: translateX(3px);
}

@keyframes cardRise {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (max-width: 768px) {
  .weather-card {
    padding: 14px;
  }
  .card-actions {
    justify-content: center;
  }
}
</style>
