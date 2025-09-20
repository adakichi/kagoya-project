import { Router } from 'express'
import webPush from 'web-push'

const router = Router()

// メモリに購読者情報を保持（本番ではDB等に保存する）
let subscriptions = []
const menus = [
    {path:'send-push-form',name:'通知送信用フォーム',description:''},
    {path:'push-register',name:'購読者登録',description:''},
    {path:'',name:'',description:''},
    {path:'',name:'',description:''},
    {path:'',name:'',description:''},
]

// --- 購読登録 ---------------------------------------------------------------
router.post('/subscribe', (req, res) => {
  const subscription = req.body

  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint)
  if (!exists) {
    subscriptions.push(subscription)
    console.log('📥 新しい購読者を追加:', subscription)
  } else {
    console.log('⚠️ 重複購読を無視:', subscription.endpoint)
  }

  res.status(201).json({ message: '購読成功' })
})

// --- 通知テストページ -------------------------------------------------------
router.get('/', (req, res) => {
  console.log(`notifyにアクセスがあったのでEJS返します`)
  console.log('    baseUrl: req.baseUrl:',req.baseUrl)
  res.render('admin/index', { title: 'push test',menus:menus, baseUrl: req.baseUrl })
})

// --- 通知送信用フォーム -----------------------------------------------------
router.get('/send-push-form', (req, res) => {
  console.log('/send-push-form にアクセスがありました')
  res.render('admin/send-push-form', { title: 'プッシュ通知の送信フォーム' })
})

// --- 実際の通知送信 ---------------------------------------------------------
router.post('/send-push', async (req, res) => {
  console.log('📩 /send-push リクエストを受信しました')
  console.log('req.body', req.body)

  const { title, body } = req.body
  const payload = JSON.stringify({ title, body })

  const results = await Promise.allSettled(
    subscriptions.map(sub => webPush.sendNotification(sub, Buffer.from(payload, 'utf8')))
  )

  // 無効な購読を削除
  subscriptions = subscriptions.filter((sub, index) => {
    const result = results[index]
    return !(result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode))
  })

  console.log('✅ 通知送信結果:', results)
  res.json({ success: true, results })
})

// --- 通知登録ページ ---------------------------------------------------------
router.get('/push-register', (req, res) => {
  console.log('/push-register にアクセスがありました')
  res.render('admin/push-register', { title: '通知の登録' })
})

export default router
