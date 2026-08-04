<template>
  <div class="slot-named-child">
    <header>
      <slot name="header">기본 헤더</slot>
    </header>
    <main>
      <slot>기본 본문</slot>
    </main>
    <footer>
      <slot name="footer">기본 푸터</slot>
    </footer>
  </div>
</template>

<style scoped>
.slot-named-child {
  padding: 12px;
  border: 1px dashed #42b883;
  border-radius: 6px;
  margin-top: 10px;
}
.slot-named-child header {
  font-weight: bold;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 6px;
  margin-bottom: 6px;
}
.slot-named-child footer {
  border-top: 1px solid #e9ecef;
  padding-top: 6px;
  margin-top: 6px;
  font-size: 0.9em;
  color: #6c757d;
}
</style>
