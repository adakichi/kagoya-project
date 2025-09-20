import { Router } from 'express'
import { exec } from 'child_process'

const router = Router()

// /admin/ban
router.get('/', (req, res) => {
  const cmd = `
    fail2ban-client status recidive |
    grep 'Banned IP list' |
    awk -F ':' '{print $2}' |
    tr ' ' '\\n' |
    grep -v '^$'
  `

  exec(cmd, (error, stdout, stderr) => {
    if (error) return res.status(500).send('エラー:\n' + stderr)

    const ips = stdout.trim().split('\n').filter(Boolean)
    if (ips.length === 0) {
      return res.render('admin/ban', { bans: [], title: 'Ban' })
    }

    let pending = ips.length
    const bans = []

    ips.forEach(ip => {
      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim()
        bans.push({ ip, country })

        if (--pending === 0) {
          bans.sort((a, b) => a.ip.localeCompare(b.ip))
          res.render('admin/ban', { bans, title: 'Ban' })
        }
      })
    })
  })
})

// /admin/ban/nginx
router.get('/nginx', (req, res) => {
  console.log('/admin/ban/nginx にアクセスされました')
  const jails = ['nginx-404', 'nginx-badbots']
  let allIps = []

  const runJailChecks = jails.map(jail => {
    return new Promise(resolve => {
      const cmd = `
        fail2ban-client status ${jail} |
        grep 'Banned IP list' |
        awk -F ':' '{print $2}' |
        tr ' ' '\\n' |
        grep -v '^$'
      `
      exec(cmd, (err, stdout) => {
        if (err) return resolve([]) // jail が存在しない場合は無視
        const ips = stdout.trim().split('\n').filter(Boolean).map(ip => ({ ip, jail }))
        resolve(ips)
      })
    })
  })

  Promise.all(runJailChecks).then(results => {
    allIps = results.flat()
    if (allIps.length === 0) {
      return res.render('admin/ban', { bans: [], title: 'BAN (nginx)' })
    }

    let pending = allIps.length
    const bans = []

    allIps.forEach(({ ip, jail }) => {
      exec(`geoiplookup ${ip}`, (geoErr, geoOut) => {
        const country = geoErr ? 'Unknown' : (geoOut.split(': ')[1] || 'Unknown').trim()
        bans.push({ ip, jail, country })

        if (--pending === 0) {
          bans.sort((a, b) => a.ip.localeCompare(b.ip))
          res.render('admin/ban', { bans, title: 'BAN (nginx)' })
        }
      })
    })
  })
})

export default router
