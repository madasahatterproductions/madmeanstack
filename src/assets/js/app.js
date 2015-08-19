/**
 * @ngdoc overview
 * @name app
 * @module app
 * @description
 *
 * # app (core module)
 * The core of the application.
 * 
 * @requires ngCookies
 * @requires ui.router
 * @requires ngFileUpload
 * @requires ui-notification
 * @requires 720kb.datepicker
 * @requires autocomplete
 * @requires ngAnimate
 * @requires infinite-scroll
 */
angular
  // Initialize the app module and load the dependencies.
  .module('app', ['ngCookies', 'ui.router', 'ui.bootstrap', 'autocomplete', 'ngAnimate', 'infinite-scroll'])
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
    'use strict';
    // If the route is not found, send them to the home page.
    $urlRouterProvider.otherwise('/');

    // Let's define some states. For certain states,
    // we want to ensure that the user is logged in,
    // so we do a simple POST to the server that will
    // return whether or not the user has access.
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/html/login.html'
      })
      .state('terms', {
        resolve: {
          isloggedIn: ['$http', function($http) {
            return $http.post('/api/user/access')
              .then(function(res) {
                return res.data;
              });
          }]
        },
        templateUrl: '/html/terms.html',
        url: '/terms'
      })
      .state('contact', {
        resolve: {
          isloggedIn: ['$http', function($http) {
            return $http.post('/api/user/access')
              .then(function(res) {
                return res.data;
              });
          }]
        },
        templateUrl: '/html/contact.html',
        url: '/contact'
      })
      .state('privacy', {
        resolve: {
          isloggedIn: ['$http', function($http) {
            return $http.post('/api/user/access')
              .then(function(res) {
                return res.data;
              });
          }]
        },
        url: '/privacy',
        templateUrl: '/html/privacy.html'
      });

    // We want to intercept any HTTP requests so we can check them 
    // for 401 errors, which will allow us to easily send the user
    // back to the login page.
    $httpProvider.interceptors.push(['$q', '$injector', function($q, $injector) {
      return {
        response: function(response) {
          return response;
        },
        responseError: function(response) {
          // If response code is 401, send them to the home page to login.
          if (response.status === 401) {
            $injector.get('$state').go('home');
          }
          return $q.reject(response);
        }
      };
    }]);
  }])
  .run(['$rootScope', 'userSvc', function($rootScope, userSvc) {
    'use strict';
    // Let's run a function when the state is changed so we can do some things.
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      // First, lets scroll to the top of the page.
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      // Next, lets set the active menu item so we can highlight in the menu.
      userSvc.activeMenuItem = toState.name;
    });
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      // If there is an error, log it to the console.
      console.error("$stateChangeError: ", toState, error);
    });
  }]);

angular
  .module('app')
  .config(['$stateProvider', function($stateProvider) {
    'use strict';

    $stateProvider
      .state('users', {
        url: '/users',
        templateUrl: '/html/users.html',
        controller: 'UserCtrl',
        resolve: {
          'userSvc': ['userSvc', function(userSvc) {
            return userSvc.init();
          }]
        }
      });
  }]);

/**
 * @ngdoc controller
 * @name app.controller:UserCtrl
 *
 * @description
 * Controller to interface with user data.
 */
angular
  .module('app')
  .controller('UserCtrl', ['$scope', '$cookies', 'Notification', 'userSvc', function($scope, $cookies, Notification, userSvc) {
    'use strict';
    
    // Default an object to store data 
    $scope.newUser = {};

    // Hand the userSvc to the view.
    $scope.userSvc = userSvc;

    // Let's default a user object and check to see if 
    // the user is stored in a cookie.
    $scope.user = {};
    var tempUser = $cookies.get('user');
    if (tempUser) {
      $scope.user.email = JSON.parse(tempUser).email;
    }

    /**
     * @ngdoc method
     * @name createUser
     * @methodOf app.controller:UserCtrl
     *
     * @description
     * Method to create a new user. This method is merely a helper and actually 
     * passes the work off to the userSvc, which will fire the callback here to 
     * clear out the newUser object.
     */
    $scope.createUser = function() {
      userSvc.create($scope.newUser, function() {
        // Callback resets the new user object.
        $scope.newUser = {};
      });
    };

    /**
     * @ngdoc method
     * @name remove
     * @methodOf app.controller:UserCtrl
     *
     * @description
     * Method to delete a user. Method confirms the action before calling the 
     * userSvc.remove() method.
     *
     *@param {object} user The user object to delete.
     */
    $scope.remove = function(user) {
      // Confirm the user is going to be deleted.
      if (confirm('Are you sure want to remove ' + user.firstName + ' ' + user.lastName + '?')) {
        // Pass off to the userSvc.
        userSvc.remove(user._id);
      }
    };
  }]);

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
