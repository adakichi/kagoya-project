import { Router } from 'express'

const router = Router()

// メモリに購読者情報を保持（本番ではDBを使うべき）
let subscriptions = []

// 購読登録 API
router.post('/subscribe', (req, res) => {
  console.log('購読者の追加処理')
  const subscription = req.body

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' })
  }

  // 既に存在していれば追加しない
  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint)
  if (!exists) {
    subscriptions.push(subscription)
    console.log('📥 新しい購読者を追加:', subscription.endpoint)
  } else {
    console.log('⚠️ 重複購読を無視:', subscription.endpoint)
  }

  res.status(201).json({ message: '購読成功' })
})

// サーバー内で購読リストを参照できるよう export
export { subscriptions }
export default router
