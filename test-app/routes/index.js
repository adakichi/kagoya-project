import { Router } from 'express'

const router = Router()

// TOPページ用にtouteの一覧を配列でもっておいて渡す
const menus = [
    {path:'admin',name:'管理者ページ',description:'管理者用のページ'},
    {path:'ideco',name:'ideco',description:''},
    {path:'hakone20250816',name:'箱根2025/08/16',description:''},
    {path:'',name:'',description:''},
]

// TOPページ
router.get('/', (req, res) => {
  res.render('index', {
      title: 'TOP',
       menus : menus
     })
})

// ideco
router.get('/ideco', (req, res) => {
  res.render('ideco', { title:'IDECO | TOP' });
});

// 旅行の日程
router.get('/hakone20250816', (req, res) => {
  res.render('hakone20250816', { title:'箱根2025/08/16 | TOP' });
});


export default router
