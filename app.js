require('dotenv').config();
const passport = require('passport');
const express = require('express');
const app = express();
const userRoutes = require('./routes/users');

app.use(express.json());
app.use(passport.initialize());
app.use('/users', userRoutes);
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

module.exports = app;