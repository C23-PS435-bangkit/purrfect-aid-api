const bcrypt = require('bcrypt');
const { Router } = require('express');
const session = require('express-session');
const passport = require('passport');
var request = require('request');
var fs = require('fs');
const { authenticateToken } = require('./middleware');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const upload = multer({ storage: multer.memoryStorage() });
const storage = new Storage({ keyFilename: './config/quantum-lambda-388103-6b9321f28922.json' });
const bucketName = 'purrfect-aid-image';
require('dotenv').config();
const router = Router();

const  nanoid  = require('nanoid-esm');
const moment = require('moment');
const pool = require('../config/database');

router.post('/',  [authenticateToken], upload.single('image'), async(req, res, next) => {
  const { email, username, auth_service } = req.response;
  const file = req.file;

  console.log(file);
  const nanoidString = nanoid(16);
  const nanoidString2 = nanoid(15);
  const currentDate = moment().format('YYYY_MM_DD');

  const fileName = `${nanoidString}-${currentDate}.${file.originalname.split('.').pop()}`;

  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(fileName);

  let userId;
    if (auth_service === 'None') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
      userId = rows[0].user_id;
    }
    
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    res.status(400).json({ message: 'Error happened, please try again' });
    next(err);
  });

  blobStream.on('finish', () => {
    // The image has been uploaded successfully
    const imageUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    // Make a HTTP POST request to your Flask application
    fetch('https://purrfect-aid-model-dot-quantum-lambda-388103.et.r.appspot.com/predict', {
    // -> Nnati diganti API ML-nya
      method: 'POST',
      body: JSON.stringify({ "image_url": imageUrl }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response) => response.json())
      .then((data) => {
                // Prepare the SQL query
        const insertQuery = `INSERT INTO scan (scan_id, scan_pict, scan_diagnose, scan_treatment, scan_date, scan_user_id) VALUES (?, ?, ?, ?, ?,?)`;
        const values = [nanoidString2, imageUrl, data.diagnose, data.treatment, new Date(), userId];

        // Execute the SQL query
        pool.query(insertQuery, values, (err, result) => {
          if (err) {
            console.error(err);
            // Handle the error
          } else {
            console.log("Data inserted successfully");
          }
        });
        res.status(200).json({ message: 'Analysis carried successfully', data: { diagnose: data.diagnose, treatment: data.treatment } });
      })
      .catch((error) => {
        // Handle any errors that occur during the HTTP request
        console.error(error);
        res.status(500).json({ message: 'Error occurred during image analysis' });
      });
  });

  blobStream.end(file.buffer);
});

router.get('/', [authenticateToken], async (req, res) => {
  const { email, username, auth_service } = req.response;
  let userId;
    if (auth_service === 'None') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
      userId = rows[0].user_id;
    }

  try {
    const [rows] = await pool.promise().query('SELECT scan_id, scan_pict, scan_diagnose, scan_treatment, scan_date FROM scan WHERE scan_user_id = ?',[userId]);
    const scanHistory = rows;
    res.status(200).json({
    status: 200,
    data: scanHistory,
});

  } catch (error) {
    console.error('Error retrieving scan history:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

router.get('/:predictId', [authenticateToken], async (req, res) => {
  const { email, username, auth_service } = req.response;
  try {
    const { predictId } = req.params;
    let userId;
    if (auth_service === 'None') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [4, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Google') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [1, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Facebook') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [2, email]);
      userId = rows[0].user_id;
    } else if (auth_service === 'Twitter') {
      const [rows] = await pool.promise().query('SELECT * FROM user WHERE user_auth_provider = ? AND user_email = ? ', [3, email]);
      userId = rows[0].user_id;
    }

  const [scanRows] = await pool
    .promise()
    .query(
      `SELECT
      scan.scan_user_id AS predict_user_id,
      u.user_name,
      scan.scan_diagnose,
      scan.scan_treatment,
      scan.scan_pict
      FROM scan
      LEFT JOIN user AS u ON scan.scan_user_id = u.user_id
      WHERE scan.scan_id = ?`,
      [predictId]
  );


    const scan_post = scanRows;
    return res.status(200).json({
      status: 200,
      data: scan_post,
    });
  } catch (error) {
    console.error('Error fetching scan attachment:', error);
    res.status(500).json({
      status: 500,
      msg: 'Server error',
    });
  }
});

module.exports = router;
