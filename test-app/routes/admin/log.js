import { Router } from 'express'
import { exec } from 'child_process'

const router = Router()

// /admin/log
router.get('/', (req, res) => {
  console.log('/log にアクセスがありました。');

  const command = `
    grep 'Ban' /var/log/fail2ban.log |
    awk -v d="$(date --date='7 days ago' '+%Y-%m-%d')" '$0 >= d {print $1, $NF}' |
    sort | uniq -c | sort -k2,2 -k1,1nr
  `;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send('ログ取得エラー:\n' + stderr);
    }

    const lines = stdout.trim().split('\n').filter(l => l);
    const logs = [];
    let pending = lines.length;
    console.log('lines:',lines)

    if (pending === 0) return res.render('admin/log', { logs, title: 'Logs' });

    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s+(\d{4}-\d{2}-\d{2})\s+([\d\.]+)$/);
      if (!match) {
        if (--pending === 0) res.render('admin/log', { logs, title: 'Logs' });
        return;
      }

      const [_, count, date, ip] = match;

      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim();

        logs.push({ date, count: parseInt(count), ip, country });

        if (--pending === 0) {
          logs.sort((a, b) => b.count - a.count);
          res.render('admin/log', { logs, title: 'Logs' });
        }
      });
    });
  });
});

router.get('/country', (req, res) => {
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

    if (pending === 0) return res.render('admin/log', { logs,title:'logs/country' });

    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s+([\d\.]+)$/);
      if (!match) {
        if (--pending === 0) res.render('admin/log', { logs,title:'logs/country' });
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
          res.render('admin/log', { logs,title:'logs/country' });
        }
      });
    });
  });
});



export default router
