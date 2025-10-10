import { Router } from 'express'
import notifyRoutes from './notify.js'
import logRoutes from './log.js'
import banRoutes from './ban.js'

const router = Router()

// サブルーターを読み込む
router.use('/notify', notifyRoutes)
router.use('/log', logRoutes)
router.use('/ban', banRoutes)

      

const menus = [
    {path:'log',name:'🗂 IP単位/🌍 国別集計',description:''},
    {path:'ban',name:'🚫 永久BAN一覧',description:''},
    {path:'ban/nginx',name:'🌐 nginx BAN一覧',description:''},
    {path:'notify',name:'通知用',description:''},
    {path:'',name:'',description:''},
]

// 管理トップページ
router.get('/', (req, res) => {
  res.render('admin/index', { 
    title: '管理トップ',
    menus:menus,
    baseUrl: req.baseUrl
   })
})

export default router
