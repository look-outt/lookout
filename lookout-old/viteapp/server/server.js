
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_DB = path.join(__dirname, 'users.db.json');

app.use(cors());
app.use(express.json());

function readUsers() {
  if (!fs.existsSync(USERS_DB)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_DB, 'utf8'));
  } catch {
    return [];
  }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// Signup
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = readUsers();
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already exists' });
  const user = { id: Date.now().toString(), name, email, password };
  users.push(user);
  writeUsers(users);
  res.json({ user, token: 'demo-token' });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user, token: 'demo-token' });
});

// Forgot password (mock)
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const users = readUsers();
  if (!users.find(u => u.email === email)) return res.status(404).json({ error: 'Email not found' });
  res.json({ message: 'Password reset link sent (demo)' });
});

// Reset password (mock)
app.post('/api/reset-password/:token', (req, res) => {
  res.json({ message: 'Password reset successful (demo)' });
});

// Questionnaire (mock)
app.post('/api/questionnaire', (req, res) => {
  res.json({ message: 'Questionnaire saved (demo)' });
});

// Google login (mock)
app.post('/api/google-login', (req, res) => {
  res.json({ user: { id: 'google-user', name: 'Google User', email: 'google@example.com' }, token: 'demo-token' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
