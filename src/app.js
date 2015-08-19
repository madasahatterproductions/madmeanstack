// Let's load all our dependencies.
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);

// Load passport configuration
var passportConfig = require('./auth/passport-config');
passportConfig();

// Connect to mongoose.
mongoose.connect('mongodb://localhost:27017/madmeanstack');

// Initialize our application.
var app = express();

// view engine setup
app.set('views', path.join(__dirname, './'));
app.set('view engine', 'jade');

// Express setup.
// app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'assets')));

// Get express session hooked up so sessions can be saved
// into the database.
app.use(expressSession({
  maxAge: new Date(Date.now() + 3600000),
  secret: 'getting hungry',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({mongooseConnection:mongoose.connection})
}));

// Initialize our passport settings
app.use(passport.initialize());
app.use(passport.session());  

// Here's all the routes.
var routes = [
  './components/core/server/routes',
  // './components/bibliography/server/routes',
  // './components/resource/server/routes',
  // './components/search/server/routes',
  // './components/settings/server/routes',
  './components/user/server/routes'
];

// Now let's initialize the routes
routes.forEach(function(route) {
  app.use('/', require(route));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('./components/core/server/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('./components/core/server/error', {
    message: req.path + ' ' + err.message,
    error:  req.path
  });
});

module.exports = app;
