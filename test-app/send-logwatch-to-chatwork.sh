#!/bin/bash
DATE=$(date +%Y-%m-%d)
REPORT_FILE="/tmp/logwatch-$DATE.txt"
LOGWATCH_CMD="sudo logwatch --detail high --range today --service all --format text"
UPLOAD_SCRIPT="/home/ubuntu/test-app/upload-log-file.js"

# レポートを出力
$LOGWATCH_CMD > "$REPORT_FILE"

# Node.jsでファイルアップロード
node "$UPLOAD_SCRIPT" "$REPORT_FILE" "📄 Logwatchレポート（自動送信）"
rm /tmp/logwatch.txt
