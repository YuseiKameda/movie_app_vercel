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
