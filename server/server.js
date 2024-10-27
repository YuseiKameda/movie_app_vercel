const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const port = 3000;
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const db = mysql.createPool({
    host:'localhost',
    user: 'root',
    password: 'Mydata7131',
    database: 'movie_app_db'
});

app.use(cors());

app.get('/api/movies/search', async (req,res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
        const movies = response.data.Search || [];

        //データベースへの保存
        for (const movie of movies) {
            const { imdbID, Title, Year, Poster } = movie;

            const [rows] = await db.query('SELECT * FROM Movies WHERE id = ?', [imdbID]);

            if (rows.length === 0) {
                const movieDetails = await axios.get(`http://www.omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY}`);
                const { Runtime, Director, Plot } = movieDetails.data;

                await db.query(
                    'INSERT INTO Movies (id, title, year, posterurl, runtime, director, plot ) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [imdbID, Title, Year, Poster, Runtime, Director, Plot]
                );
            }
        }

        res.json(response.data);
    } catch (error) {
        console.error('error:',error);
        res.status(500).json({ error: 'Error fetching data from omdb api'});
    }
});

app.listen(port, () => {
    console.log(`サーバー起動 ${port}`);
});
