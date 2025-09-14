// app.js
require('dotenv').config(); // 最上部で読み込む
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3000;
const expressLayouts = require('express-ejs-layouts');
const auth = require('basic-auth');
const webPush = require('web-push');

app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.json()); // JSONボディの受け取り用

const USERNAME = process.env.BASIC_USER;
const PASSWORD = process.env.BASIC_PASS;

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

webPush.setVapidDetails(
  'mailto:you@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// メモリに購読者情報を保持（本番ではDB等に）
let subscriptions = [];

// Basic認証ミドルウェア
const basicAuth = (req, res, next) => {
  const user = auth(req);

  const USERNAME = process.env.BASIC_USER;
  const PASSWORD = process.env.BASIC_PASS;
  console.log(`USERNAME:${USERNAME}`)
  console.log(`PASSWORD:${PASSWORD}`)
  console.log(!user || user.name !== USERNAME || user.pass !== PASSWORD)

  if (!user || user.name !== USERNAME || user.pass !== PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).send('認証が必要です');
  }

  next();
};

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

// EJSテンプレート設定
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main'); // views/layouts/main.ejs を使う


app.get('/', (req, res) => {
  res.render('index', { name: 'Nりこさん',title:'TOP' });
});


app.get('/log', basicAuth, (req, res) => {
  console.log('/logにアクセスがありました。')
    const command = `
      grep 'Ban' /var/log/fail2ban.log |
      awk -v d="$(date --date='7 days ago' '+%Y-%m-%d')" '$0 >= d {print $1, $NF}' |
      sort | uniq -c | sort -k2,2 -k1,1nr
    `;
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).send('ログ取得エラー:\n' + stderr);
      }
  
      const lines = stdout.trim().split('\n');
      const logs = [];
  
      // 各行を分解し、geoiplookupで国情報を取得
      let pending = lines.length;
  
      if (pending === 0) return res.render('log', { logs });
  
      lines.forEach(line => {
        const match = line.trim().match(/^(\d+)\s+(\d{4}-\d{2}-\d{2})\s+([\d\.]+)$/);
        if (!match) {
          if (--pending === 0) res.render('log', { logs });
          return;
        }
  
        const [_, count, date, ip] = match;
  
        // IPの国情報を取得
        exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
          const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim();
  
          logs.push({ date, count: parseInt(count), ip, country });
  
          if (--pending === 0) {
            // 並び順を維持（任意）
            logs.sort((a, b) => b.count - a.count);
            res.render('log', { logs,title:'Logs' });
          }
        });
      });
    });
});

app.get('/log/country', basicAuth, (req, res) => {
  console.log('国別集計')
  const command = `
  awk -v d="$(date --date='7 days ago' '+%Y-%m-%d')" '
    /Ban/ {
      split($1, dt, "-");
      logdate = dt[1] "-" dt[2] "-" dt[3];
      if (logdate >= d) print $NF
    }
  ' /var/log/fail2ban.log | sort | uniq -c
`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send('ログ取得エラー:\n' + stderr);
    }

    const lines = stdout.trim().split('\n');
    const logs = [];
    let pending = lines.length;

    if (pending === 0) return res.render('log', { logs });

    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s+([\d\.]+)$/);
      if (!match) {
        if (--pending === 0) res.render('log', { logs });
        return;
      }

      const [_, count, ip] = match;

      // 国情報取得
      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim();

        // 既に存在する国かどうかを確認
        const existing = logs.find(item => item.country === country);
        if (existing) {
          existing.count += parseInt(count);
        } else {
          logs.push({ country, count: parseInt(count) });
        }

        if (--pending === 0) {
          logs.sort((a, b) => b.count - a.count);
          res.render('log', { logs,title:'logs/country' });
        }
      });
    });
  });
});

