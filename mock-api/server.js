import http from 'node:http'

import { getCityCount } from './data/citiesStore.js'
import { handleCitiesRoutes } from './routes/citiesRoutes.js'
import { handleNotesRoutes } from './routes/notesRoutes.js'
import { handleShopRoutes } from './routes/shopRoutes.js'
import { sendError, sendJson, waitForRequestedDelay } from './utils/httpUtils.js'

// Vue 개발 서버(5173)와 겹치지 않고, 다른 skala-vue 계열 프로젝트의 mock-api(기본 3001)와도
// 겹치지 않도록 이 프로젝트만의 포트로 분리했다.
const port = Number(process.env.API_PORT ?? 3011)

const server = http.createServer(async (request, response) => {
  // 브라우저가 교차 출처 요청 전에 보내는 CORS 사전 요청입니다.
  if (request.method === 'OPTIONS') {
    sendJson(response, 204)
    return
  }

  const host = request.headers.host ?? `localhost:${port}`
  const url = new URL(request.url ?? '/', `http://${host}`)

  try {
    // ?delay=1500처럼 전달하면 최대 3초까지 응답을 늦출 수 있습니다.
    await waitForRequestedDelay(url)

    // API 서버의 실행 상태를 확인하는 엔드포인트입니다.
    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { status: 'ok', cityCount: getCityCount() })
      return
    }

    // 각 라우터는 자신이 요청을 처리했으면 true를 반환합니다.
    if (await handleCitiesRoutes(request, response, url)) return
    if (await handleNotesRoutes(request, response, url)) return
    if (await handleShopRoutes(request, response, url)) return

    sendJson(response, 404, { message: '존재하지 않는 API 경로입니다.' })
  } catch (error) {
    sendError(response, error)
  }
})

// 다른 프로젝트의 mock-api가 같은 포트를 이미 쓰고 있을 때 친절한 에러를 남긴다.
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`🔴 포트 ${port}가 이미 사용 중입니다. 다른 프로젝트의 mock-api가 실행 중인지 확인하세요.`)
    console.error(`   (다른 포트를 쓰려면: API_PORT=3012 npm run api)`)
    process.exit(1)
  } else {
    console.error('🔴 mock-api 서버 오류:', error)
  }
})

server.listen(port, () => {
  console.log(`Mock API가 실행되었습니다: http://localhost:${port}/api`)
  console.log(`상태 확인: http://localhost:${port}/api/health`)
})
