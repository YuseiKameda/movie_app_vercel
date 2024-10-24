const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mydata7131',
    database: 'project2_db'
});

app.use(cors());

app.get('/api/items', (req, res) => {
    connection.query('SELECt * FROM items', (err, results) => {
        if (err) {
            return res.status(500).send('Database query error');
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`サーバー起動 ${port}`);
});
