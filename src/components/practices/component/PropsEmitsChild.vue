<script setup>
// 🟢 Props: 부모 → 자식으로 데이터 전달받기
const props = defineProps({
  city: {
    type: String,
    required: true,
  },
  temperature: {
    type: Number,
    default: 0,
  },
})

// 🔵 Emits: 자식 → 부모로 이벤트 전달하기
const emit = defineEmits(['increase', 'reset'])
</script>

<template>
  <div class="props-emits-child">
    <p>
      전달받은 도시: <strong>{{ city }}</strong> / 온도: <strong>{{ temperature }}°C</strong>
    </p>
    <button @click="emit('increase', 1)">부모에게 온도 +1 요청</button> &nbsp;
    <button @click="emit('reset')">부모에게 초기화 요청</button>
  </div>
</template>

<style scoped>
.props-emits-child {
  padding: 12px;
  border: 1px dashed #42b883;
  border-radius: 6px;
  margin-top: 10px;
}
</style>
