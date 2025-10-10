import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import expressLayouts from 'express-ejs-layouts'
import auth from 'basic-auth'
import cors from 'cors'

import adminRoutes from './routes/admin/index.js'
import publicRoutes from './routes/index.js'
import apiNotifyRouter from './routes/api/notify.js'
import denkiApi from './routes/api/denki.js'

dotenv.config()

const app = express()
const host = '0.0.0.0'
const port = 3000

app.use(cors())
app.use(express.json())

app.use(express.static('public'))

// accesslog出力
app.use((req, res, next) => {
  console.log(`[ACCESS] ${req.method} ${req.originalUrl}`)
  next()
})

// EJS設定
app.set('view engine', 'ejs')
app.set('views', path.join(process.cwd(), 'views'))
app.set('layout', 'layouts/main')
app.use(expressLayouts)


// Basic認証ミドルウェア
const basicAuth = (req, res, next) => {
  const user = auth(req)
  const USERNAME = process.env.BASIC_USER
  const PASSWORD = process.env.BASIC_PASS

  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    console.log(`Basic Auth:rejection;`)
    res.set('WWW-Authenticate', 'Basic realm="Secure Area"')
    return res.status(401).send('認証が必要です')
  }
  next()
}

// テーマの情報を取得して使えるようにミドルウェア設定
app.use((req, res, next) => {
  const theme = req.query.theme || 'light';
  res.locals.theme = theme;

  // 現在のパスとクエリからテーマだけ差し替えたURLを作る
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);
  url.searchParams.set('theme', theme === 'light' ? 'dark' : 'light');
  res.locals.toggleThemeUrl = url.pathname + url.search;

  next();
});

// layoutなどで使う変数を定義
app.use((req, res, next) =>{
    // ✅ 全ページ共通で利用する変数を初期化
  res.locals.title = '';
  res.locals.description = '';
  res.locals.ogp = {};
  res.locals.headExtra = '';
  next();
})


// 通常(publicルート)
app.use('/', publicRoutes)

// APIルート
app.use('/api', apiNotifyRouter)   // ← ここでマウント

// APIdenkiルートの読み込み
app.use('/api/denki', denkiApi);

// 管理ページルート
app.use('/admin', basicAuth, adminRoutes)


app.listen(port, host, () => {
  console.log(`🚀 サーバー起動中：http://${host}:${port}`)
})
