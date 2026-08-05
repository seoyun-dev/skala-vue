// 국가 정보 패널용 정적 데이터셋.
// (REST Countries v3.1은 서비스 종료됐고 후속 v5는 API 키가 필요해져서, 대신 이 프로젝트가
// 직접 들고 다니는 오프라인 데이터로 대체했다 — 키 발급도 필요 없고 GitHub Pages에서도 항상 동작한다)
// languages의 키는 countryPhrasebook.js의 키와 맞추고, currencyCode(ISO 4217)는
// exchangeApi.js가 실시간 환율을 조회할 때 쓴다.
export const COUNTRY_INFO = {
  US: { name: '미국', capital: '워싱턴 D.C.', population: 335000000, region: '북아메리카', currencies: ['미국 달러 ($)'], currencyCode: 'USD', languages: { eng: 'English' } },
  KR: { name: '대한민국', capital: '서울', population: 51700000, region: '동아시아', currencies: ['대한민국 원 (₩)'], currencyCode: 'KRW', languages: { kor: 'Korean' } },
  NZ: { name: '뉴질랜드', capital: '웰링턴', population: 5200000, region: '오세아니아', currencies: ['뉴질랜드 달러 ($)'], currencyCode: 'NZD', languages: { eng: 'English', mri: 'Māori' } },
  GB: { name: '영국', capital: '런던', population: 67500000, region: '서유럽', currencies: ['영국 파운드 (£)'], currencyCode: 'GBP', languages: { eng: 'English' } },
  CA: { name: '캐나다', capital: '오타와', population: 38900000, region: '북아메리카', currencies: ['캐나다 달러 ($)'], currencyCode: 'CAD', languages: { eng: 'English', fra: 'French' } },
  AU: { name: '호주', capital: '캔버라', population: 26600000, region: '오세아니아', currencies: ['호주 달러 ($)'], currencyCode: 'AUD', languages: { eng: 'English' } },
  JP: { name: '일본', capital: '도쿄', population: 123000000, region: '동아시아', currencies: ['일본 엔 (¥)'], currencyCode: 'JPY', languages: { jpn: 'Japanese' } },
  CN: { name: '중국', capital: '베이징', population: 1410000000, region: '동아시아', currencies: ['중국 위안 (¥)'], currencyCode: 'CNY', languages: { zho: 'Chinese' } },
  FR: { name: '프랑스', capital: '파리', population: 68000000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { fra: 'French' } },
  DE: { name: '독일', capital: '베를린', population: 84500000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { deu: 'German' } },
  ES: { name: '스페인', capital: '마드리드', population: 47500000, region: '남유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { spa: 'Spanish' } },
  IT: { name: '이탈리아', capital: '로마', population: 58900000, region: '남유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { ita: 'Italian' } },
  PT: { name: '포르투갈', capital: '리스본', population: 10300000, region: '남유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { por: 'Portuguese' } },
  BR: { name: '브라질', capital: '브라질리아', population: 216000000, region: '남아메리카', currencies: ['브라질 헤알 (R$)'], currencyCode: 'BRL', languages: { por: 'Portuguese' } },
  RU: { name: '러시아', capital: '모스크바', population: 144000000, region: '동유럽', currencies: ['러시아 루블 (₽)'], currencyCode: 'RUB', languages: { rus: 'Russian' } },
  EG: { name: '이집트', capital: '카이로', population: 112000000, region: '북아프리카', currencies: ['이집트 파운드 (£)'], currencyCode: 'EGP', languages: { ara: 'Arabic' } },
  SA: { name: '사우디아라비아', capital: '리야드', population: 36000000, region: '서아시아', currencies: ['사우디 리얄 (﷼)'], currencyCode: 'SAR', languages: { ara: 'Arabic' } },
  AE: { name: '아랍에미리트', capital: '아부다비', population: 9900000, region: '서아시아', currencies: ['UAE 디르함'], currencyCode: 'AED', languages: { ara: 'Arabic' } },
  IN: { name: '인도', capital: '뉴델리', population: 1428000000, region: '남아시아', currencies: ['인도 루피 (₹)'], currencyCode: 'INR', languages: { hin: 'Hindi', eng: 'English' } },
  VN: { name: '베트남', capital: '하노이', population: 98000000, region: '동남아시아', currencies: ['베트남 동 (₫)'], currencyCode: 'VND', languages: { vie: 'Vietnamese' } },
  TH: { name: '태국', capital: '방콕', population: 71800000, region: '동남아시아', currencies: ['태국 바트 (฿)'], currencyCode: 'THB', languages: { tha: 'Thai' } },
  ID: { name: '인도네시아', capital: '자카르타', population: 277500000, region: '동남아시아', currencies: ['인도네시아 루피아 (Rp)'], currencyCode: 'IDR', languages: { ind: 'Indonesian' } },
  NL: { name: '네덜란드', capital: '암스테르담', population: 17800000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { nld: 'Dutch' } },
  SE: { name: '스웨덴', capital: '스톡홀름', population: 10500000, region: '북유럽', currencies: ['스웨덴 크로나 (kr)'], currencyCode: 'SEK', languages: { swe: 'Swedish' } },
  MX: { name: '멕시코', capital: '멕시코시티', population: 128900000, region: '북아메리카', currencies: ['멕시코 페소 ($)'], currencyCode: 'MXN', languages: { spa: 'Spanish' } },
  AR: { name: '아르헨티나', capital: '부에노스아이레스', population: 46000000, region: '남아메리카', currencies: ['아르헨티나 페소 ($)'], currencyCode: 'ARS', languages: { spa: 'Spanish' } },
  TR: { name: '튀르키예', capital: '앙카라', population: 85300000, region: '서아시아', currencies: ['튀르키예 리라 (₺)'], currencyCode: 'TRY', languages: {} },
  PL: { name: '폴란드', capital: '바르샤바', population: 37700000, region: '동유럽', currencies: ['폴란드 즈워티 (zł)'], currencyCode: 'PLN', languages: {} },
  CH: { name: '스위스', capital: '베른', population: 8800000, region: '서유럽', currencies: ['스위스 프랑 (CHF)'], currencyCode: 'CHF', languages: { deu: 'German', fra: 'French', ita: 'Italian' } },
  BE: { name: '벨기에', capital: '브뤼셀', population: 11700000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { nld: 'Dutch', fra: 'French', deu: 'German' } },
  AT: { name: '오스트리아', capital: '빈', population: 9100000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { deu: 'German' } },
  IE: { name: '아일랜드', capital: '더블린', population: 5100000, region: '서유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: { eng: 'English' } },
  NO: { name: '노르웨이', capital: '오슬로', population: 5500000, region: '북유럽', currencies: ['노르웨이 크로네 (kr)'], currencyCode: 'NOK', languages: {} },
  DK: { name: '덴마크', capital: '코펜하겐', population: 5900000, region: '북유럽', currencies: ['덴마크 크로네 (kr)'], currencyCode: 'DKK', languages: {} },
  FI: { name: '핀란드', capital: '헬싱키', population: 5600000, region: '북유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: {} },
  ZA: { name: '남아프리카공화국', capital: '프리토리아', population: 60400000, region: '남아프리카', currencies: ['남아공 랜드 (R)'], currencyCode: 'ZAR', languages: { eng: 'English' } },
  SG: { name: '싱가포르', capital: '싱가포르', population: 5900000, region: '동남아시아', currencies: ['싱가포르 달러 ($)'], currencyCode: 'SGD', languages: { eng: 'English', zho: 'Chinese' } },
  MY: { name: '말레이시아', capital: '쿠알라룸푸르', population: 33900000, region: '동남아시아', currencies: ['말레이시아 링깃 (RM)'], currencyCode: 'MYR', languages: { eng: 'English' } },
  PH: { name: '필리핀', capital: '마닐라', population: 117300000, region: '동남아시아', currencies: ['필리핀 페소 (₱)'], currencyCode: 'PHP', languages: { eng: 'English' } },
  GR: { name: '그리스', capital: '아테네', population: 10400000, region: '남유럽', currencies: ['유로 (€)'], currencyCode: 'EUR', languages: {} },
  IL: { name: '이스라엘', capital: '예루살렘', population: 9400000, region: '서아시아', currencies: ['이스라엘 셰켈 (₪)'], currencyCode: 'ILS', languages: { ara: 'Arabic' } },
  UA: { name: '우크라이나', capital: '키이우', population: 36700000, region: '동유럽', currencies: ['우크라이나 흐리브냐 (₴)'], currencyCode: 'UAH', languages: {} },
  CZ: { name: '체코', capital: '프라하', population: 10500000, region: '중부유럽', currencies: ['체코 코루나 (Kč)'], currencyCode: 'CZK', languages: {} },
  HU: { name: '헝가리', capital: '부다페스트', population: 9600000, region: '중부유럽', currencies: ['헝가리 포린트 (Ft)'], currencyCode: 'HUF', languages: {} },
  RO: { name: '루마니아', capital: '부쿠레슈티', population: 19000000, region: '동유럽', currencies: ['루마니아 레우 (lei)'], currencyCode: 'RON', languages: {} },
  KE: { name: '케냐', capital: '나이로비', population: 55100000, region: '동아프리카', currencies: ['케냐 실링'], currencyCode: 'KES', languages: { eng: 'English' } },
  NG: { name: '나이지리아', capital: '아부자', population: 223800000, region: '서아프리카', currencies: ['나이지리아 나이라 (₦)'], currencyCode: 'NGN', languages: { eng: 'English' } },
}

export function getCountryInfo(alpha2Code) {
  if (!alpha2Code) return null
  const entry = COUNTRY_INFO[alpha2Code]
  if (!entry) return null
  return {
    code: alpha2Code,
    flagUrl: `https://flagcdn.com/w80/${alpha2Code.toLowerCase()}.png`,
    ...entry,
  }
}
