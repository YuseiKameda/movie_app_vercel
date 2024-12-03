const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
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
        const [existingUser] = await db.query(
            'SELECT * FROM Users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                error: 'ユーザー名またはメールアドレスがすでに使用されています。'
            });
        }
        //ハッシュ化
        const hashPassword = await bcrypt.hash(password, 10);
        const result = await db.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',[username, email, hashPassword]);

        const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        const user = users[0];
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });


        res.status(201).json({ message: 'ユーザーが登録されました', token, });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'ユーザー登録に失敗しました' });
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

app.post("/api/movies/:id/like", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;
        const movieId = req.params.id;

        const [existingLike] = await db.query(
        "SELECT * FROM Likes WHERE user_id = ? AND movie_id = ?",
        [userId, movieId]
        );

        if (existingLike.length > 0) {
            // いいねが存在する場合、削除
            await db.query(
            "DELETE FROM Likes WHERE user_id = ? AND movie_id = ?",
            [userId, movieId]
            );
            return res.status(200).json({ isLiked: false });
        } else {
        // いいねが存在しない場合、追加
            await db.query(
            "INSERT INTO Likes (user_id, movie_id) VALUES (?, ?)",
            [userId, movieId]
            );
            return res.status(200).json({ isLiked: true });
        }
    } catch (error) {
        console.error("Error toggling like status:", error);
        res.status(500).json({ error: "Failed to toggle like status" });
    }
});

app.post('/api/records/add', async(req,res) => {
    const { movieId, watchedAt, rating, comment } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [existingRecord] = await db.query(
            'SELECT * FROM Records WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (existingRecord.length > 0) {
            await db.query(
                `UPDATE Records SET watched_at = ?, rating = ?, comment = ? WHERE user_id = ? AND movie_id = ?`,
                [watchedAt, rating, comment, userId, movieId]
            );
            res.status(200).json({ message: 'Record update successfully' });
        } else {
            await db.query(
                `INSERT INTO Records (user_id, movie_id, watched_at, rating, comment)
                VALUES (?, ?, ?, ?, ?)`,
                [userId, movieId, watchedAt, rating, comment]
            );
            res.status(201).json({ message: 'Movie recorded successfully' });
        }
    } catch (error) {
        console.error('error recording movie:', error);
        res.status(500).json({ error: 'Failed to record movie' });
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

app.get('/api/users/likes', async(req,res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [likeMovies] = await db.query(
            `SELECT Movies.id, Movies.title, Movies.posterurl, Movies.year
            FROM Likes
            JOIN Movies ON Likes.Movie_id = Movies.id
            WHERE Likes.user_id = ?`,
            [userId]
        );

        res.status(200).json(likeMovies);
    } catch (error) {
        console.error('error fetching likes movies:', error);
        res.status(500).json({ error: 'Failed to fetch liked movies' });
    }
});

app.get('/api/users/watched', async(req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [watchedMovies] = await db.query(
            `SELECT Movies.id, Movies.title, Movies.posterurl, Movies.year, Records.rating, Records.comment
            FROM Records
            JOIN Movies ON Records.movie_id = Movies.id
            WHERE Records.user_id = ?`,
            [userId]
        );

        res.status(200).json(watchedMovies);
    } catch (error) {
        console.error('error fetching watched movies:', error);
        res.status(500).json({ error: ' failed to fetch watched movies' });
    }
});

app.get('/api/movies/:id/like', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;
        const movieId = req.params.id;

        const [result] = await db.query(
            'SELECT * FROM Likes WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        res.status(200).json({ isLiked: result.length > 0 });
    } catch (error) {
        console.error('Error fetching like status:', error);
        res.status(500).json({ error: 'Failed to fetch like status' });
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

app.get('/api/records/:movieId', async(req,res) => {
    const { movieId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [records] = await db.query(
            'SELECT rating, comment FROM Records WHERE user_id = ? AND movie_id = ?',
            [userId, movieId]
        );

        if (records.length > 0) {
            res.status(200).json({ isRecorded: true, rating: records[0].rating, comment: records[0].comment, });
        } else {
            res.status(200).json({ isRecorded: false });
        }
    } catch (error) {
        console.error('error fetching record:', error);
        res.status(500).json({ error: 'failed to fetch record' });
    }
})

app.put('/api/records/update', async(req, res) => {
    const { movieId, rating, comment } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.userId;

        const [result] = await db.query(
            'Update Records SET rating = ?, comment = ? WHERE user_id = ? AND movie_id = ?',
            [rating, comment, userId, movieId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json({ message: 'Record update successfully' });
    } catch (error) {
        console.error('error updating record:', error);
        res.status(500).json({ error: 'failed to update record' });
    }
});

app.listen(port, () => {
    console.log(`サーバー起動 ${port}`);
});
