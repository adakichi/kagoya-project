// notify-chatwork.js
// コマンドラインからメッセージを受け取り、Chatwork APIで通知
require('dotenv').config(); // ← .env を読み込む
const https = require('https');
const querystring = require('querystring');

// 環境変数から情報を取得
const CHATWORK_API_TOKEN = process.env.CHATWORK_API_TOKEN;
const CHATWORK_ROOM_ID = process.env.CHATWORK_ROOM_ID;
const message = process.argv[2];

if (!CHATWORK_API_TOKEN || !CHATWORK_ROOM_ID) {
  console.error('[ERROR] CHATWORK_API_TOKEN and CHATWORK_ROOM_ID must be set as environment variables.');
  process.exit(1);
}

if (!message) {
  console.error('[ERROR] No message provided. Usage: node notify-chatwork.js "Your message"');
  process.exit(1);
}

const postData = querystring.stringify({
  body: message,
});

const options = {
  hostname: 'api.chatwork.com',
  port: 443,
  path: `/v2/rooms/${CHATWORK_ROOM_ID}/messages`,
  method: 'POST',
  headers: {
    'X-ChatWorkToken': CHATWORK_API_TOKEN,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('[SUCCESS] Message sent to Chatwork.');
    } else {
      console.error(`[ERROR] Chatwork API responded with status ${res.statusCode}: ${data}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`[ERROR] Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
