/**
 * @ngdoc service
 * @name app.service:userSvc
 * @requires $http
 * @requires $q
 * @requires $cookies
 * @requires $state
 * @requires Notification
 *
 * @description
 * A service that handles the creation, modification, and deletion of users, 
 * as well as managing the current user's user object.
 */
angular
  .module('app')
  .factory('userSvc', ['$http', '$q', '$cookies', '$state', 'Notification', function($http, $q, $cookies, $state, Notification) {
    'use strict';

    var userSvc = {
      users: [],
      user: {},
      initiated: false
    };

    /**
     * @ngdoc method
     * @name init
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to initialize the userSvc with data from the server.
     *
     * @returns {Object} A future promise.
     */
    userSvc.init = function() {
      // Check to see if we are already initiated.
      if (userSvc.initiated) {
        return userSvc;
      }
      
      var deferred = $q.defer();

      $http.get('/api/users')
        .then(function(res) {
          userSvc.roles = res.data.roles;
          userSvc.users = res.data.users;
          userSvc.user = JSON.parse($cookies.get('user'));
          userSvc.initiated = true;
          deferred.resolve(userSvc);
        });

      return deferred.promise;
    };

    /**
     * @ngdoc method
     * @name remove
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to delete a user. 
     *
     * @param {String} userToDelete The id of the user to delete.
     */
    userSvc.remove = function(userToDelete) {
      // Create the request object.
      var req = {
        method: 'DELETE',
        url: '/api/user/' + userToDelete
      };

      $http(req).success(function(data) {
        // Hooray the user was deleted! Now let's find them in the list and 
        // remove them.
        userSvc.users.forEach(function(el, index) {
          if (el._id === userToDelete) {
            // This is our guy. Remove!
            userSvc.users.splice(index, 1);
          }
        });

        Notification.success('User deleted.');
      }).error(function() {
        Notification.error('Sorry, there was a problem.');
      });
    };

    /**
     * @ngdoc method
     * @name create
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to create a user.
     *
     * @param {Object} newUser User object to create.
     * @param {Function} next Callback function.
     */
    userSvc.create = function(newUser, next) {
      // Create the request object.
      var req = {
        method: 'POST',
        url: '/api/user',
        data: {
          data: newUser
        }
      };

      $http(req).success(function(data) {
        // We have a new user! Add them to the list!
        userSvc.users.push(data);
        Notification.success('New user has been created.');

        // Trigger the callback in the controller to reset the newUser object.
        next();
      }).error(function() {
        Notification.error('Sorry, there was a problem.');
      });
    };

    /**
     * @ngdoc method
     * @name update
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to update the users.
     */
    userSvc.update = function() {
      var req = {
        method: 'POST',
        url: '/api/users',
        data: {
          data: userSvc.users
        }
      };

      $http(req).success(function(data) {
        Notification.success('Users have been updated.');
      }).error(function() {
        Notification.error('Sorry, there was a problem.');
      });
    };

    /**
     * @ngdoc method
     * @name login
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to login a user.
     *
     * @param {Object} user User object containing an email address and password
     * to validate the user.
     */
    userSvc.login = function(user) {
      var showNotification = true;

      if (arguments.length > 1) {
        showNotification = arguments[1];
      }

      var req = {
        method: 'POST',
        url: '/api/user/login',
        data: user
      };

      $http(req).success(function(data) {
        userSvc.user = data;
        userSvc.isLoggedIn = true;
        if (showNotification) {
          Notification.success('Login successful!');
        }

        $state.go('search');
      }).error(function() {
        Notification.error('Login failed.');
      });
    };

    /**
     * @ngdoc method
     * @name logout
     * @methodOf app.service:userSvc
     *
     * @description
     * Method to log a user out of the site.
     */
    userSvc.logout = function() {
      var req = {
        method: 'POST',
        url: '/api/user/logout'
      };

      $http(req).success(function(data) {
        userSvc.user = {};
        userSvc.isLoggedIn = false;
        Notification.success('You are now logged out.');
        $state.go('home');
      }).error(function() {
      });

      return false;
    };

    return userSvc;
  }]);
