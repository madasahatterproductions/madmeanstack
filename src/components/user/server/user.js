var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userUtil = require('./user-util');

var roles = 'user editor admin'.split(' ');

var userSchema = new Schema({
  firstName: {type: String, required: 'Please enter your first name'},
  lastName: {type: String, required: 'Please enter your last name'},
  email: {type: String, required: 'Please enter your email'},
  role: {type: String, enum: roles},
  password: {type: String, required: 'Please enter your password'},
  created: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema);

module.exports = User;
