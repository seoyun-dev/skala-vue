<script setup>
import { ref } from 'vue'
import LifecycleChild from './LifecycleChild.vue'

// v-if로 Child를 붙였다 뗐다 하면서 mount/unmount 시점을 관찰
const showChild = ref(true)
</script>

<template>
  <div class="practice-section">
    <h2>컴포넌트 생명주기 (onMounted / onUpdated / onUnmounted)</h2>
    <p>버튼을 눌러 자식 컴포넌트를 붙였다 떼면서 콘솔 로그를 확인하세요.</p>

    <button @click="showChild = !showChild">
      {{ showChild ? 'Child 제거 (onUnmounted 유발)' : 'Child 추가 (onMounted 유발)' }}
    </button>

    <LifecycleChild v-if="showChild" />
  </div>
</template>
