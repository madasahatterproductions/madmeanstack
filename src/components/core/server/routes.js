var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Let's create the view model and set the title and the default user role level.
  var vm = {
    title: 'Document Repository',
    level: -1
  };

  // If the user is logged in, then lets set up some data for the view model.
  if (req.user) {
    vm.loggedIn = true;
    vm.user = req.user;

    // Here we check to see what role level the user is, to help create the menu.
    if (req.user.role === 'user') {
      vm.level = 1;
    } else if (req.user.role === 'editor') {
      vm.level = 2;
    } else if (req.user.role === 'admin') {
      vm.level = 3;
    } else {
      vm.level = 0;
    }
  }

  // Render the jade index file.
  res.render(__dirname + '/index', vm);
});

module.exports = router;
