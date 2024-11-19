const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const port = 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(cors());
app.use(express.json());

app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        //ハッシュ化
        const hashPassword = await bcrypt.hash(password, 10);

        await db.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',[username, email, hashPassword]);
        res.status(201).json({ message: 'ユーザーが登録されました' });
    } catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: 'ユーザー名またはメールアドレスがすでに使用されています。'});
        } else {
            res.status(500).json({ error: 'ユーザー登録に失敗しました' });
        }
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'user is not registered' });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'password is not correct' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h'});

        res.json({ message: 'login succeeded', token });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ error: 'login failure' });
    }
});

app.get('/auth/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'トークンが必要です' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [users] = await db.query('SELECT username, email, created_at FROM Users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'ユーザーが見つかりません' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: '無効なトークンです' });
    }
});

app.get('/api/movies/search', async (req,res) => {
    const query = req.query.q;

    try {
        const [movies] = await db.query('SELECT * FROM Movies WHERE title Like ?', [`%${query}%`]);

        if (movies.length > 0) {
            return res.json(movies);
        }

        const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
        const apiMovies = response.data.Search || [];

        //データベースへの保存
        for (const movie of apiMovies) {
            const { imdbID, Title, Year, Poster } = movie;
            const movieDetails = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
            const { Runtime, Director, Plot } = movieDetails.data;

            await db.query(
                'INSERT INTO Movies (id, title, year, posterurl, runtime, director, plot ) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [imdbID, Title, Year, Poster, Runtime, Director, Plot]
            );
        }

        const formattedMovies = apiMovies.map(movie => ({
            id: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            posterurl: movie.Poster,
        }));
        res.json(formattedMovies);
    } catch (error) {
        console.error('error:',error);
        res.status(500).json({ error: 'Error fetching data from omdb api'});
    }
});

app.get('/api/movies/:id', async (req,res) => {
    const movieID = req.params.id;
    try {
        const [existingMovie] = await db.query('SELECT * FROM Movies Where id = ?', [movieID]);
        if (existingMovie.length > 0) {
            return res.json(existingMovie[0]);
        };

        const response = await axios.get(`http://www.omdbapi.com/?i=${movieID}&apikey=${OMDB_API_KEY}`);
        const movie = response.data.Search || [];

        await db.query('INSERT INTO Movies (id, title, year, posterurl, runtime, director, plot) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [imdbID, Title, Year, Poster, Runtime, Director, Plot]
        );

        res.json(movie);
    } catch (error) {
        console.error('Error fetching movie details', error);
        res.status(500).json({ error: 'Error fetching movie details' });
    }
});

app.listen(port, () => {
    console.log(`サーバー起動 ${port}`);
});
