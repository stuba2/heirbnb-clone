// Imports -- External
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const { ValidationError } = require('sequelize');

// Imports -- Internal
const { environment } = require('./config');
const routes = require('./routes');

const isProduction = environment === 'production';

// Initialize the app
const app = express();

// Use all global middleware
app.use(morgan('dev')); //logging
app.use(cookieParser());
app.use(express.json()); //converts json req bodies into parsed objects attached to req.body

  // Security Middleware
  if (!isProduction) {
    // enable cors only in development
    app.use(cors());
  }

  // helmet helps set a variety of headers to better secure your app
  app.use(
    helmet.crossOriginResourcePolicy({
      policy: "cross-origin"
    })
  );

  // Set the _csrf token and create req.csrfToken method
  app.use(
    csurf({
      cookie: {
        secure: isProduction,
        sameSite: isProduction && "Lax",
        httpOnly: true
      }
    })
  );

// Routes
app.use(routes);

// Error Handling Middleware

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);

  if (isProduction) {
    res.json({
      message: err.message,
      errors: err.errors,
    })
  } else {
    res.json({
      title: err.title || "Server Error",
      message: err.message,
      errors: err.errors,
      stack: err.stack
    })
  }

  // console.error(err);

  // res.json({
  //   title: err.title || 'Server Error',
  //   message: err.message,
  //   errors: err.errors,
  //   stack: isProduction ? null : err.stack
  // });
});

// Exports
module.exports = app;
