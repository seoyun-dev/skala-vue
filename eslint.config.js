import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  // vue-*-sample* 폴더들은 이 프로젝트(weather-stylist)와 별개인, 자체 package.json을 가진
  // 독립된 실습/참고용 프로젝트라서 lint 대상에서 제외한다.
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/vue-*-sample*/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // ✨ 추가: mock-api 서버 스크립트와 dev-all 실행 스크립트는 브라우저가 아닌 Node.js 런타임에서
  // 도는 코드라서 process/Buffer 같은 Node 전역 변수를 별도로 인식시켜 준다.
  {
    files: ['mock-api/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
])
