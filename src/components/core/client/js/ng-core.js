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
