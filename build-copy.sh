#!/bin/bash
set -e

# 1. ビルド実行（終了後もコンテナ残す）
docker compose -f docker-compose.prod.yml run frontend-build

# 2. 最新の frontend-build コンテナID を取得
CID=$(docker ps -a -q -n 1 -f "ancestor=project-root-frontend-build")

if [ -z "$CID" ]; then
  echo "❌ frontend-build コンテナが見つかりません"
  exit 1
fi

# 3. 公開ディレクトリを作り直す（権限も初期化）
sudo rm -rf /var/www/denki
sudo mkdir -p /var/www/denki
sudo chown root:root /var/www/denki

# 4. 成果物をコピー
echo "start cp $CID"
docker cp "$CID":/usr/src/app/.output/public/. /var/www/denki/
echo "Done cp"

# 5. 権限を修正（nginx が読めるように）
sudo chown -R www-data:www-data /var/www/denki

echo "✅ 成果物を /var/www/denki にデプロイしました"
