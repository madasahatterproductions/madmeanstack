var router = require('express').Router();
var passport = require('passport');
var restrict = require('../../../auth/restrict');
var userUtil = require('./user-util');

// GET method to get all users
router.get('/api/users', restrict.user, function(req, res, next) {
  $users = {};
  $users.roles = userUtil.getAllRoles();

  if (req.user.role === 'admin') {
    userUtil.getAllUsers(function(err, users) {
      if (err) {
        next(err);
      }
      $users.users = users;

      return res.json($users);
    });
  } else {
    return res.json($users);
  }
});

// POST method to create a new user.
router.post('/api/user', restrict.admin, function(req, res, next) {
  if (req.body.data) {
    var newUser = req.body.data;
    if (!newUser.role) {
      newUser.role = 'user';
    }

    userUtil.findUser(newUser.email, function(err, user) {
      if (err) {
        return next(err);
      } else if (user) {
        res.status(400);
        return res.json({'error': 'This email is in use.'});
      } else {

        userUtil.addUser(newUser, function(err, user) {
          if (err) {
            return next(err);
          } else {
            return res.json(user);
          }
        });
      }
    });
  } else {
    return res.status(500);
  }
});

// POST method to update all users.
router.post('/api/users', restrict.admin, function(req, res, next) {
  if (req.body.data) {
    req.body.data.forEach(function(item) {
      userUtil.saveUser(item, function(err) {
        if (err) {
          next(err);
        }
      });
    });

    return res.json({'success': 'success'});
  } else {
    return res.send("error");
  }
});

// POST method to check if a user is logged in.
router.post('/api/user/access', function(req, res, next) {
  if (req.user) {
    return res.send('success');
  } else {
    res.status(401);
    return res.send("error");
  }
});

// DELETE method to remove a user.
router.delete('/api/user/:id', restrict.editor, function(req, res, next) {
  if (req.params.id) {
    userUtil.removeUser(req.params.id, function(err) {
      if (err) {
        return next(err);
      }
      return res.send('success');
    });
  } else {
    return res.status(500);
  }
});

// POST method allows users to login via AJAX
// router.post('/api/user/login', passport.authenticate('local'), function(req, res, next) {
//   var tempUser = {
//     email: req.user.email,
//     role: req.user.role
//   };

//   res.cookie('user', JSON.stringify(tempUser), { httpOnly: false } );
//   res.send(tempUser);
// });

// POST method to log users out
// router.post('/api/user/logout', function(req, res, next) {
//   req.logout();
//   res.redirect('/');
// });

module.exports = router;
