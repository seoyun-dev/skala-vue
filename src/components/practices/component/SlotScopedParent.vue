<script setup>
import SlotScopedChild from './SlotScopedChild.vue'
</script>

<template>
  <div class="practice-section">
    <h2>스코프 슬롯 (Scoped Slot)</h2>
    <p>Child가 가진 데이터(city)를 슬롯 props로 받아 부모가 직접 화면을 꾸밉니다.</p>

    <SlotScopedChild v-slot="{ city }">
      <strong>{{ city.name }}</strong> 는 지금 <strong>{{ city.temperature }}°C</strong> 입니다.
    </SlotScopedChild>
  </div>
</template>
