var mongoose = require('mongoose');
var Schema = mongoose.Schema;


/**
 * processing_state contains either 0 (started), 1 (finished),
 * or some negative number representing a failure
 */
var paperSchema = new Schema({
  title: String,
  author: String,
  publicaton_date: Date,
  search_terms: [String],
  htmlCode: String,
  geoTiff_path: [String],
  rData_path: [String],
  geoJSON_path: [String],
  processing_state: Number
});

var Paper = mongoose.model('Paper', paperSchema);
module.exports = Paper;
