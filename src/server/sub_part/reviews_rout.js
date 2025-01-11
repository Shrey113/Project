const express = require('express');
const router = express.Router();
const mysql = require('mysql2');



const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'Trevita_Project_1',
    authPlugins: {
        mysql_native_password: () => require('mysql2/lib/auth_plugins').mysql_native_password
    }
});


router.post('/get_reviews', (req, res) => {

    const { user_email } = req.body;
    const query = `
        SELECT * FROM owner_reviews WHERE user_email = ?
    `;
    db.query(query, [user_email], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});


module.exports = router;
