<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>電気工事士クイズ</v-toolbar-title>
    </v-app-bar>
    <v-btn @click="getQuestion">テスト</v-btn>

    <v-main>
      <v-container class="py-10">
        <h1 class="text-h5 mb-6">
          問題 {{ currentIndex + 1 }} / {{ questions.length }}
        </h1>

        <!-- 問題文 -->
        <p v-if="currentQuestion" class="text-h6 mb-6">
          {{ currentQuestion.question }}
        </p>

        <!-- 画像がある場合 -->
        <div v-if="currentQuestion?.image_url" class="mb-6">
          <v-img :src="currentQuestion.image_url" max-width="400" class="mx-auto" />
        </div>

        <!-- 選択肢 -->
        <v-row v-if="currentQuestion">
          <v-col
            cols="12"
            md="6"
            v-for="choice in currentQuestion.choices"
            :key="choice.index"
          >
            <v-btn
              block
              color="secondary"
              variant="outlined"
              @click="selectAnswer(choice.index)"
            >
              {{ choice.text }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- 解説表示 -->
        <v-alert
          v-if="showExplanation"
          :type="isCorrect ? 'success' : 'error'"
          class="mt-6"
        >
          <div>
            <p>{{ isCorrect ? '正解！' : '不正解…' }}</p>
            <p>{{ explanation }}</p>
          </div>
        </v-alert>

        <!-- 次へボタン -->
        <div class="mt-8 text-center" v-if="showExplanation">
          <v-btn
            color="primary"
            @click="nextQuestion"
            v-if="currentIndex < questions.length - 1"
          >
            次の問題へ
          </v-btn>
          <v-btn color="success" v-else>
            結果を見る
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Choice {
  index: number
  text: string
}

interface Question {
  id: number
  question: string
  choices: Choice[]
  explanation: string
  answer_index: number
  category: string
  image_url?: string
}

const questions = ref<Question[]>([])
const currentIndex = ref(0)
const showExplanation = ref(false)
const isCorrect = ref(false)
const explanation = ref('')

// 現在の問題
const currentQuestion = computed(() => questions.value[currentIndex.value])

const config = useRuntimeConfig()

// 初期ロードで問題取得
onMounted(async () => {
  const res = await $fetch<Question[]>(`${config.public.apiBase}/questions?limit=5`)
  questions.value = res
})

async function getQuestion(){
    const res = await $fetch<Question[]>(`${config.public.apiBase}/questions?limit=5`)
    console.log('res')
    console.log(res)
}

// 回答処理
async function selectAnswer(choiceIndex: number) {
  if (!currentQuestion.value) return

  const res = await $fetch<{ correct: boolean; explanation: string }>(
    `${config.public.apiBase}/answers`,
    {
      method: 'POST',
      body: {
        user_id: 1, // TODO: 本当はログインユーザーから取得
        question_id: currentQuestion.value.id,
        choice_index: choiceIndex
      }
    }
  )

  isCorrect.value = res.correct
  explanation.value = res.explanation
  showExplanation.value = true
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
    showExplanation.value = false
    explanation.value = ''
  }
}
</script>
