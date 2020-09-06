const PORT = process.env.PORT || 5000;

const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

// Middlewares
// Helmet can help protect your app from some well-known web vulnerabilities
// by setting HTTP headers appropriately
app.use(helmet());

// This is a way to deal with DOS attacks, by adding a limit to the body payload
app.use(bodyParser.json({ limit: '1024kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
// Data sanitization against XSS
app.use(xss());
// Data sanitization against NoSQL injection attacks
app.use(mongoSanitize());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

// Routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Custom http error middlewares
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

const connectOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
  };

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aqiy8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    connectOptions
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App listening on port: ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
