const bcrypt = require('bcrypt');
const { Router } = require('express');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('../config/passport-function')

const { authenticateToken, authenticateHeader } = require('./middleware');

const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = Router();

router.get('/', [authenticateToken], async (req, res) => {
  const { email, username, auth_service} = req.response;
  const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM user WHERE user_email = ? AND user_is_native_registration = TRUE', [email]);
  const count = rows[0].count;
  if (count > 0) {
    const queryResult = await pool.promise().query(`SELECT user_email, user_name, user_image FROM user WHERE user_name='${req.response.username}' AND user_is_native_registration = TRUE LIMIT 1`);
    const result = queryResult[0][0];
    res.status(200).json({
      status: 200,
      data: result
    });
  } else {
    const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM user WHERE user_email = ? AND user_is_native_registration = FALSE', [email]);
    const count = rows[0].count;
    if (count > 0) {
      const queryResult = await pool.promise().query(`SELECT user_email, user_name, user_image FROM user WHERE user_name='${req.response.username}' AND user_is_native_registration = FALSE LIMIT 1`);
      const result = queryResult[0][0];
      res.status(200).json({
      status: 200,
      data: result
      });
    } else {
      res.status(300).json({
        status: 300,
        msg: "Please Sign In or Sign Up using your account"
        });
    }
  }
});

router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM user WHERE user_email = ? AND user_is_native_registration = TRUE', [email]);
    const count = rows[0].count;
    if (count > 0) {
        return res.status(400).json({
            status: 401,
            msg: 'E-mail sudah terdaftar dalam sistem, mohon Sign In menggunakan e-mail yang sudah terdaftar.'
        });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = 'INSERT INTO user (user_email, user_name, user_password, user_is_native_registration) VALUES (?, ?, ?, ?)';
    await pool.promise().query(query, [email, username, hashedPassword, true]);
    // const query = 'INSERT INTO users (users_email, users_name, users_pass) VALUES (?, ?, ?)';
    // await pool.promise().query(query, [email, username, password]);
    return res.status(200).json({
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

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_email= ? AND user_is_native_registration = TRUE LIMIT 1', [email]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({
        status: 401,
        msg: 'Invalid E-mail atau Password. Mohon Sign Up apabila belum memiliki akun.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.user_password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        msg: 'Invalid E-mail atau Password. Mohon Sign Up apabila belum memiliki akun.'
      });
    }

    const queryResult = await pool.promise().query(`SELECT user_id, user_email, user_name, user_image, user_auth_provider, user_is_native_registration FROM user WHERE user_email='${email}' AND user_is_native_registration = TRUE LIMIT 1`);
    const result = queryResult[0][0];
    const token = jwt.sign({ email: user.user_email, username: user.user_name, auth_service: "None"}, process.env.SECRET_TOKEN, { expiresIn: '1d' });
    res.status(200).json({
      status: 200,
      msg: 'Sign In success!',
      data: result,
      token: token
    });
  } catch (error) {
    console.error('Error executing query:', error);
    return res.status(500).json({
      status: 500,
      msg: 'Server error'
    });
  }
});

//Google Function
function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }
  
router.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());

router.get('/google',
    passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

router.get('/google/callback',
    passport.authenticate( 'google', {
    successRedirect: '/users/protected',
    failureRedirect: '/users/google/failure'
    })
);

router.get('/google/logout', (req, res) => {
  // req.logout();
  req.session.destroy();
  return res.status(200).json({
    status: 200,
    msg: 'logout succeed'
  })
});

router.get('/protected', isLoggedIn, async (req, res) => {
  try {
    console.log(req.user);
    const user = req.user;
    const [rows] = await pool.promise().query('SELECT COUNT(*) AS count FROM user, googleauthaccounts WHERE googleauthaccounts.google_id = ? AND user.user_id = googleauthaccounts.google_user_id', [user.id]);
    const count = rows[0].count;

    console.log(req.user);
    const token = jwt.sign({ email: user.email, username: user.displayName, auth_service: "Google"}, process.env.SECRET_TOKEN, { expiresIn: '3d' });
    if (count > 0) {
      const [rows2] = await pool.promise().query('SELECT user_email, user_id FROM user, googleauthaccounts WHERE googleauthaccounts.google_id = ? AND user.user_id = googleauthaccounts.google_user_id', [user.id]);
      const emailSaved = rows2[0].user_email;
      const idSaved = rows2[0].user_id;
      if (emailSaved !== user.email) {
        const query = 'UPDATE user SET user_email = ? WHERE user_id = ?';
        await pool.promise().query(query, [user.email, idSaved]);
      } else {
        res.status(200).json({
          status: 200,
          msg: 'Sign In success!',
          token: token
        });
      }
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(process.env.ROOT_PASSWORD, saltRounds);
      const query = 'INSERT INTO user (user_email, user_name, user_password, user_image, user_auth_provider, user_is_native_registration) VALUES (?, ?, ?, ?, ?, ?)';
      await pool.promise().query(query, [user.email, user.displayName, hashedPassword, user.picture, '1', false]);
      const [getId] = await pool.promise().query('SELECT user_id FROM user WHERE user_image = ?', [user.picture]);
      const userId = getId[0].user_id;
      const query3 = 'INSERT INTO googleauthaccounts (google_user_id, google_id) VALUES (?, ?)';
      await pool.promise().query(query3, [userId, user.id]);
      res.status(200).json({
        status: 200,
        msg: 'Akun telah dibuat, Selamat bergabung di Purrfect Aid',
        token: token
      });
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

module.exports = router;