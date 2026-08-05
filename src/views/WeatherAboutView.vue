<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  { icon: '🔍', title: '도시 검색·추가·삭제', desc: '전 세계 어느 도시든 검색해서 내 목록에 담고 뗄 수 있어요.' },
  { icon: '📍', title: '내 위치 날씨', desc: '브라우저 위치 권한을 허용하면 상단에 내 위치 날씨가 고정으로 뜹니다.' },
  { icon: '✨', title: '우산·옷차림 추천', desc: '기온·습도·바람을 종합해 오늘 뭘 입고 우산이 필요한지 알려줘요.' },
  { icon: '📅', title: '5일 예보 · 대기질', desc: '앞으로 5일간의 기온 변화와 미세먼지 등급을 함께 확인하세요.' },
  { icon: '🛰️', title: '기상 레이더', desc: '강수·구름·기온·바람 레이더를 지도 위에서 바로 볼 수 있어요.' },
  { icon: '🌍', title: '국가 정보 · 인사말 배우기', desc: '도시를 클릭하면 그 나라 정보와 기초 인사말을 조금씩 배울 수 있어요.' },
  { icon: '🛍️', title: '날씨 상점', desc: '우산·우비 같은 날씨 용품을 주문하면 재고가 실제로 줄고, 상품 관리 화면은 서로 다른 두 디자인 스타일로 바꿔볼 수 있어요.' },
]
</script>

<template>
  <div class="detail-container">
    <div class="section-head">
      <h3>서비스 소개</h3>
      <span class="count-chip">ABOUT</span>
    </div>

    <div class="intro-card">
      <p class="intro-lead">
        <strong>한눈에 보는 하늘</strong>은 실시간 날씨 데이터를 기반으로<br />
        오늘의 날씨를 한눈에 읽고, 그에 맞는 생활 팁까지 함께 챙길 수 있도록 만든 날씨 대시보드예요.
      </p>

      <ul class="feature-list">
        <li v-for="feature in features" :key="feature.title" class="feature-row">
          <span class="feature-icon">{{ feature.icon }}</span>
          <div>
            <p class="feature-title">{{ feature.title }}</p>
            <p class="feature-desc">{{ feature.desc }}</p>
          </div>
        </li>
      </ul>
    </div>

    <button class="back-btn" @click="router.push('/')">← 날씨 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.06);
  animation: riseIn 0.7s var(--sky-ease) both;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.section-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--sky-ink);
}
.count-chip {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
}

.intro-card {
  padding: 24px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 20px;
}
.intro-lead {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--sky-ink-dim);
  text-align: center;
}
.intro-lead strong {
  color: var(--sky-ink);
}

.feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.feature-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.feature-icon {
  flex: none;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
}
.feature-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.feature-desc {
  margin: 3px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--sky-ink-dim);
}

.back-btn {
  display: block;
  margin: 0 auto;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: background 0.3s var(--sky-ease);
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

@keyframes riseIn {
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
</style>