// BANされたIP一覧
app.get('/ban', (req, res) => {
  const cmd = `
    sudo fail2ban-client status recidive |
    grep 'Banned IP list' |
    awk -F ':' '{print $2}' |
    tr ' ' '\\n' |
    grep -v '^$'
  `;

  exec(cmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send('エラー:\n' + stderr);

    const ips = stdout.trim().split('\n');
    if (ips.length === 0 || !ips[0]) {
      return res.render('ban', { bans: [],title:'Ban' });
    }

    let pending = ips.length;
    const bans = [];

    ips.forEach(ip => {
      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim();
        bans.push({ ip, country });

        if (--pending === 0) {
          // 並び順を固定（任意）
          bans.sort((a, b) => a.ip.localeCompare(b.ip));
          res.render('ban', { bans,title:'Ban' });
        }
      });
    });
  });
});

app.get('/ban/nginx', basicAuth, (req, res) => {
  console.log('/ban/nginx にアクセスされました');
  const jails = ['nginx-404', 'nginx-badbots'];
  let allIps = [];

  const runJailChecks = jails.map(jail => {
    return new Promise((resolve, reject) => {
      const cmd = `sudo fail2ban-client status ${jail} | grep 'Banned IP list' | awk -F ':' '{print $2}' | tr ' ' '\\n' | grep -v '^$'`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) return resolve([]); // Jailが存在しない場合もあるのでエラーは無視

        const ips = stdout.trim().split('\n').filter(Boolean).map(ip => ({ ip, jail }));
        resolve(ips);
      });
    });
  });

  Promise.all(runJailChecks).then(results => {
    allIps = results.flat();
    if (allIps.length === 0) return res.render('ban', { bans: [], title: 'BAN (nginx)' });

    let pending = allIps.length;
    const bans = [];

    allIps.forEach(({ ip, jail }) => {
      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim();
        bans.push({ ip, jail, country });

        if (--pending === 0) {
          bans.sort((a, b) => a.ip.localeCompare(b.ip));
          res.render('ban', { bans, title: 'BAN (nginx)' });
        }
      });
    });
  });
});


// push通知関連 ---------------------------------------------------------------
app.post('/subscribe', (req, res) => {
  const subscription = req.body;

  const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('📥 新しい購読者を追加:', subscription);
  } else {
    console.log('⚠️ 重複購読を無視:', subscription.endpoint);
  }

  res.status(201).json({ message: '購読成功' });
});

// push通知のテスト送信
app.get('/admin/notify',basicAuth, (req, res) => {
  res.render('notify',{ title:'push test' }); // views/notify.ejs
});

app.get('/send-push-form', (req, res) => {
  console.log('/send-push-formにアクセスがありました')
  res.render('send-push',{ title:'プッシュ通知の送信フォーム'});
});

// （通知送信）
app.post('/send-push', async (req, res) => {
  console.log('📩 /send-push リクエストを受信しました');
  console.log('req.body',req.body)
  const { title, body } = req.body;

  const payload = JSON.stringify({ title, body });

  const results = await Promise.allSettled(
    subscriptions.map(sub => webPush.sendNotification(sub, Buffer.from(payload, 'utf8')))
  );

  // 無効な購読を削除
  subscriptions = subscriptions.filter((sub, index) => {
    const result = results[index];
    return !(result.status === 'rejected' &&
             [404, 410].includes(result.reason?.statusCode));
  });

  console.log('✅ 通知送信結果:', results);
  res.json({ success: true, results });
});

// 通知の登録ページ
app.get('/push-register',basicAuth, (req, res) => {
  console.log('push-registerにアクセスがありました。')
  res.render('push-register',{ title:'通知の登録' }); // views/notify.ejs
});


// ideco
app.get('/ideco', (req, res) => {
  res.render('ideco', { title:'IDECO | TOP' });
});

// 旅行の日程
app.get('/hakone20250816', (req, res) => {
  res.render('hakone20250816', { title:'箱根2025/08/16 | TOP' });
});

// APIルートの読み込み
const denkiApi = require('./routes/api/denki');
app.use('/api/denki', denkiApi);

app.listen(port, () => {
  console.log(`🚀 サーバー起動中：http://localhost:${port}`);
});
