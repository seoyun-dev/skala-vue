<template>
  <div class="slot-default-child">
    <!-- 부모가 태그 사이에 넣은 내용이 여기에 그대로 꽂힙니다 -->
    <slot>기본값: 부모가 아무것도 안 넣으면 이 문구가 보여요</slot>
  </div>
</template>

<style scoped>
.slot-default-child {
  padding: 12px;
  border: 1px dashed #42b883;
  border-radius: 6px;
  margin-top: 10px;
}
</style>
