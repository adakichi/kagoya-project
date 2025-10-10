import { Router } from 'express'
const router = Router()


// Strapiコンテナ or localhost
const STRAPI_URL = process.env.STRAPI_URL || 'http://strapi:1337';

/**
 * 記事一覧
 */
router.get('/', async (req, res) => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/articles?populate=*`);
    const data = await response.json();
    const articles = data.data || [];
    console.log(articles)
    res.render('articles', { articles,title:'あーてぃくるず' });
  } catch (err) {
    console.error('❌ Fetch error (articles):', err);
    res.status(500).send('記事一覧を取得できませんでした。');
  }
});

router.get('/categories', async (req, res) => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/categories`);
    const data = await response.json();
    const categories = data.data || [];
    console.log(categories)
    res.render('categories', { categories,title:'カテゴリーズ' });
  } catch (err) {
    console.error('❌ Fetch error (articles):', err);
    res.status(500).send('記事一覧を取得できませんでした。');
  }
});


// 🗂 カテゴリごとの一覧
router.get('/:category', async (req, res, next) => {
  const { category } = req.params;

  // slug付き詳細URLと被るため、slugがある場合はスキップ
  if (req.url.split('/').length > 2) return next();

  try {
    const url = `${STRAPI_URL}/api/articles?filters[category][slug][$eq]=${category}&populate=*`;
    const response = await fetch(url);
    const json = await response.json();
    const articles = json.data || [];

    if (!articles.length) {
      return res.status(404).send('このカテゴリーの記事はありません');
    }

    res.render('articles', { articles, category, title:'カテゴリー一覧' });
  } catch (err) {
    console.error('❌ Fetch error (category):', err);
    res.status(500).send('カテゴリ記事の取得に失敗しました');
  }
});

// 📰 記事詳細（カテゴリ＋スラッグ指定）
router.get('/:category/:slug', async (req, res) => {
  const { category, slug } = req.params;
  try {
    const url = `${STRAPI_URL}/api/articles?filters[category][slug][$eq]=${category}&filters[slug][$eq]=${slug}&populate=*`;
    const response = await fetch(url);
    const json = await response.json();
    const article = json.data[0];

    if (!article) {
      return res.status(404).send('記事が見つかりませんでした');
    }

    res.render('article', { article,title:article.title });
  } catch (err) {
    console.error('❌ Fetch error (article):', err);
    res.status(500).send('記事詳細の取得に失敗しました');
  }
});

export default router;
