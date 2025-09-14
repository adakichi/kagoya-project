// api-server.js
require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');
const app = express();
const port = 3100;

// LINE SDKの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// クライアント生成（返信用などに使う）
const client = new line.Client(config);

// ✅ ルート確認用
app.get('/', (req, res) => {
  res.send('APIサーバーは正常に起動しています 🚀');
});

// ✅ LINE Webhook受信
app.post('/line/webhook', line.middleware(config), async (req, res) => {
  console.log('✅ LINE Webhookを受信しました');

  // 複数イベントを Promise.all でまとめて処理
  try {
    await Promise.all(req.body.events.map(async (event) => {
      console.log('📦 イベント内容:', JSON.stringify(event, null, 2));

      if (event.type === 'message' && event.message.type === 'text') {
        const replyText = `「${event.message.text}」と受け取りました！（SDK）`;

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });

        console.log(`✅ 返信しました：「${event.message.text}」`);
      } else {
        console.log('（未対応のイベントタイプでした）');
      }
    }));

    res.status(200).end();
  } catch (err) {
    console.error('❌ Webhook処理中にエラー:', err);
    res.status(500).end();
  }
});

// ✅ テスト用エンドポイント（そのまま維持）
app.post('/test', (req, res) => {
  console.log('POST /test 受信:', req.body);
  res.json({ message: '受信しました！' });
});

app.listen(port, 'localhost', () => {
  console.log(`LINE SDK対応APIサーバー起動中：http://localhost:${port}`);
});
