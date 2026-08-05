<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { notesApi } from '@/utils/notesApi'

const props = defineProps({
  cityId: { type: Number, required: true },
  cityName: { type: String, required: true },
})

const MOODS = [
  { value: 'sunny', icon: '☀️', label: '맑음' },
  { value: 'good', icon: '🙂', label: '좋음' },
  { value: 'ok', icon: '😐', label: '보통' },
  { value: 'bad', icon: '😣', label: '나쁨' },
  { value: 'terrible', icon: '🥶', label: '최악' },
]

const notes = ref([])
const isLoading = ref(false)
const hasError = ref(false)

// 폼 하나로 작성/수정을 둘 다 처리한다. editingId가 있으면 "수정 모드"로 간주한다.
const content = ref('')
const mood = ref('ok')
const editingId = ref(null)
const isSaving = ref(false)

// 서버에 저장된 mood 문자열만으로는 아이콘/라벨을 모르니, 값으로 다시 찾아온다.
// 못 찾을 경우(오래된 데이터 등)엔 '보통'을 기본값으로 보여준다.
function moodInfo(value) {
  return MOODS.find((item) => item.value === value) ?? MOODS[2]
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function loadNotes() {
  isLoading.value = true
  hasError.value = false
  try {
    notes.value = await notesApi.list(props.cityId)
  } catch (error) {
    console.error('🔴 날씨 메모 조회 실패:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editingId.value = null
  content.value = ''
  mood.value = 'ok'
}

// 목록의 "수정" 버튼을 누르면 그 메모 내용을 폼에 채워 넣어, 같은 폼으로 수정할 수 있게 한다.
function startEdit(note) {
  editingId.value = note.id
  content.value = note.content
  mood.value = note.mood
}

// editingId 유무로 생성/수정 API 중 무엇을 호출할지 분기한다.
// 성공하면 로컬 상태를 직접 고치지 않고 loadNotes()로 목록을 다시 받아온다 —
// 메모 개수가 많지 않은 기능이라 서버가 내려준 최신 정렬/타임스탬프를 그대로 신뢰하는 쪽이 더 안전하다.
async function submitNote() {
  if (!content.value.trim()) {
    ElMessage.warning('메모 내용을 입력해 주세요.')
    return
  }

  isSaving.value = true
  try {
    if (editingId.value) {
      await notesApi.update(editingId.value, { content: content.value, mood: mood.value })
      ElMessage.success('메모를 수정했어요.')
    } else {
      await notesApi.create({
        cityId: props.cityId,
        cityName: props.cityName,
        content: content.value,
        mood: mood.value,
      })
      ElMessage.success('메모를 남겼어요.')
    }
    resetForm()
    await loadNotes()
  } catch (error) {
    ElMessage.error(error.message ?? '메모 저장에 실패했어요.')
  } finally {
    isSaving.value = false
  }
}

async function removeNote(note) {
  try {
    await notesApi.remove(note.id)
    // 지금 수정 중이던 메모가 삭제된 경우, 폼이 존재하지 않는 id를 계속 들고 있지 않도록 초기화한다.
    if (editingId.value === note.id) resetForm()
    ElMessage.info('메모를 삭제했어요.')
    await loadNotes()
  } catch (error) {
    ElMessage.error(error.message ?? '메모 삭제에 실패했어요.')
  }
}

// 상세페이지를 벗어나지 않고 다른 도시로 이동하는 경우(라우트 재사용)를 대비해
// cityId가 바뀌면 폼을 비우고 그 도시의 메모를 새로 불러온다.
watch(() => props.cityId, () => {
  resetForm()
  loadNotes()
})

onMounted(loadNotes)
</script>

<template>
  <div class="notes-block">
    <div class="notes-head">
      <h4>📝 {{ cityName }} 날씨 메모</h4>
      <span class="notes-count">{{ notes.length }}개</span>
    </div>

    <div class="notes-form">
      <div class="mood-picker">
        <button
          v-for="item in MOODS"
          :key="item.value"
          type="button"
          class="mood-btn"
          :class="{ active: mood === item.value }"
          :title="item.label"
          @click="mood = item.value"
        >
          {{ item.icon }}
        </button>
      </div>

      <el-input
        v-model="content"
        type="textarea"
        :rows="2"
        maxlength="200"
        show-word-limit
        placeholder="오늘 이 도시의 날씨는 어땠나요?"
      />

      <div class="notes-form-actions">
        <button v-if="editingId" class="notes-cancel" type="button" @click="resetForm">취소</button>
        <el-button type="primary" :loading="isSaving" @click="submitNote">
          {{ editingId ? '수정 완료' : '메모 남기기' }}
        </el-button>
      </div>
    </div>

    <div v-if="isLoading" class="notes-status">불러오는 중...</div>
    <div v-else-if="hasError" class="notes-status">메모를 가져오지 못했어요.</div>
    <div v-else-if="notes.length === 0" class="notes-status">아직 남긴 메모가 없어요.</div>

    <ul v-else class="notes-list">
      <li v-for="note in notes" :key="note.id" class="note-row">
        <span class="note-mood" :title="moodInfo(note.mood).label">{{ moodInfo(note.mood).icon }}</span>
        <div class="note-body">
          <p class="note-content">{{ note.content }}</p>
          <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
        </div>
        <div class="note-actions">
          <button class="note-edit" type="button" @click="startEdit(note)">수정</button>
          <el-popconfirm title="이 메모를 삭제할까요?" confirm-button-text="삭제" cancel-button-text="취소" @confirm="removeNote(note)">
            <template #reference>
              <button class="note-delete" type="button">삭제</button>
            </template>
          </el-popconfirm>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.notes-block {
  margin-top: 22px;
  padding: 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}
.notes-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.notes-head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--sky-ink);
}
.notes-count {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--sky-accent);
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
}

.notes-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.mood-picker {
  display: flex;
  gap: 6px;
}
.mood-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s var(--sky-ease);
}
.mood-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.mood-btn.active {
  background: linear-gradient(120deg, var(--sky-accent), var(--sky-accent-deep));
  border-color: transparent;
}

.notes-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.notes-cancel {
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: var(--sky-ink-dim);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}
.notes-cancel:hover {
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.1);
}

.notes-status {
  padding: 10px 0;
  text-align: center;
  font-size: 13px;
  color: var(--sky-ink-dim);
}

.notes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.note-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.note-mood {
  flex: none;
  font-size: 16px;
}
.note-body {
  flex: 1;
  min-width: 0;
}
.note-content {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--sky-ink);
  word-break: break-word;
}
.note-date {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: var(--sky-ink-dim);
}
.note-actions {
  flex: none;
  display: flex;
  gap: 6px;
}
.note-edit,
.note-delete {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--sky-ink-dim);
  transition: all 0.3s var(--sky-ease);
}
.note-edit:hover {
  color: var(--sky-ink);
  background: rgba(255, 255, 255, 0.1);
}
.note-delete:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.3);
}
</style>
