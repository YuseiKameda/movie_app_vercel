const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET;
const OMDB_API_KEY = process.env.OMDB_API_KEY;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)


app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send(`home and supabase working: environment value:`);
    console.log('Hello:',process.env.OMDB_API_KEY);
});

app.post('/auth/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // ユーザー名またはメールアドレスが既に存在するか確認
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .or(`username.eq.${username},email.eq.${email}`);

        if (fetchError) throw fetchError;

        if (existingUser.length > 0) {
            return res.status(400).json({
                error: 'ユーザー名またはメールアドレスがすでに使用されています。'
            });
        }
        //ハッシュ化
        const hashPassword = await bcrypt.hash(password, 10);
        // const result2 = await db.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',[username, email, hashPassword]);

        // const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        // const user = users[0];
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ username, email, password: hashPassword }])
            .select('*')
            .single();

        if (insertError) throw insertError;
        const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '1h' });


        res.status(201).json({ message: 'ユーザーが登録されました', token, });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'ユーザー登録に失敗しました' });
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (fetchError) throw fetchError;

        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'user is not registered' });
        }

        const user = users[0];
        console.log('User:',user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'password is not correct' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h'});
        console.log('User id:',user.id);

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

        const { data: existingLike, error: fetchError } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (fetchError) throw fetchError;

        if (existingLike.length > 0) {
            // いいねが存在する場合、削除
            const { error: deleteError } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('movie_id', movieId);

            if (deleteError) throw deleteError;

            return res.status(200).json({ isLiked: false });
        } else {
            // いいねが存在しない場合、追加
            const { error: insertError } = await supabase
            .from('likes')
            .insert([{ user_id: userId, movie_id: movieId }]);

            if (insertError) throw insertError;
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

        const { data: existingRecord, error: fetchError } = await supabase
            .from('records')
            .select('*')
            .eq('user_id', userId)
            .eq('movie_id', movieId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        if (existingRecord) {
            const { error: updateError } = await supabase
                .from('records')
                .update({ watched_at: watchedAt, rating: Number(rating), comment })
                .eq('user_id', userId)
                .eq('movie_id', movieId);

            if (updateError) throw updateError;
            res.status(200).json({ message: 'Record update successfully' });
        } else {
            const { error: insertError } = await supabase
                .from('records')
                .insert([
                    {
                        user_id: userId,
                        movie_id: movieId,
                        watched_at: watchedAt,
                        rating: Number(rating),
                        comment,
                    },
                ]);

            if (insertError) throw insertError;
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

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('username, email, created_at')
            .eq('id', userId)
            .single(); // 単一の結果を取得

        if (fetchError) throw fetchError;

        if (!user) {
            return res.status(404).json({ error: 'ユーザーが見つかりません' });
        }

        res.json(user);
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

        const { data: likeMovies, error: fetchError } = await supabase
            .from('likes')
            .select('movies(id, title, posterurl, year)')
            .eq('user_id', userId);

        if (fetchError) throw fetchError;

        res.status(200).json(likeMovies.map(like => like.movies));
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

        const { data: watchedMovies, error: fetchError } = await supabase
            .from('records')
            .select(`
                movies (id, title, posterurl, year),
                rating,
                comment
            `)
            .eq('user_id', userId);

        if (fetchError) throw fetchError;

        // movies部分とその他のフィールドをマージ
        const formattedMovies = watchedMovies.map(record => ({
            ...record.movies,
            rating: record.rating,
            comment: record.comment,
        }));

        res.status(200).json(formattedMovies);
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

        const { data: likes, error: fetchError } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (fetchError) throw fetchError;

        res.status(200).json({ isLiked: likes.length > 0 });
    } catch (error) {
        console.error('Error fetching like status:', error);
        res.status(500).json({ error: 'Failed to fetch like status' });
    }
});

app.get('/api/movies/search', async (req,res) => {
    const query = req.query.q;

    try {
        // const result = await db.query('SELECT * FROM movies WHERE title ILIKE $1', [`%${query}%`]);
        // const movies = result.rows;
        const { data: movies, error } = await supabase
            .from('movies')
            .select('*')
            .ilike('title', `%${query}%`);

        if (error) throw error;

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

            // await db.query(
            //     'INSERT INTO movies (id, title, year, posterurl, runtime, director, plot ) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
            //     [imdbID, Title, Year, Poster, Runtime, Director, Plot]
            // );
            await supabase
                .from('movies')
                .upsert({
                    id: imdbID,
                    title: Title,
                    year: Year,
                    posterurl: Poster,
                    runtime: Runtime,
                    director: Director,
                    plot: Plot,
                });
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
        // Supabaseで映画データを検索
        const { data: existingMovie, error: fetchError } = await supabase
            .from('movies')
            .select('*')
            .eq('id', movieID)
            .single(); // 単一の結果を取得

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116はデータが存在しない場合のエラーコード
            throw fetchError;
        }
        if (existingMovie) {
            return res.json(existingMovie);
        };

        const response = await axios.get(`http://www.omdbapi.com/?i=${movieID}&apikey=${OMDB_API_KEY}`);
        const movie = response.data;

        const { imdbID, Title, Year, Poster, Runtime, Director, Plot } = movie;
        const { data: insertedMovie, error: insertError } = await supabase
            .from('movies')
            .insert([
                {
                    id: imdbID,
                    title: Title,
                    year: Year,
                    posterurl: Poster,
                    runtime: Runtime,
                    director: Director,
                    plot: Plot,
                },
            ])
            .select('*')
            .single();

        if (insertError) throw insertError;
        res.json(insertedMovie);
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

        const { data: records, error: fetchError } = await supabase
            .from('records')
            .select('rating, comment')
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (fetchError) throw fetchError;

        if (records && records.length > 0) {
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

        const { data, error: updateError } = await supabase
            .from('records')
            .update({ rating, comment })
            .eq('user_id', userId)
            .eq('movie_id', movieId);

        if (updateError) throw updateError;

        if (data.length === 0) {
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
