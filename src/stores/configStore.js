import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 섭씨/화씨 단위 설정을 앱 전체에서 공유하는 Pinia 스토어.
// 모든 날씨 데이터는 항상 섭씨로 저장·계산되고(추천 로직 등), 화면에 보여줄 때만 이 스토어를 통해 변환한다.
export const useConfigStore = defineStore('config', () => {
  const unit = ref('celsius')
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '°C' : '°F'))

  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  // 섭씨 숫자를 받아 현재 단위에 맞는 정수 문자열로 변환 (° 기호는 호출부에서 붙인다)
  function formatTemp(celsius) {
    if (celsius == null || Number.isNaN(celsius)) return '-'
    if (unit.value === 'fahrenheit') {
      return String(Math.round((celsius * 9) / 5 + 32))
    }
    return String(Math.round(celsius))
  }

  return { unit, unitSymbol, toggleUnit, formatTemp }
})
