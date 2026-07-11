import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Neon Postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Ensure tables exist on startup
(async () => {
  try {
    // 1. Waitlist Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Waitlist table ready (Neon Postgres)');

    // 2. Questionnaire / Persona Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questionnaire (
        uid            TEXT PRIMARY KEY,
        vibe           TEXT,
        niches         JSONB DEFAULT '[]'::jsonb,
        content_styles JSONB DEFAULT '[]'::jsonb,
        tones          JSONB DEFAULT '[]'::jsonb,
        endgames       JSONB DEFAULT '[]'::jsonb,
        summary        TEXT,
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Questionnaire table ready (Neon Postgres)');
  } catch (err) {
    console.error('Database initialisation error:', err.message);
  }
})();

// POST /api/waitlist
app.post('/api/waitlist', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  try {
    await pool.query(
      'INSERT INTO waitlist (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [name, email]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Waitlist insert error:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/questionnaire/get/ (and alias /questionnaire/get/)
const handleGetQuestionnaire = async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).json({ error: 'uid query parameter is required' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM questionnaire WHERE uid = $1', [uid]);
    if (rows.length > 0) {
      const q = rows[0];
      return res.json({
        status: 'success',
        data: {
          vibe: q.vibe || '',
          niches: Array.isArray(q.niches) ? q.niches : JSON.parse(q.niches || '[]'),
          content_styles: Array.isArray(q.content_styles) ? q.content_styles : JSON.parse(q.content_styles || '[]'),
          tones: Array.isArray(q.tones) ? q.tones : JSON.parse(q.tones || '[]'),
          endgames: Array.isArray(q.endgames) ? q.endgames : JSON.parse(q.endgames || '[]'),
          summary: q.summary || '',
        }
      });
    }
    res.json({ status: 'success', data: null });
  } catch (err) {
    console.error('Questionnaire fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

app.get('/api/questionnaire/get/', handleGetQuestionnaire);
app.get('/questionnaire/get/', handleGetQuestionnaire);

// POST /api/questionnaire/save/ (and alias /questionnaire/save/)
const handleSaveQuestionnaire = async (req, res) => {
  const { uid, vibe, niches, content_styles, tones, endgames, summary } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'uid is required' });
  }
  try {
    await pool.query(`
      INSERT INTO questionnaire (uid, vibe, niches, content_styles, tones, endgames, summary, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (uid) DO UPDATE SET
        vibe = EXCLUDED.vibe,
        niches = EXCLUDED.niches,
        content_styles = EXCLUDED.content_styles,
        tones = EXCLUDED.tones,
        endgames = EXCLUDED.endgames,
        summary = EXCLUDED.summary,
        updated_at = NOW()
    `, [
      uid,
      vibe || null,
      JSON.stringify(niches || []),
      JSON.stringify(content_styles || []),
      JSON.stringify(tones || []),
      JSON.stringify(endgames || []),
      summary || null
    ]);
    res.json({ status: 'saved' });
  } catch (err) {
    console.error('Questionnaire save error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/questionnaire/save/', handleSaveQuestionnaire);
app.post('/questionnaire/save/', handleSaveQuestionnaire);

// Stub auth routes to ensure compatibility with client auth calls
const handleAuthStub = (req, res) => res.json({ success: true });
app.post('/api/auth/email/register/', handleAuthStub);
app.post('/auth/email/register/', handleAuthStub);
app.post('/api/auth/email/login/', handleAuthStub);
app.post('/auth/email/login/', handleAuthStub);
app.post('/api/auth/firebase/google/', handleAuthStub);
app.post('/auth/firebase/google/', handleAuthStub);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

