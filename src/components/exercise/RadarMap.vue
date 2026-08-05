<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// OpenWeatherMap 무료 타일 레이어 API — 같은 .env 키를 그대로 재사용한다
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const props = defineProps({
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
})

const LAYERS = [
  { key: 'precipitation_new', label: '🌧️ 강수' },
  { key: 'clouds_new', label: '☁️ 구름' },
  { key: 'temp_new', label: '🌡️ 기온' },
  { key: 'wind_new', label: '💨 바람' },
]
const activeLayer = ref('precipitation_new')

const mapEl = ref(null)
// Leaflet 인스턴스는 내부적으로 DOM을 직접 조작하는 명령형 객체라 ref로 감싸지 않는다.
// Vue의 반응성 추적 대상에 넣으면 오히려 불필요한 프록시 오버헤드만 생긴다.
let map = null
let owmTileLayer = null

// OpenWeatherMap 타일은 지도 아래 깔린 OpenStreetMap과 겹쳐 보여야 해서 반투명(0.65)으로 얹는다.
function buildOwmLayer(layerKey) {
  return L.tileLayer(
    `https://tile.openweathermap.org/map/${layerKey}/{z}/{x}/{y}.png?appid=${API_KEY}`,
    { opacity: 0.65, attribution: '© OpenWeatherMap' },
  )
}

function initMap() {
  map = L.map(mapEl.value, {
    center: [props.lat, props.lon],
    zoom: 6,
    // 카드 안에 작게 들어가는 지도라 스크롤로 확대/축소되면 페이지 스크롤과 충돌한다.
    scrollWheelZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map)

  L.circleMarker([props.lat, props.lon], {
    radius: 8,
    color: '#7dd3fc',
    weight: 2,
    fillColor: '#7dd3fc',
    fillOpacity: 0.5,
  }).addTo(map)

  owmTileLayer = buildOwmLayer(activeLayer.value)
  owmTileLayer.addTo(map)
}

// Leaflet은 타일 레이어를 자동으로 교체해주지 않으므로, 기존 레이어를 지우고
// 새 레이어를 얹는 방식으로 강수/구름/기온/바람 탭 전환을 구현한다.
function switchLayer(layerKey) {
  activeLayer.value = layerKey
  if (!map) return
  if (owmTileLayer) map.removeLayer(owmTileLayer)
  owmTileLayer = buildOwmLayer(layerKey)
  owmTileLayer.addTo(map)
}

// 같은 컴포넌트 인스턴스를 유지한 채 다른 도시로 좌표만 바뀌는 경우(예: 라우트 재사용)를 대비해
// 지도 중심만 이동시키고 줌 레벨은 사용자가 조작한 값을 그대로 둔다.
watch(
  () => [props.lat, props.lon],
  ([lat, lon]) => {
    if (!map) return
    map.setView([lat, lon], map.getZoom())
  },
)

onMounted(initMap)
// Leaflet은 컴포넌트가 사라져도 스스로 정리되지 않아, 명시적으로 remove()하지 않으면
// 페이지를 오가며 지도를 여러 번 열 때 이벤트 리스너가 계속 누적된다.
onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

<template>
  <div class="radar-block">
    <div class="radar-head">
      <h4>🛰️ 기상 레이더</h4>
      <div class="layer-tabs">
        <button
          v-for="layer in LAYERS"
          :key="layer.key"
          class="layer-tab"
          :class="{ active: activeLayer === layer.key }"
          @click="switchLayer(layer.key)"
        >
          {{ layer.label }}
        </button>
      </div>
    </div>
    <div ref="mapEl" class="radar-map"></div>
  </div>
</template>

<style scoped>
.radar-block {
  margin-top: 22px;
}
.radar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.radar-head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.layer-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.layer-tab {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s var(--sky-ease);
}
.layer-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}
.layer-tab.active {
  color: #0b0f18;
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  border-color: transparent;
}

.radar-map {
  width: 100%;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Leaflet 컨트롤(줌 버튼 등)이 다크 테마 위에서도 보이도록 살짝 보정 */
.radar-map :deep(.leaflet-control-zoom a) {
  color: #111;
}
</style>
