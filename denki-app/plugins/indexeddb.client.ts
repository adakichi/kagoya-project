/**
 * onupgradeneeded:
 *  問題テーブル・選択肢テーブル・回答履歴・進捗　作成
 * onsuccess:
 *  問題取得 "/questions"
 *    indexedDBに格納
 * onerror:
 */
export default defineNuxtPlugin(() => {
    console.log('indexedDBがあるか初回チェック')
  if (!process.client) return;

  const request = indexedDB.open("DenkiQuizDB", 1);

  request.onupgradeneeded = (event) => {
    console.log('onupgradeneeded 発火')
    const db = request.result;

    // 問題テーブル
    const questions = db.createObjectStore("questions", { keyPath: "id" });
    questions.createIndex("by_category", "category", { unique: false });
    console.log('問題テーブル作成済み')

    // 選択肢テーブル
    const choices = db.createObjectStore("question_choices", { keyPath: "id" });
    choices.createIndex("by_question_id", "question_id", { unique: false });
    console.log('選択肢テーブル作成済み')

    // 解答履歴
    const answers = db.createObjectStore("user_answers", { keyPath: "id", autoIncrement: true });
    answers.createIndex("by_user_question", ["user_id", "question_id"], { unique: false });
    console.log('回答履歴 作成済み')

    // 進捗
    const progress = db.createObjectStore("user_progress", { keyPath: ["user_id", "question_id"] });
    progress.createIndex("by_user_id", "user_id", { unique: false });
    progress.createIndex("by_category_correct", ["category", "is_correct"], { unique: false });
    console.log('進捗 作成済み')

    // 問題のバージョン
      db.createObjectStore("category_versions", { keyPath: "category" });
      console.log('問題Version 作成済み')

  };

  request.onsuccess = async () => {
    console.log("IndexedDB ready!");

    const db = request.result;

    // 初期ロードでサーバーから問題を取得
    try {
        console.log('サーバーから問題を取得します')
      const config = useRuntimeConfig();
      const data = await $fetch("/questions?limit=100", {
        baseURL: config.public.apiBase
      });

      // トランザクション開始
      console.log('indexedDBに格納します')
      const txQ = db.transaction("questions", "readwrite");
      const storeQ = txQ.objectStore("questions");

      const txC = db.transaction("question_choices", "readwrite");
      const storeC = txC.objectStore("question_choices");
      console.log(data.questions)
      for (const q of data.questions) {
        storeQ.put({
          id: q.id,
          question: q.question,
          answer_index: q.answer_index,
          explanation: q.explanation,
          category: q.category,
          image_url: q.image_url
        });

        q.choices.forEach((c: any) => {
          storeC.put({
            id: `${q.id}_${c.index}`, // question_id+choice_index でユニーク化
            question_id: q.id,
            choice_index: c.index,
            choice_text: c.text
          });
        });
      }

      console.log("Questions saved to IndexedDB");
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    }
  };

  request.onerror = (err) => {
    console.error("IndexedDB error", err);
  };
});
