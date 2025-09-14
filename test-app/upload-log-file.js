require('dotenv').config();
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const https = require('https');

const CHATWORK_API_TOKEN = process.env.CHATWORK_API_TOKEN;
const CHATWORK_ROOM_ID = process.env.CHATWORK_ROOM_ID;
const filePath = process.argv[2]; // 例: /tmp/logwatch.txt
const message = process.argv[3] || "📄 Logwatchレポートを添付します。";

if (!filePath || !fs.existsSync(filePath)) {
  console.error("[ERROR] ファイルが指定されていないか存在しません");
  process.exit(1);
}

const form = new FormData();
form.append('file', fs.createReadStream(filePath));
form.append('message', message);

const options = {
  method: 'POST',
  host: 'api.chatwork.com',
  path: `/v2/rooms/${CHATWORK_ROOM_ID}/files`,
  headers: {
    'X-ChatWorkToken': CHATWORK_API_TOKEN,
    ...form.getHeaders(),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log("[SUCCESS] ファイルが正常にアップロードされました");
    } else {
      console.error(`[ERROR] ステータス ${res.statusCode}：${data}`);
    }
  });
});

req.on('error', (err) => {
  console.error(`[ERROR] 通信エラー: ${err.message}`);
});

form.pipe(req);
