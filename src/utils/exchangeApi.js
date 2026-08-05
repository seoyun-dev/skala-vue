import axios from 'axios'

// open.er-api.com — 무료, 키 불필요, CORS 허용, 약 160개 통화 지원(현재가 필요할 때 사용).
const LATEST_URL = 'https://open.er-api.com/v6/latest'
// Frankfurter — 무료, 키 불필요, ECB 기준 30개 주요 통화의 "일별 히스토리"를 제공(그래프용).
// 마이너 통화(VND/KES/NGN 등)는 없어서, 그런 경우 그래프는 조용히 생략되고 현재가만 보인다.
const HISTORY_URL = 'https://api.frankfurter.dev/v1'

const rateCache = new Map()
const historyCache = new Map()

// currencyCode(예: 'USD') 1단위가 원화(KRW)로 얼마인지 조회. 같은 코드는 세션 내 재사용.
export async function fetchKrwRate(currencyCode) {
  if (!currencyCode || currencyCode === 'KRW') return 1
  if (rateCache.has(currencyCode)) return rateCache.get(currencyCode)

  try {
    const res = await axios.get(`${LATEST_URL}/${currencyCode}`)
    if (res.data?.result !== 'success') throw new Error('exchange rate lookup failed')
    const rate = res.data.rates?.KRW ?? null
    rateCache.set(currencyCode, rate)
    return rate
  } catch (error) {
    console.error('🔴 환율 조회 실패:', error.message)
    return null
  }
}

// 최근 daysAgo일간의 1 {currencyCode} = ? KRW 일별 히스토리. 지원하지 않는 통화면 null.
export async function fetchRateHistory(currencyCode, daysAgo = 21) {
  if (!currencyCode || currencyCode === 'KRW') return null
  if (historyCache.has(currencyCode)) return historyCache.get(currencyCode)

  try {
    const end = new Date()
    const start = new Date(end.getTime() - daysAgo * 86400000)
    const toDateStr = (d) => d.toISOString().slice(0, 10)

    const res = await axios.get(`${HISTORY_URL}/${toDateStr(start)}..${toDateStr(end)}`, {
      params: { from: currencyCode, to: 'KRW' },
    })
    const points = Object.entries(res.data.rates ?? {})
      .map(([date, rates]) => ({ date, rate: rates.KRW }))
      .filter((point) => typeof point.rate === 'number')
      .sort((a, b) => a.date.localeCompare(b.date))

    const result = points.length >= 2 ? points : null
    historyCache.set(currencyCode, result)
    return result
  } catch (error) {
    console.error('🔴 환율 히스토리 조회 실패 (그래프 없이 현재가만 표시됩니다):', error.message)
    historyCache.set(currencyCode, null)
    return null
  }
}
