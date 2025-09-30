<template>
  <v-container class="py-8" v-if="currentQuestion">
    <!-- 問題番号 -->
    <div class="mb-4">
      <h2 class="text-h6">
        {{ currentIndex + 1 }} / {{ questions.length }} 問
      </h2>
    </div>

    <!-- 問題文 -->
    <div class="mb-4">
      <p class="text-subtitle-1 font-weight-medium">
        {{ currentQuestion.question }}
      </p>

      <!-- 複数画像対応 -->
      <div v-if="currentQuestion.image_url" class="my-4">
          <v-img
            v-for="(img, idx) in (currentQuestion.image_url ? currentQuestion.image_url.split(',') : [])"
            :key="idx"
            :src="img.trim().startsWith('/denki/') ? img.trim() : '/denki' + img.trim()"
            class="mb-4"
            max-width="400"
          />
      </div>
    </div>

    <!-- 選択肢 -->
    <div class="mb-6">
      <v-btn
        v-for="choice in currentQuestion.choices"
        :key="choice.index"
        block
        class="mb-2 choice-btn"
        :color="answered ? getChoiceColor(choice.index) : ''"
        :disabled="answered"
        @click="selectAnswer(choice.index)"
      >
        <span class="choice-text">{{ choice.text }}</span>
      </v-btn>
    </div>

    <!-- ソース情報 -->
    <v-card class="pa-4 mb-6" outlined>
      <p><strong>出典:</strong> {{ currentQuestion.source_type }}</p>
      <p v-if="currentQuestion.source_detail">
        <strong>詳細:</strong> {{ currentQuestion.source_detail }}
      </p>
      <p v-if="currentQuestion.source_note">
        <strong>備考:</strong> {{ currentQuestion.source_note }}
      </p>
    </v-card>


    <!-- 解説 -->
    <v-alert
      v-if="showExplanation"
      type="info"
      border="start"
      class="mb-6"
    >
      {{ explanation }}
    </v-alert>

    <!-- 次へボタン -->
    <v-btn
      v-if="answered && currentIndex < questions.length - 1"
      color="primary"
      @click="nextQuestion"
    >
      次の問題へ
    </v-btn>

    <!-- 結果へボタン -->
    <v-btn
      v-if="answered && currentIndex === questions.length - 1"
      color="success"
      @click="goToResult"
    >
      結果を見る
    </v-btn>

    <!-- やめるボタン -->
    <v-btn
      color="error"
      variant="outlined"
      class="mb-6"
      @click="confirmQuit"
    >
      クイズをやめる
    </v-btn>
  </v-container>

  <v-container v-else class="py-8 text-center">
    <p>問題を読み込んでいます...</p>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const questions = ref<any[]>([])
const currentIndex = ref(0)
const answered = ref(false)
const isCorrect = ref<boolean | null>(null)
const explanation = ref('')
const showExplanation = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])

onMounted(async () => {
  const category = route.query.category as string
  const limit = Number(route.query.limit) || 5
  console.log(`カテゴリ:${category} 問題数:${limit}`)
  // IndexedDB からカテゴリの問題を取得
  const allQuestions = await getQuestionsFromDB(category)
  console.log(`全問題取得`,allQuestions)
  // limit件ランダムに選ぶ
  questions.value = shuffle(allQuestions).slice(0, limit)
  console.log(`シャッフル：`,questions)

})

/** IndexedDBからカテゴリの問題と選択肢を取得 */
function getQuestionsFromDB(category: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DenkiQuizDB", 1)

    request.onsuccess = () => {
      const db = request.result

      // まず questions をカテゴリで取得
      const txQ = db.transaction("questions", "readonly")
      const storeQ = txQ.objectStore("questions")
      const index = storeQ.index("by_category")
      const getReq = index.getAll(category)

      getReq.onsuccess = () => {
        console.log(`処理始めます`)
        const questions = getReq.result
        if (!questions.length) return resolve([])

        // 選択肢も取得
        const txC = db.transaction("question_choices", "readonly")
        const storeC = txC.objectStore("question_choices")

        const results: any[] = []
        let pending = questions.length

        questions.forEach(q => {
        console.log(`ｑ：`,q)
          const choiceIndex = storeC.index("by_question_id")
          const choiceReq = choiceIndex.getAll(q.id)
          console.log(`choiceReq：`,choiceReq)

          choiceReq.onsuccess = () => {
            results.push({
              ...q,
              choices: choiceReq.result.map((c: any) => ({
                index: c.choice_index,
                text: c.choice_text
              }))
            })

            pending--
            if (pending === 0) resolve(results)
          }

          choiceReq.onerror = () => {
            pending--
            if (pending === 0) resolve(results)
          }
        })
      }

      getReq.onerror = (err) => reject(err)
    }

    request.onerror = (err) => reject(err)
  })
}

/** 配列をランダムシャッフル */
function shuffle(array: any[]): any[] {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function selectAnswer(choiceIndex: number) {
  if (!currentQuestion.value) return

  // ★ ユーザーの解答を記録
  currentQuestion.value.userAnswer = choiceIndex

  // 判定
  answered.value = true
  isCorrect.value = choiceIndex === currentQuestion.value.answer_index
  explanation.value = currentQuestion.value.explanation
  showExplanation.value = true
}


function getChoiceColor(choiceIndex: number) {
  if (choiceIndex === currentQuestion.value.answer_index) return 'green'
  if (choiceIndex === isCorrect.value && !isCorrect.value) return 'red'
  return ''
}

function nextQuestion() {
  currentIndex.value++
  answered.value = false
  explanation.value = ''
  showExplanation.value = false
}

function goToResult() {
  console.log(`go To resule`,questions.value)
  // 正誤データをまとめる
  
  const result = questions.value.map((q) => ({
    id: q.id,
    question: q.question,
    userAnswer: q.userAnswer ?? null,
    isCorrect: q.userAnswer === q.answer_index,
    userAnswerText: q.choices.find((c:any) => Number(c.index) === Number(q.userAnswer))?.text || '未回答',
    correctAnswerText: q.choices.find((c:any) => Number(c.index) === Number(q.answer_index))?.text || '不明'
  }))

  // 保存して遷移
  console.log("保存前 result:", result)
  sessionStorage.setItem("quiz_result", JSON.stringify(result))
  console.log("保存後:", sessionStorage.getItem("quiz_result"))

  // 遷移
  router.push({
    path: '/result',
    query: {
      total: questions.value.length,
      correct: result.filter(r => r.isCorrect).length
    }
  })
}

const { confirm } = useConfirm()
// 辞めるボタン quiz-setupまで戻る
async function confirmQuit() {
  const yes = await confirm("クイズをやめますか？", "確認")
  if (yes) router.push("/quiz-setup")
}


</script>

<style scoped>
.choice-btn {
  white-space: normal;
  text-align: left;
  justify-content: flex-start;
  padding: 12px;
}

.choice-text {
  display: block;
  word-break: break-word;
}
</style>