var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var paperSchema = new Schema({
  title: String,
  author: String,
  publicaton_date: Date,
  htmlCode: String,
  geoTiff_path: [String],
  rData_path: [String],
  geoJSON_path: [String]
});

var Paper = mongoose.model('Paper', paperSchema);
module.exports = Paper; 
