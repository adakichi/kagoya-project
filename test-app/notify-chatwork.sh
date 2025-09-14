#!/bin/bash
# Chatwork通知用ラッパースクリプト

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
MESSAGE="$1"

if [ -z "$MESSAGE" ]; then
  echo "[ERROR] 通知メッセージを指定してください"
  exit 1
fi

# .env を読み込む
export $(grep -v '^#' "$BASE_DIR/.env" | xargs)

# Node.js スクリプトを実行
/home/ubuntu/.nvm/versions/node/v22.15.0/bin/node "$BASE_DIR/notify-chatwork.js" "$MESSAGE"
echo "$(date) [ChatworkNotify] Sent message: $MESSAGE" >> /tmp/chatwork_notify.log
