const { Router } = require('express');
const pool = require('../database');
const router = Router();

router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM users WHERE users_email = ?', [email]);
    const count = rows[0].count;
    if (count > 0) {
      return res.status(400).json("E-mail sudah terdaftar dalam sistem, mohon Sign In menggunakan e-mail yang sudah terdaftar.");
    }
    const query = 'INSERT INTO users (users_email, users_name, users_pass) VALUES (?, ?, ?)';
    await pool.promise().query(query, [email, username, password]);
    res.status(200).json("Akun telah dibuat, Selamat bergabung di Purrfect Aid");
    } 
  catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json("Terjadi kesalahan dalam proses pendaftaran");
   }
});
module.exports = router;
