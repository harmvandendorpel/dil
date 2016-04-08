import express from 'express';
import path from 'path';

// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import routes from './routes/index';
import mongoose from 'mongoose';
const app = express();

import session from 'express-session';
import connectMongo from 'connect-mongo';

const MongoStore = connectMongo(session);

mongoose.connect('mongodb://localhost/dil');

app.use(session({
  name: 'DILCOOKIE',
  secret: 'DIL16',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  proxy: true,
  resave: true,
  saveUninitialized: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('pages/error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
