import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Initialize SQLite DB
let db;
(async () => {
  db = await open({
    filename: "./waitlist.db",
    driver: sqlite3.Database,
  });
  await db.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )`);
})();

// POST /api/waitlist
app.post("/api/waitlist", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email required" });
  }
  try {
    await db.run("INSERT INTO waitlist (name, email) VALUES (?, ?)", [name, email]);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Waitlist backend running on http://localhost:${PORT}`);
});
