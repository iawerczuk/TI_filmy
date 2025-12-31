const express = require('express');
const Database = require('better-sqlite3');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const db = new Database('movies.db');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "script-src-attr": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

app.disable('x-powered-by');

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER NOT NULL,
    score INTEGER CHECK(score >= 1 AND score <= 5),
    FOREIGN KEY (movie_id) REFERENCES movies(id)
  );
`);


app.get('/api/movies', (req, res) => {
    res.set('Cache-Control', 'no-store');
    
    const query = `
        SELECT m.id, m.title, m.year, 
               ROUND(AVG(r.score), 2) as avg_score, 
               COUNT(r.id) as votes
        FROM movies m
        LEFT JOIN ratings r ON m.id = r.movie_id
        GROUP BY m.id
        ORDER BY avg_score DESC
    `;
    const movies = db.prepare(query).all();
    res.json(movies);
});

app.post('/api/movies', (req, res) => {
    const { title, year } = req.body;
    if (!title || !year) {
        return res.status(400).json({ error: "Tytuł i rok są wymagane" });
    }
    
    const stmt = db.prepare('INSERT INTO movies (title, year) VALUES (?, ?)');
    const info = stmt.run(title, year);
    
    res.status(201)
       .header('Location', `/api/movies/${info.lastInsertRowid}`)
       .json({ id: info.lastInsertRowid });
});

app.post('/api/ratings', (req, res) => {
    const { movie_id, score } = req.body;
    
    if (!movie_id || score < 1 || score > 5) {
        return res.status(400).json({ error: "Ocena poza zakresem 1-5" });
    }
    
    try {
        const stmt = db.prepare('INSERT INTO ratings (movie_id, score) VALUES (?, ?)');
        stmt.run(movie_id, score);
        res.status(201).send();
    } catch (e) {
        res.status(404).json({ error: "Nie znaleziono filmu o podanym ID" });
    }
});

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` Serwer działa poprawnie!`);
    console.log(` Adres: http://localhost:${PORT}`);
    console.log(`========================================`);
});