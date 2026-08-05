<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')

const loginForm = reactive({ email: '', password: '' })
const signupForm = reactive({ name: '', email: '', password: '', passwordConfirm: '' })
// el-form 인스턴스를 담아 validate()를 직접 호출하는 데 쓴다 (템플릿의 ref="loginFormRef" 등과 연결됨)
const loginFormRef = ref(null)
const signupFormRef = ref(null)

const loginRules = {
  email: [
    { required: true, message: '이메일을 입력해 주세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아니에요', trigger: 'blur' },
  ],
  password: [{ required: true, message: '비밀번호를 입력해 주세요', trigger: 'blur' }],
}
const signupRules = {
  name: [{ required: true, message: '이름을 입력해 주세요', trigger: 'blur' }],
  email: [
    { required: true, message: '이메일을 입력해 주세요', trigger: 'blur' },
    { type: 'email', message: '올바른 이메일 형식이 아니에요', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '비밀번호를 입력해 주세요', trigger: 'blur' },
    { min: 4, message: '4자 이상 입력해 주세요', trigger: 'blur' },
  ],
  passwordConfirm: [
    { required: true, message: '비밀번호를 다시 입력해 주세요', trigger: 'blur' },
    // el-form의 기본 규칙만으로는 "다른 필드 값과 같은지"를 검사할 수 없어 커스텀 validator를 쓴다.
    // 콜백 방식(callback)이 Element Plus Form의 validator 규격이라, Promise가 아니라 이렇게 써야 한다.
    {
      validator: (rule, value, callback) => {
        if (value !== signupForm.password) callback(new Error('비밀번호가 일치하지 않아요'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

// authStore.login/signup은 네트워크 요청이 아니라 localStorage를 즉시 읽고 쓰는 동기 함수라서
// async/await 없이 try/catch만으로 충분하다. 실패하면 Error를 던지므로 그대로 잡아서 보여준다.
function submitLogin() {
  loginFormRef.value.validate((valid) => {
    if (!valid) return
    try {
      authStore.login(loginForm)
      ElMessage.success(`${authStore.currentUser.name}님, 환영해요!`)
      router.push('/')
    } catch (error) {
      ElMessage.error(error.message)
    }
  })
}

function submitSignup() {
  signupFormRef.value.validate((valid) => {
    if (!valid) return
    try {
      authStore.signup(signupForm)
      ElMessage.success(`${signupForm.name}님, 가입을 환영해요!`)
      router.push('/')
    } catch (error) {
      ElMessage.error(error.message)
    }
  })
}
</script>

<template>
  <div class="detail-container">
    <div class="section-head">
      <h3>{{ mode === 'login' ? '로그인' : '회원가입' }}</h3>
      <span class="count-chip">DEMO</span>
    </div>

    <div class="auth-card">
      <p class="auth-disclaimer">
        ⚠️ 체험용 계정 기능이에요. 브라우저에만 저장되고 실제 암호화·서버 인증은 없어요.
      </p>

      <el-tabs v-model="mode" stretch>
        <el-tab-pane label="로그인" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-position="top">
            <el-form-item label="이메일" prop="email">
              <el-input v-model="loginForm.email" placeholder="you@example.com" />
            </el-form-item>
            <el-form-item label="비밀번호" prop="password">
              <el-input v-model="loginForm.password" type="password" show-password @keyup.enter="submitLogin" />
            </el-form-item>
            <el-button type="primary" class="auth-submit" @click="submitLogin">로그인</el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="회원가입" name="signup">
          <el-form ref="signupFormRef" :model="signupForm" :rules="signupRules" label-position="top">
            <el-form-item label="이름" prop="name">
              <el-input v-model="signupForm.name" placeholder="홍길동" />
            </el-form-item>
            <el-form-item label="이메일" prop="email">
              <el-input v-model="signupForm.email" placeholder="you@example.com" />
            </el-form-item>
            <el-form-item label="비밀번호" prop="password">
              <el-input v-model="signupForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="비밀번호 확인" prop="passwordConfirm">
              <el-input v-model="signupForm.passwordConfirm" type="password" show-password @keyup.enter="submitSignup" />
            </el-form-item>
            <el-button type="primary" class="auth-submit" @click="submitSignup">회원가입</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
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

.auth-card {
  max-width: 380px;
  margin: 0 auto 20px;
  padding: 24px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.auth-disclaimer {
  margin: 0 0 18px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--sky-ink-dim);
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
}
.auth-submit {
  width: 100%;
  margin-top: 4px;
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
