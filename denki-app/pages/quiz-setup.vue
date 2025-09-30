<template>
  <v-container class="py-8">
    <h2 class="text-h5 mb-6">クイズの設定</h2>

    <!-- カテゴリ一覧 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <v-card
        v-for="cat in categories"
        :key="cat.category"
        class="cursor-pointer"
        :color="selectedCategory === cat.value ? 'primary' : ''"
      >
        <v-card-text class="text-center">
          <div class="text-h6 mb-2">{{ cat.title }}</div>
          <div>
            <span v-if="cat.status === 'not_downloaded'" class="text-red">(未ダウンロード)</span>
            <span v-else-if="cat.status === 'outdated'" class="text-orange">(更新必要)</span>
            <span v-else class="text-green">(最新)</span>
          </div>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn
            size="small"
            color="secondary"
            @click.stop="downloadCategory(cat.category)"
          >
            ダウンロード
          </v-btn>
          <v-btn
            size="small"
            color="primary"
            @click.stop="selectCategory(cat.category)"
          >
            このカテゴリで開始
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>


    <!-- 出題数選択 -->
    <div class="mb-6">
      <h3 class="text-subtitle-1 mb-4">出題数</h3>
      <div class="flex flex-wrap gap-3">
        <v-btn
          v-for="num in limits"
          :key="num"
          :variant="selectedLimit === num ? 'elevated' : 'outlined'"
          :class="{
            'opacity-100': num === 5 || isPremium,
            'opacity-50': num !== 5 && !isPremium
          }"
          @click="handleLimitClick(num)"
        >
          {{ num }}問
        </v-btn>
      </div>
    </div>

    <!-- スタートボタン -->
    <v-btn
      color="primary"
      :disabled="!selectedCategory"
      @click="startQuiz"
    >
      クイズを開始する
    </v-btn>

    <!-- 戻る -->
    <v-btn variant="outlined" class="ml-4" @click="goBack">
      戻る
    </v-btn>

    <div>
        <div v-for="cat in categories" :key="cat.category">
        <p>
            {{ cat.title }} - {{ cat.status }}
            <span v-if="cat.status === 'not_downloaded'">(未ダウンロード)</span>
            <span v-else-if="cat.status === 'outdated'">(更新必要)</span>
            <span v-else>(最新)</span>
        </p>
        </div>
    </div>

    <!-- ポップアップ（有料機能） -->
    <v-dialog v-model="showDialog" max-width="400">
      <v-card>
        <v-card-title>有料ユーザー限定</v-card-title>
        <v-card-text>
          この機能は有料ユーザー限定です。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDialog = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ポップアップ（エラー: 未取得カテゴリ） -->
    <v-dialog v-model="showErrorDialog" max-width="400">
      <v-card>
        <v-card-title>利用できません</v-card-title>
        <v-card-text>
          このカテゴリはまだダウンロードされていません。<br />
          一度オンラインで取得してください。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showErrorDialog = false">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useCategoryStore } from '~/stores/categoryStore'
import { useLoader } from '~/composables/useLoader'
const { start, finish } = useLoader()

const categoryStore = useCategoryStore()
// カテゴリ一覧
const categories = computed(() => categoryStore.categories)

const router = useRouter()


// 出題数: 5〜50問まで5刻み
const limits = Array.from({ length: 10 }, (_, i) => (i + 1) * 5)

const isPremium = false // TODO: ユーザーデータから判定
const selectedCategory = ref<string | null>(null)
const selectedLimit = ref<number>(5)

const showDialog = ref(false)
const showErrorDialog = ref(false)


// confirmModal
const { confirm } = useConfirm()

async function selectCategory(value: string) {
  selectedCategory.value = value
  const cat = categoryStore.getCategoryByKey(value)
  const yesno = await confirm(`${cat.title} Quizを始めますか？`, '確認')
  if(yesno){startQuiz()}
}


function handleLimitClick(num: number) {
  if (isPremium || num === 5) {
    selectedLimit.value = num
  } else {
    showDialog.value = true
  }
}

