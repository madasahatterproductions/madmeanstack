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
