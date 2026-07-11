import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Neon Postgres pool — set DATABASE_URL in .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
});

// Ensure the waitlist table exists on startup
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Waitlist table ready (Neon Postgres)');
  } catch (err) {
    console.error('Failed to initialise waitlist table:', err.message);
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

app.listen(PORT, () => {
  console.log(`Waitlist backend running on http://localhost:${PORT}`);
});
