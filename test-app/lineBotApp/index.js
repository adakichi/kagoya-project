require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();

// LINE Messaging APIのミドルウェアを使用
app.post('/webhook', line.middleware(config), (req, res) => {
  console.log('Webhook received:', req.body.events);
  res.status(200).send('OK');
});

// ポート指定して起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LINE Bot Webhook server is running on port ${port}`);
});
