const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbPath = process.env.DB_PATH || path.join(__dirname, '../db/calculator.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expression TEXT NOT NULL,
    result TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.get('/api/history', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM history ORDER BY created_at DESC LIMIT 100').all();
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const { expression, result } = req.body;
    const stmt = db.prepare('INSERT INTO history (expression, result) VALUES (?, ?)');
    const info = stmt.run(expression, result);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM history WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/history', (req, res) => {
  try {
    db.exec('DELETE FROM history');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Calculator backend server running on port ${PORT}`);
});
