#!/bin/bash
set -e

# 公開ディレクトリを空にする
echo "🧹 Cleaning /var/www/denki ..."
sudo rm -rf /var/www/denki/*

# 成果物をコピー
echo "📦 Copying files from ./denki-dist to /var/www/denki ..."
sudo cp -r ./denki-dist/* /var/www/denki/

# 権限を修正
echo "🔑 Fixing permissions ..."
sudo chown -R www-data:www-data /var/www/denki

echo "✅ Deployment completed! /var/www/denki is ready."
