/**
 * This module contains the authorization code to simply allowing users to do certain
 * things. Basically, these functions can be passed as middleware to ensure a user
 * has access to view or do something. There is one function for each level of access.
 * If the user fails authorization, then a 401 is sent to let the user know they need 
 * to login with a higher level of access to continue.
 */
module.exports = {
  // Administrators can perform any function on the site.
  admin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.sendStatus(401);
  },
  // Editors can do everything users can do, but also can edit resources.
  editor: function(req, res, next) {
    if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'editor')) {
      return next();
    }
    res.sendStatus(401);
  },
  // Users can search for and view resources and create bibliographies.
  user: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.sendStatus(401);
  }
};
