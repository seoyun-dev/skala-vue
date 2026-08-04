<script setup>
// Child가 들고 있는 데이터를 슬롯을 통해 부모 쪽 템플릿으로 노출
const cityList = [
  { name: '서울', temperature: 25 },
  { name: '부산', temperature: 27 },
  { name: '수원', temperature: 24 },
]
</script>

<template>
  <div class="slot-scoped-child">
    <ul>
      <li v-for="city in cityList" :key="city.name">
        <!-- v-slot으로 받을 수 있게 city 데이터를 슬롯 props로 넘김 -->
        <slot :city="city">
          {{ city.name }}: {{ city.temperature }}°C
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.slot-scoped-child {
  padding: 12px;
  border: 1px dashed #42b883;
  border-radius: 6px;
  margin-top: 10px;
}
</style>
