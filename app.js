'use strict';

const api_version = require('./api-version');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const passport = require('passport');
const connect = mongoose.connect(
  process.env.MONGO_URL,
  {
    keepAlive: true,
    keepAliveInitialDelay: 300000
  }
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const newsRouter = require('./routes/newsRouter');

connect
  .then(() => {
    const db = mongoose.connection;
    console.log('News Server database connection established');
  })
  .catch(err => console.log(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

app.use(`/${api_version}`, indexRouter);
app.use(`/${api_version}/users`, usersRouter);
app.use(`/${api_version}/news`, newsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
