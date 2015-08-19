/**
 * Passport configuration
 */
module.exports = function() {
  var passport = require('passport');
  var passportLocal = require('passport-local');
  var userUtil = require('../components/user/server/user-util');

  /**
   * The most important thing here. This essentially tells passport how to authenticate
   * users, which is done by searching for the user in the database by their email, then
   * checking to make sure their password matches.
   */
  passport.use(new passportLocal.Strategy(function(email, password, next) {
    userUtil.findUser(email, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user || user.password !== password) {
        return next(null, null);
      }
      
      next(null, user);
    });
  }));

  /**
   * Function to serialize a user
   */
  passport.serializeUser(function(user, next) {
    next(null, user.email);
  });

  /**
   * Function to deserialze a user
   */
  passport.deserializeUser(function(email, next) {
    userUtil.findUser(email, function(err, user) {
      next(err, user);
    });
  });
};
