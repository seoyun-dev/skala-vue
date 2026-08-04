<script setup>
import SlotNamedChild from './SlotNamedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>이름을 가진 슬롯 (Named Slot)</h2>

    <SlotNamedChild>
      <template #header> ⛅ 오늘의 날씨 카드 </template>

      <p>서울 25°C, 맑음</p>

      <template #footer> 마지막 갱신: 방금 전 </template>
    </SlotNamedChild>
  </div>
</template>
