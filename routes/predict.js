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

router.post('/', upload.single('images'), (req, res, next) => {
  const file = req.file;
  console.log(file);
  const fileName = 'tes2.jpg'; // Use a unique name for each image

  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(fileName);

  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  blobStream.on('error', (err) => {
    // Handle any errors that occur during the upload
    next(err);
  });

  blobStream.on('finish', () => {
    // The image has been uploaded successfully
    res.status(200).json({ message: 'Image upload successful' });
  });

  blobStream.end(file.buffer);
});

module.exports = router;
