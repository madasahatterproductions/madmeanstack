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
