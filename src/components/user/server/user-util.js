var User = require('./user');

module.exports = {
  addUser: function(user, next) {
    var newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.toLowerCase(),
      password: user.password,
      role: user.role
    });

    newUser.save(function(err) {
      if (err) {
        return next(err);
      }
      next(null, newUser);
    });
  },

  findUser: function(email, next) {
    User.findOne({email:email.toLowerCase()}, function(err, user) {
      next(err, user);
    });
  },

  getAllUsers: function(next) {
    User
      .find({})
      .select('firstName lastName email role')
      .exec(function(err, users) {
        next(err, users);
      });
  },

  removeUser: function(id, next) {
    User.remove({_id:id}, function(err) {
      if (err) {
        return next(err);
      }

      return next(null);
    });
  },

  getAllRoles: function(next) {
    return User.schema.paths.role.enumValues;
  },

  saveUser: function(user, next) {
    var done = false;

    if (user._id) {
      done = true;
      User.findOne({_id:user._id}, function(err, oldUser) {
        if (err) {
          return next(err);
        }
        for (var key in user) {
          oldUser[key] = user[key];
        }

        oldUser.save();
        return next(null, oldUser);
      });
    }
  }
};
