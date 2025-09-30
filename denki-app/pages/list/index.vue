<template>
  <v-container>
    <h2 class="mb-4">問題一覧</h2>

    <!-- カテゴリ切り替え -->
    <v-select
      v-model="selectedCategory"
      :items="categoryStore.categories"
      item-title="title"
      item-value="category"
      label="カテゴリを選択"
      class="mb-4"
    />

    <!-- 進捗サマリー -->
    <div class="mb-2 d-flex justify-space-between">
      <span>正解: {{ correctCount }}</span>
      <span>不正解: {{ wrongCount }}</span>
      <span>未回答: {{ notAnsweredCount }}</span>
    </div>

    <!-- 色分け進捗バー -->
    <div class="progress-bar d-flex mb-6">
      <div class="bg-green" :style="{ width: correctRate + '%' }"></div>
      <div class="bg-red"   :style="{ width: wrongRate + '%' }"></div>
      <div class="bg-grey"  :style="{ width: notAnsweredRate + '%' }"></div>
    </div>

    <!-- フィルタボタン -->
    <v-btn-toggle v-model="filter" mandatory class="mb-4">
      <v-btn value="all">すべて</v-btn>
      <v-btn value="not_answered">未回答</v-btn>
      <v-btn value="wrong">不正解</v-btn>
      <v-btn value="correct">正解</v-btn>
    </v-btn-toggle>

    <!-- 問題一覧 -->
    <v-list>
      <v-list-item
        v-for="q in filteredQuestions"
        :key="q.id"
        @click="goToQuestion(q.id)"
      >
        <v-list-item-title>
          {{ q.id }}. {{ q.question?.slice(0, 20) ?? '' }}...
        </v-list-item-title>
        <v-chip v-if="q.status==='correct'" color="green">正解</v-chip>
        <v-chip v-else-if="q.status==='wrong'" color="red">不正解</v-chip>
        <v-chip v-else color="grey">未回答</v-chip>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoryStore } from '~/stores/categoryStore'

type QuestionStatus = 'correct' | 'wrong' | 'not_answered'
type Question = { id: number; category: string; question: string; status?: QuestionStatus }

const router = useRouter()
const categoryStore = useCategoryStore()
const { $db } = useNuxtApp()   // ← db.client.ts の provide を利用

const selectedCategory = ref<string | null>(null)
const questions = ref<Question[]>([])
const filter = ref<'all' | QuestionStatus>('all')

// IndexedDB からカテゴリ別に取得
async function loadQuestions(category: string) {
  questions.value = await $db.getQuestionsByCategory(category)
}

// カテゴリが変わったらロード
watchEffect(() => {
  if (selectedCategory.value) {
    loadQuestions(selectedCategory.value)
  }
})

// 集計
const correctCount = computed(() => questions.value.filter(q => q.status === 'correct').length)
const wrongCount   = computed(() => questions.value.filter(q => q.status === 'wrong').length)
const notAnsweredCount = computed(() => questions.value.filter(q => !q.status || q.status === 'not_answered').length)
const total = computed(() => questions.value.length)

const correctRate = computed(() => total.value ? (correctCount.value / total.value) * 100 : 0)
const wrongRate   = computed(() => total.value ? (wrongCount.value   / total.value) * 100 : 0)
const notAnsweredRate = computed(() => total.value ? (notAnsweredCount.value / total.value) * 100 : 0)

// フィルタ
const filteredQuestions = computed(() => {
  if (filter.value === 'all') return questions.value
  return questions.value.filter(q => (q.status ?? 'not_answered') === filter.value)
})

// 詳細へ
function goToQuestion(id: number) {
  router.push(`/quiz/${selectedCategory.value}/${id}`)
}
</script>

<style scoped>
.progress-bar {
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
}
.progress-bar > div {
  height: 100%;
}
</style>
