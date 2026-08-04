<script setup>
import SlotDefaultChild from './SlotDefaultChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>기본 슬롯 (Default Slot)</h2>

    <h3>1) 내용을 채워서 전달</h3>
    <SlotDefaultChild>
      <strong>부모에서 채워 넣은 날씨 카드 내용</strong>
    </SlotDefaultChild>

    <h3>2) 아무것도 안 채우면 Child의 fallback 내용 노출</h3>
    <SlotDefaultChild />
  </div>
</template>
