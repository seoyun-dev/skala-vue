import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// ⚠️ 체험용 계정 기능 — 브라우저 localStorage에만 저장되고 암호화·서버 인증이 전혀 없다.
// GitHub Pages(정적 호스팅)에는 진짜 로그인 서버를 둘 수 없어서, Element Plus Form 연습 +
// "회원가입/로그인" UX를 체험해 보는 용도로만 만들었다. 실제 서비스에 이 패턴을 쓰면 안 된다.
const USERS_KEY = 'weather-stylist-users'
const SESSION_KEY = 'weather-stylist-session'

function loadUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) ?? null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(loadSession())
  const isLoggedIn = computed(() => currentUser.value !== null)

  function signup({ name, email, password }) {
    const users = loadUsers()
    if (users.some((u) => u.email === email)) {
      throw new Error('이미 가입된 이메일이에요.')
    }
    users.push({ name, email, password })
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    login({ email, password })
  }

  function login({ email, password }) {
    const users = loadUsers()
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('이메일 또는 비밀번호가 올바르지 않아요.')
    currentUser.value = { name: user.name, email: user.email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value))
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  return { currentUser, isLoggedIn, signup, login, logout }
})
