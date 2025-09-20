<template>
  <v-container class="py-8">
    <!-- スコア表示 -->
    <div class="text-center mb-8">
      <h2 class="text-h5 mb-2">結果発表</h2>
      <p class="text-subtitle-1">
        {{ correctCount }} / {{ total }} 問正解
      </p>
    </div>
    
    <!-- 各問題の正誤一覧 -->
    <v-list two-line>
      <v-list-item
        v-for="(q, index) in resultData"
        :key="q.id"
      >
        <template #prepend>
          <v-icon :color="q.isCorrect ? 'green' : 'red'">
            {{ q.isCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>

        <v-list-item-title>
          Q{{ index + 1 }}: {{ q.question }}
        </v-list-item-title>
        <v-list-item-subtitle>
          あなたの解答: {{ q.userAnswerText }} /
          正解: {{ q.correctAnswerText }}
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>

    <!-- ボタン -->
    <div class="text-center mt-8">
      <v-btn color="primary" class="mr-4" @click="retryQuiz">
        もう一度挑戦
      </v-btn>
      <v-btn variant="outlined" @click="goToSetup">
        カテゴリ選択に戻る
      </v-btn>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const total = Number(route.query.total) || 0
const correctCount = Number(route.query.correct) || 0

// 問題ごとの詳細データ（quizページから渡してくる想定）
const resultData = ref<any[]>([])

onMounted(() => {
  // quizページから localStorage/sessionStorage 経由で受け取る
  const stored = sessionStorage.getItem("quiz_result")
  console.log('stored',stored)
  if (stored) {
    resultData.value = JSON.parse(stored)
    console.log('resultData.value',resultData.value)
  }
})

function retryQuiz() {
  router.back() // 前のクイズ画面に戻る
}

function goToSetup() {
  router.push('/quiz-setup')
}
</script>
