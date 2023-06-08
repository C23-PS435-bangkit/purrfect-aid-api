const { Router } = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const { authenticateToken, authenticateHeader } = require('../middleware');

const jwt = require('jsonwebtoken');
const pool = require('../database');
const router = Router();
require('../passport-function');

router.get('/', [authenticateToken], async (req, res) => {
    const queryResult = await pool.promise().query(`SELECT users_email, users_name FROM users WHERE users_name='${req.response.username}' LIMIT 1`);
    const result = queryResult[0][0];
    res.status(200).json({
        status: 200,
        data: result
    });
})

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }
  
// router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));

router.use(passport.session());

router.get('/auth/google',
    passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

router.get('/auth/google/callback',
    passport.authenticate( 'google', {
    successRedirect: '/users/protected',
    failureRedirect: '/users/auth/google/failure'
    })
);

router.get('/protected', isLoggedIn, (req, res) => {
    console.log(req.user)
    result = req.user
    const token = jwt.sign({
        username: result.displayName,
    }, process.env.dbsecrettoken, { expiresIn: '3d' });
    res.status(200).json({
        status: 200,
        msg: 'Sign In success!',
        token: token
    });
});

router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM users WHERE users_email = ?', [email]);
    const count = rows[0].count;
    if (count > 0) {
        return res.status(400).json({
            status: 401,
            msg: 'E-mail sudah terdaftar dalam sistem, mohon Sign In menggunakan e-mail yang sudah terdaftar.'
        });
    }
    const query = 'INSERT INTO users (users_email, users_name, users_pass) VALUES (?, ?, ?)';
    await pool.promise().query(query, [email, username, password]);
    return res.status(400).json({
        status: 200,
        msg: "Akun telah dibuat, Selamat bergabung di Purrfect Aid"
    });
    } 
  catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({
        status: 500,
        msg: "Server error"
    });
   }
});

router.post('/signin', (req, res) => {
    const { email, password } = req.body;
    if (email) {
        pool.query(`SELECT * FROM users WHERE users_email=? LIMIT 1`, [email], (err, result, fields) => {
            result = result[0];
            // console.log(result);
            if (err) {
                console.log(err);
                return res.status(500).json({
                    status: 500,
                    msg: 'Server error'
                });
            }
            if (!result || result.users_pass !== password)
                return res.status(401).json({
                    status: 401,
                    msg: 'Invalid E-mail atau Password. Mohon Sign Up apabila belum memiliki akun.'
                });

            const token = jwt.sign({
                username: result.users_name,
            }, process.env.dbsecrettoken, { expiresIn: '3d' });
            res.status(200).json({
                status: 200,
                msg: 'Sign In success!',
                token: token
            });
        });
    } else {
        res.status(400).json({
            status : 400,
            msg: 'Invalid Parameters'
        });
    }
});

module.exports = router;
