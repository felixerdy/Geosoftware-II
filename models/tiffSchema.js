var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tiffSchema = new Schema({
  paperID: String,
  tiffname: String,
  pngpaths: [String],
  coordinates: [Number]
});

var Tiff = mongoose.model('Tiff', tiffSchema);
module.exports = Tiff;
