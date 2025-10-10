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
  res.render('ideco', {
    layout:'layouts/article',
     title:'IDECO | TOP' 
    });
});

router.get('/ideco/my_ideco_portfolio', (req, res) => {

    // ページ固有の情報を一つの定数として定義
  const pageMeta = {
    // HTMLの<title>と<meta name="description">用
    title: 'iDeCoポートフォリオの作り方｜初心者でも失敗しない資産配分と商品選び',
    description: 'iDeCo初心者でもわかるポートフォリオの作り方を徹底解説。株式・債券・REIT・コモディティの比率やおすすめインデックスファンドを、実例付きで紹介します。',
    
    // OGP専用のオブジェクト
    ogp: {
      title: 'iDeCoポートフォリオの作り方', // OGPタイトル (titleとは別に設定可能)
      description: '初心者向けiDeCo資産配分ガイド。', // OGPディスクリプション
      image: '/images/ogp-ideco.jpg', // OGP画像
      url: `https://${req.headers.host}${req.originalUrl}`, // 絶対URL
      type: 'article',
      site_name: 'O-ishisugihara.com'
    }
  };

  // res.localsに設定（これによりレイアウト側で title, description, ogp が利用可能になる）
  Object.assign(res.locals, pageMeta);

  res.render('my_ideco_portfolio', 
    {
      layout:'layouts/article',
      title:'iDeCoポートフォリオの作り方｜初心者でも失敗しない資産配分と商品選び',
      description:'iDeCo初心者でもわかるポートフォリオの作り方を徹底解説。株式・債券・REIT・コモディティの比率やおすすめインデックスファンドを、実例付きで紹介します。'
    }
  );
});

// 旅行の日程
router.get('/hakone20250816', (req, res) => {
  res.render('hakone20250816', { title:'箱根2025/08/16 | TOP' });
});


export default router
