// plugins/startup-check.client.ts
import { useCategoryStore } from '~/stores/categoryStore'

export default defineNuxtPlugin(async () => {
  if (!process.client) return
  const config = useRuntimeConfig()
  const categoryStore = useCategoryStore()

  try {
    // ① サーバーからカテゴリ一覧を取得
    const categories = await $fetch<{category:string, title:string, version:string}[]>('/categories', {
      baseURL: config.public.apiBase
    })

    // ② IndexedDB と比較して status を付ける
    const request = indexedDB.open("DenkiQuizDB", 1)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("category_versions", "readonly")
      const store = tx.objectStore("category_versions")

      const results: any[] = []
      let pending = categories.length

      categories.forEach(cat => {
        const getReq = store.get(cat.category)
        getReq.onsuccess = () => {
          const local = getReq.result
          let status: 'not_downloaded' | 'outdated' | 'latest' = 'not_downloaded'
          if (!local) {
            status = 'not_downloaded'
          } else if (local.version < cat.version) {
            status = 'outdated'
          } else {
            status = 'latest'
          }

          results.push({
            category: cat.category,
            title: cat.title,   // ← サーバーの日本語タイトルをそのまま保持
            version: cat.version,
            status
          })

          pending--
          if (pending === 0) {
            // ③ Pinia に保存
            categoryStore.setCategories(results)
            console.log("カテゴリ状態をストアに保存:", results)
          }
        }
      })
    }
  } catch (err) {
    console.error("カテゴリ一覧の取得に失敗:", err)
  }
})
