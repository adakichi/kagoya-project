# Node公式の軽量版を使用
FROM node:18-alpine

# 作業ディレクトリ設定
WORKDIR /app

# package.jsonだけ先にコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# 全ソースをコピー（volumesで上書きされるので軽い）
COPY . .

# Strapiを起動（開発モード）
CMD ["npm", "run", "develop"]
