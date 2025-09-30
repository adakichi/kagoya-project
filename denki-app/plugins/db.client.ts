// plugins/db.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  // 共通：DBを開く
  function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("DenkiQuizDB", 1)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // ========== Questions ==========
  async function getQuestionsByCategory(category: string) {
    const db = await openDB()
    return new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction("questions", "readonly")
      const store = tx.objectStore("questions")
      const index = store.index("by_category")
      const req = index.getAll(category)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // ========== Choices ==========
  async function getChoicesByQuestionId(questionId: number) {
    const db = await openDB()
    return new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction("question_choices", "readonly")
      const store = tx.objectStore("question_choices")
      const index = store.index("by_question_id")
      const req = index.getAll(questionId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // ========== Answers ==========
  async function saveAnswer(userId: string, questionId: number, answerIndex: number) {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("user_answers", "readwrite")
      const store = tx.objectStore("user_answers")
      const req = store.add({
        user_id: userId,
        question_id: questionId,
        answer_index: answerIndex,
        created_at: Date.now(),
      })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // ========== Progress ==========
  async function updateProgress(userId: string, questionId: number, category: string, isCorrect: boolean) {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("user_progress", "readwrite")
      const store = tx.objectStore("user_progress")
      const req = store.put({
        user_id: userId,
        question_id: questionId,
        category,
        is_correct: isCorrect,
        updated_at: Date.now(),
      })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function getProgressByUser(userId: string) {
    const db = await openDB()
    return new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction("user_progress", "readonly")
      const store = tx.objectStore("user_progress")
      const index = store.index("by_user_id")
      const req = index.getAll(userId)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  // ========== Category Versions ==========
  async function getCategoryVersion(category: string) {
    const db = await openDB()
    return new Promise<any>((resolve, reject) => {
      const tx = db.transaction("category_versions", "readonly")
      const store = tx.objectStore("category_versions")
      const req = store.get(category)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  async function setCategoryVersion(category: string, version: string) {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction("category_versions", "readwrite")
      const store = tx.objectStore("category_versions")
      const req = store.put({ category, version })
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  // Nuxt に注入
  nuxtApp.provide('db', {
    openDB,
    getQuestionsByCategory,
    getChoicesByQuestionId,
    saveAnswer,
    updateProgress,
    getProgressByUser,
    getCategoryVersion,
    setCategoryVersion,
  })
})