/** クイズ開始時 */
async function startQuiz() {
  if (!selectedCategory.value) return

  const ok = await checkAndDownloadCategory(selectedCategory.value)

  if (!ok) {
    showErrorDialog.value = true
    return
  }

  router.push({
    path: '/quiz',
    query: {
      category: selectedCategory.value,
      limit: selectedLimit.value
    }
  })
}

/** IndexedDBでバージョン確認 & 必要ならダウンロード */
async function checkAndDownloadCategory(category: string): Promise<boolean> {
  const config = useRuntimeConfig()

  try {
    const res = await $fetch<{
      category: string
      version: string
      questions: any[]
    }>(`/questions?category=${category}&limit=500`, {
      baseURL: config.public.apiBase
    })

    // サーバーが「304 Not Modified」を返す場合があるのでチェック
    if (!res || !res.questions) {
      console.warn("サーバーから新しい問題データは返りませんでした")
      return await hasCategoryData(category) // ローカルにあるか確認して進む
    }

    await saveCategoryToDB(res)
    return true
  } catch (err: any) {
    console.error("サーバー通信失敗:", err)

    // オフライン対応：ローカルデータがあれば進む
    const hasData = await hasCategoryData(category)
    if (hasData) {
      console.warn("オフラインでローカルデータを使用します")
      return true
    }

    // ローカルにもデータが無ければ進めない
    return false
  }
}

/** 手動でダウンロード */
async function downloadCategory(category: string) {
  try {
    start()
    const ok = await checkAndDownloadCategory(category)
    if (ok) {
      console.log(`${category} ダウンロード成功`)
      // TODO: categoryStore のステータス更新
    } else {
      console.warn(`${category} のダウンロードに失敗しました`)
    }
  } finally {
    finish()
  }
}


/** IndexedDBにカテゴリデータを保存 */
function saveCategoryToDB(data: { category: string; version: string; questions: any[] }) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("DenkiQuizDB", 1)

    request.onsuccess = () => {
      const db = request.result

      // version確認
      const txV = db.transaction("category_versions", "readonly")
      const storeV = txV.objectStore("category_versions")
      const getReq = storeV.get(data.category)

      getReq.onsuccess = () => {
        const local = getReq.result
        const needsUpdate = !local || local.version < data.version

        if (needsUpdate) {
          const txQ = db.transaction("questions", "readwrite")
          const storeQ = txQ.objectStore("questions")
          const txC = db.transaction("question_choices", "readwrite")
          const storeC = txC.objectStore("question_choices")

          for (const q of data.questions) {
            storeQ.put({
              id: q.id,
              question: q.question,
              answer_index: q.answer_index,
              explanation: q.explanation,
              category: q.category,
              image_url: q.image_url,
              source_type: q.source_type,
              source_detail: q.source_detail,
              source_node: q.source_note
            })

            q.choices.forEach((c: any) => {
              storeC.put({
                id: `${q.id}_${c.index}`,
                question_id: q.id,
                choice_index: c.index,
                choice_text: c.text,
                image_url: c.image_url
              })
            })
          }

          // version更新
          const txV2 = db.transaction("category_versions", "readwrite")
          const storeV2 = txV2.objectStore("category_versions")
          storeV2.put({
            category: data.category,
            version: data.version,
            updated_at: new Date()
          })
        }
        resolve()
      }
    }

    request.onerror = (err) => reject(err)
  })
}

/** IndexedDBにカテゴリデータがあるか確認 */
function hasCategoryData(category: string): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open("DenkiQuizDB", 1)

    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("category_versions", "readonly")
      const store = tx.objectStore("category_versions")
      const getReq = store.get(category)

      getReq.onsuccess = () => {
        resolve(!!getReq.result)
      }
      getReq.onerror = () => resolve(false)
    }

    request.onerror = () => resolve(false)
  })
}

function goBack() {
  router.push('/')
}

</script>
