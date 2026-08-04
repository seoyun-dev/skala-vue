<template>
  <!-- 더블 베젤: 유리판을 알루미늄 트레이에 얹은 구조 -->
  <div class="bezel-shell">
    <div class="bezel-core">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.bezel-shell {
  padding: 6px;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
  animation: cardRise 0.8s var(--sky-ease) both;
  animation-delay: calc(var(--index, 0) * 120ms);
}

.bezel-core {
  border-radius: calc(2rem - 6px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.02));
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
  padding: 24px;
}

@keyframes cardRise {
  from {
    opacity: 0;
    transform: translateY(2rem);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (max-width: 768px) {
  .bezel-core {
    padding: 18px;
  }
}
</style>
