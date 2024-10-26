const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2');

dotenv.config();

const app = express();
const port = 3000;

const OMDB_API_KEY = process.env.OMDB_API_KEY;

app.use(cors());

app.get('/api/movies/search', async (req,res) => {
    const query = req.query.q;
    try {
        const response = await axios.get(`http://www.omdbapi.com/?s=${query}&apikey=${OMDB_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data from omdb api'});
    }
});

app.listen(port, () => {
    console.log(`サーバー起動 ${port}`);
});
