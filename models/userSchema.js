var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new mongoose.Schema({
  googleID: String,
  name: String
});

var User = mongoose.model('User', userSchema);
module.exports = User;
