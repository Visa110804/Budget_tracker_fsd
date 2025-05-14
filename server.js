const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve absolute path to budget.db
const dbPath = path.resolve(__dirname, 'budget.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err.message);
    } else {
        console.log('✅ Connected to database at:', dbPath);
    }
});

// Initialize tables if not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT,
        amount REAL,
        date TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS budget (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        value REAL
    )`);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// API routes
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/transactions', (req, res) => {
    const { description, amount, date } = req.body;
    db.run(
        'INSERT INTO transactions (description, amount, date) VALUES (?, ?, ?)',
        [description, amount, date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: 'Transaction added successfully!' });
        }
    );
});

app.post('/api/setBudget', (req, res) => {
    const { budget } = req.body;
    db.run(
        'INSERT INTO budget (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = ?',
        [budget, budget],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Budget set successfully!' });
        }
    );
});

app.get('/api/getBudget', (req, res) => {
    db.get('SELECT value FROM budget WHERE id = 1', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ budget: row ? row.value : 0 });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
