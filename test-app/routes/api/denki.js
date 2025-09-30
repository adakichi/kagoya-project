import express from 'express'
import denkiPool from '../../utils/denki-db.js'

const router = express.Router()

// GET /api/denki/questions
router.get('/questions', async (req, res) => {
  console.log(`URI:questions 取得処理開始します`)
  const category = req.query.category;
  const limit = parseInt(req.query.limit) || 5;

  const conn = await denkiPool.getConnection();
  try {
    // カテゴリの最新versionを取得
    let version = null;
    if (category) {
      const [verRows] = await conn.query(
        'SELECT version FROM category_versions WHERE category = ?',
        [category]
      );
      version = verRows.length > 0 ? verRows[0].version : new Date().toISOString();
    }

    // 問題取得
    let sql = `
      SELECT 
        q.id, 
        q.question, 
        q.answer_index, 
        q.explanation, 
        q.category, 
        q.image_url,
        q.source_type,
        q.source_detail,
        q.source_note,
        c.choice_index, 
        c.choice_text
      FROM (
        SELECT * FROM questions
        ${category ? 'WHERE category = ?' : ''}
        ORDER BY RAND()
        LIMIT ?
      ) q
      JOIN question_choices c ON q.id = c.question_id
      ORDER BY q.id, c.choice_index
    `;

    const params = [];
    if (category) params.push(category);
    params.push(limit);

    const [rows] = await conn.query(sql, params);

    console.log(`${rows.length}件取得`)

    // question_id ごとにまとめる
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          question: row.question,
          category: row.category,
          image_url: row.image_url,
          explanation: row.explanation,
          answer_index: row.answer_index,
          source_type: row.source_type,
          source_detail: row.source_detail,
          source_note: row.source_note,
          choices: []
        };
      }
      grouped[row.id].choices.push({
        index: row.choice_index,
        text: row.choice_text
      });
    }

    res.json({
      category: category || null,
      version,
      questions: Object.values(grouped)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

// POST /api/denki/answers
router.post('/answers', async (req, res) => {
  const { user_id, question_id, choice_index } = req.body;

  if (!user_id || !question_id || choice_index === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await denkiPool.getConnection();
  try {
    // 正解取得
    const [rows] = await conn.query(
      'SELECT answer_index, explanation FROM questions WHERE id = ?',
      [question_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const { answer_index, explanation } = rows[0];
    const isCorrect = (choice_index === answer_index);

    // 解答ログに記録
    await conn.query(
      'INSERT INTO user_answers (user_id, question_id, choice_index, is_correct) VALUES (?, ?, ?, ?)',
      [user_id, question_id, choice_index, isCorrect]
    );

    // 進捗を更新（UPSERT）
    await conn.query(`
      INSERT INTO user_progress (user_id, question_id, is_correct)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE is_correct = VALUES(is_correct), updated_at = CURRENT_TIMESTAMP
    `, [user_id, question_id, isCorrect]);

    res.json({
      correct: isCorrect,
      explanation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

// GET /api/denki/categories
router.get('/categories', async (req, res) => {
  console.log(`URI:categories 取得処理開始します`);

  const conn = await denkiPool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT category, title, version, updated_at FROM category_versions ORDER BY category'
    );

    rows.forEach(ele => console.log(ele))
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    conn.release();
  }
});

export default router;
