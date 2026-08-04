<script setup>
import { ref } from 'vue'
import PropsEmitsChild from './PropsEmitsChild.vue'

const city = ref('서울')
const temperature = ref(25)

// 자식이 emit('increase', 1)을 쏘면 여기서 받아서 처리
const handleIncrease = (amount) => {
  temperature.value += amount
}

const handleReset = () => {
  temperature.value = 25
}
</script>

<template>
  <div class="practice-section">
    <h2>Props & Emits (부모 ↔ 자식 데이터 흐름)</h2>
    <p>
      부모 상태: {{ city }} / {{ temperature }}°C
    </p>

    <PropsEmitsChild
      :city="city"
      :temperature="temperature"
      @increase="handleIncrease"
      @reset="handleReset"
    />
  </div>
</template>
