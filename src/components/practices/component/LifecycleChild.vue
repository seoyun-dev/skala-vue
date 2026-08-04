<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'

const count = ref(0)

// 🟢 1) 컴포넌트가 화면에 그려진 직후 실행
onMounted(() => {
  console.log('🟢 [Child] onMounted: 화면에 마운트됨')
})

// 🔵 2) count가 바뀌어 화면이 다시 그려진 직후마다 실행
onUpdated(() => {
  console.log('🔵 [Child] onUpdated: 화면이 갱신됨, count =', count.value)
})

// 🔴 3) 컴포넌트가 화면에서 제거되기 직전 실행
onUnmounted(() => {
  console.log('🔴 [Child] onUnmounted: 화면에서 제거됨')
})
</script>

<template>
  <div class="lifecycle-child">
    <p>Child count: {{ count }}</p>
    <button @click="count++">count 증가 (onUpdated 유발)</button>
  </div>
</template>

<style scoped>
.lifecycle-child {
  padding: 12px;
  border: 1px dashed #42b883;
  border-radius: 6px;
  margin-top: 10px;
}
</style>
