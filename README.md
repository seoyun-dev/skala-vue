# weather-stylist

Vue 3 + Vite로 만든 **날씨 기반 스타일 추천 대시보드**입니다. [`vue3-playground`](https://github.com/hyun907/vue3-playground)를 기반으로,
Pinia 상태관리와 mock REST API, 날씨 조건별 추천 기능을 새로 얹어 발전시켰습니다.

- 🌦️ **데이터** — [OpenWeatherMap](https://openweathermap.org/api) Current Weather / Geocoding API
- 🗄️ **서버** — Node.js 내장 `http` 모듈로 만든 mock REST API (도시 목록 저장용)

---

## 주요 기능

| 기능 | 구현 포인트 |
| --- | --- |
| 실시간 날씨 조회 | `Promise.all`로 여러 도시를 병렬 요청 (`axios`) |
| 상태관리 | 날씨 목록·검색·저장 로직을 전부 Pinia 스토어(`src/stores/weatherStore.js`)로 이전 |
| 기본 도시 | 뉴욕·서울·웰링턴 — 시차가 크게 벌어져 카드별 현지 시각이 대비되어 보임 |
| 도시 검색/추가/삭제 | 로컬 필터 → 결과 없으면 디바운스 후 원격 Geocoding 검색, 추가/삭제 가능 |
| 목록 저장 | 기본은 `localStorage`(도시 코드·한글명만), "☁️ 서버에도 저장" 버튼으로 mock API에도 동기화 가능 |
| 날씨 기반 추천 | 습도·풍속·체감온도로 우산/옷차림/강풍 조언 + 조건에 맞는 스타일 아이템 추천 (카드엔 짧은 뱃지, 상세페이지엔 전체 섹션) |
| 현지 시각 표시 | 부모의 공용 시계(1초 `setInterval`)를 props로 내려 각 카드가 `timezone` 오프셋으로 계산 |
| 상세 페이지 | 라우트 파라미터(`:cityId`)로 조회, 체감온도·습도·풍속·풍향·구름량·기압·가시거리·일출일몰까지 표시 |

## 날씨 기반 추천 기능

`src/utils/weatherAdvice.js`가 기온·체감온도·습도·풍속·날씨상태를 받아 순수 함수로 계산합니다.

- ☔ **우산** — 강수 상태거나 습도 80% 이상이면 우산을 권장
- 👕 **옷차림** — 체감온도 5단계(반팔~패딩)로 추천
- 💨 **강풍 주의** — 풍속 8m/s 이상이면 "짧은 치마·큰 우산 주의" 같은 실질적인 팁

계산된 조건 태그(`rain`/`windy`/`hot`/`cold`)는 `src/data/styleItems.js`의 정적 카탈로그를 필터링해 우산·바람막이·선글라스·목도리 같은 구체적인 아이템을 추천합니다. 서버 호출 없이 순수 클라이언트 로직이라 항상 즉시, 안정적으로 동작합니다.

## Mock API (도시 목록 서버 동기화)

`mock-api/`는 [`vue-mock-api-sample`](../skala-vue/vue-mock-api-sample)의 패턴(정규식 경로 매칭, CORS/JSON 공용 헬퍼, 검증)을 그대로 응용한 Node HTTP 서버입니다.

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | 서버 상태와 저장된 도시 수 확인 |
| `GET` | `/api/cities` | 저장된 도시 목록 조회 |
| `POST` | `/api/cities` | `{ cities: [{id, name}, ...] }` — 현재 목록 전체를 저장 |
| `DELETE` | `/api/cities/:id` | 도시 한 건 삭제 |

**이 서버는 필수가 아닙니다.** 검색/추가/삭제/새로고침-유지는 `localStorage`만으로 항상 동작합니다. 서버는 "☁️ 서버에도 저장" 버튼을 눌렀을 때만 쓰이는 부가 기능이라, mock API가 꺼져 있어도 나머지 기능에는 전혀 영향이 없습니다.

기본 포트는 **3011**입니다(다른 skala-vue 계열 mock-api들이 기본 3001을 쓰고 있어 겹치지 않도록 분리했습니다). `API_PORT` 환경변수로 바꿀 수 있습니다.

---

## 시작하기

### 1. 의존성 설치

```sh
npm install
```

> Node.js `^22.18.0 || >=24.12.0` 이 필요합니다.

### 2. 환경 변수 확인

`.env`에 OpenWeatherMap API 키가 이미 채워져 있습니다(강의 공용 키, 요청량 제한 있음). 본인 명의 키를 쓰려면 [openweathermap.org/api](https://openweathermap.org/api)에서 무료로 발급받아 교체하세요.

```dotenv
VITE_OPENWEATHER_API_KEY=발급받은_API_키
VITE_API_BASE_URL=http://localhost:3011/api
```

### 3. 실행

```sh
npm run dev       # Vue 개발 서버만 (mock API 없이도 검색/추가/삭제 전부 동작)
npm run api       # mock API 서버만 (포트 3011)
npm run dev:all    # 둘 다 동시에
```

### 그 밖의 스크립트

```sh
npm run build     # 프로덕션 빌드 (dist/)
npm run preview   # 빌드 결과 미리보기
npm run lint      # oxlint + eslint 실행 (--fix)
npm run format    # src/ 프리티어 포매팅
```

---

## 프로젝트 구조

```
src/
├── App.vue                       # 전역 셸 — 히어로 영역, 배경 오브·그레인, RouterView
├── main.js                       # createApp + Pinia + Router 마운트
├── router/index.js               # 라우트 정의
├── stores/
│   └── weatherStore.js           # 날씨 목록·검색·저장·서버동기화 상태관리 (Pinia)
├── utils/
│   └── weatherAdvice.js          # 우산/옷차림/강풍 추천 순수 함수
├── data/
│   └── styleItems.js             # 조건별 스타일 아이템 카탈로그
├── views/
│   ├── WeatherHomeView.vue       # 대시보드 페이지
│   └── WeatherDetailView.vue     # 도시 상세 + 오늘의 추천 페이지
├── components/
│   ├── exercise/                 # 날씨 대시보드 구성 컴포넌트
│   │   ├── WeatherParent.vue         # 스토어를 소비하는 뷰
│   │   ├── WeatherCard.vue            # 도시 카드 (현지 시각 + 추천 뱃지)
│   │   ├── SearchBar.vue
│   │   └── BaseDashboardCard.vue
│   └── practices/                # 학습 단계별 예제 모음 (basic/composition/component)
└── assets/                        # 전역 CSS

mock-api/
├── server.js                     # HTTP 서버 진입점 (포트 3011)
├── routes/citiesRoutes.js        # GET/POST/DELETE /api/cities
├── data/citiesStore.js           # 메모리 저장소
└── utils/httpUtils.js            # CORS/JSON/바디파싱 공용 헬퍼
```

---

## 권장 개발 환경

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 확장 (Vetur는 비활성화)

브라우저에는 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 설치를 권장합니다.
