// app.js
require('dotenv').config(); // 最上部で読み込む
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const host = '0.0.0.0'
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const auth = require('basic-auth');
const webPush = require('web-push');

const cors = require('cors');
app.use(cors());

app.use((req, res, next) => {
  console.log('REQ:', req.method, req.url);
  next();
});

app.use(express.json()); // JSONボディの受け取り用

// APIルートの読み込み
const denkiApi = require('./routes/api/denki');
app.use('/api/denki', denkiApi);


app.use(expressLayouts);
app.use(express.static('public'));

const USERNAME = process.env.BASIC_USER;
const PASSWORD = process.env.BASIC_PASS;

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// メモリに購読者情報を保持（本番ではDB等に）
let subscriptions = [];



// push通知関連 ---------------------------------------------------------------
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('📥 新しい購読者を追加:', subscription);
  } else {
    console.log('⚠️ 重複購読を無視:', subscription.endpoint);
  }

  res.status(201).json({ message: '購読成功' });
});

// push通知のテスト送信
app.get('/admin/notify',basicAuth, (req, res) => {
  res.render('notify',{ title:'push test' }); // views/notify.ejs
});

app.get('/send-push-form', (req, res) => {
  console.log('/send-push-formにアクセスがありました')
  res.render('send-push',{ title:'プッシュ通知の送信フォーム'});
});

// （通知送信）
app.post('/send-push', async (req, res) => {
  console.log('📩 /send-push リクエストを受信しました');
  console.log('req.body',req.body)
  const { title, body } = req.body;

  const payload = JSON.stringify({ title, body });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webPush.sendNotification(sub, Buffer.from(payload, 'utf8')))
  );

  // 無効な購読を削除
  subscriptions = subscriptions.filter((sub, index) => {
    const result = results[index];
    return !(result.status === 'rejected' &&
             [404, 410].includes(result.reason?.statusCode));
  });

  console.log('✅ 通知送信結果:', results);
  res.json({ success: true, results });
});

// 通知の登録ページ
app.get('/push-register',basicAuth, (req, res) => {
  console.log('push-registerにアクセスがありました。')
  res.render('push-register',{ title:'通知の登録' }); // views/notify.ejs
});



// 管理ページルート（Basic認証付き）
app.use(
  '/admin',
  basicAuth,
  require('./routes/admin')
)

app.listen(port, host,() => {
  console.log(`🚀 サーバー起動中：http://${host}:${port}`);
});
