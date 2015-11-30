"use strict"

var express = require('express');
var multer = require('multer');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');

var app = express();
var upload = multer({
  dest: 'uploadcache/'
});

var Paper = require('./models/paperSchema');
var converter = require('./models/latex2html');


var webPort = 8080;
var dbPort = 27017;

// Connect to database...
mongoose.connect('mongodb://localhost:' + dbPort + '/paperCollection');
var database = mongoose.connection;
var connection_failed = false;

database.on('error', function(error) {
  console.log("ERROR: Couldn't establish database connection:\n" + error);
  connection_failed = true;
});


// Serve static pages...
app.use(express.static('./public'));

// Adds CORS-string into the header of each response.
// Also returns to all requests to avoid connection time-outs.
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  if (connection_failed) {
    res.status(400).send("database not connected");
  } else {
    next();
  }
});

// Handle paper upload request.
var paperupload = upload.fields([{
  name: 'texfile',
  maxCount: 1
}, {
  name: 'otherfiles',
  maxCount: 50
}]);
app.post('/addPaper', paperupload, function(req, res) {

  // Since we need the DB object id, we first create an entry
  // half-empty, then create the paths using the ID and then
  // insert the pathstrings into the entry.
  var paper = new Paper({
    title: req.body.title,
    author: req.body.author,
    publicaton_date: req.body.publication_date,
    htmlCode: "",
    geoTiff_path: [],
    rData_path: [],
    geoJSON_path: []
  });
  paper.save(function(error) {
    if (error) {
      console.log("Fail creating paper DB entry for " + req.body.title + ": " + error);
    }
  });

  // Create project folders.
  var paperid = paper._id.toString();
  var paperpath = "./papers";

  // the papers folder
  // fs.exists - > Deprecated!!! maybe stats.isDirectory()
  if (!fs.existsSync(paperpath)) {
    fs.mkdirSync(paperpath);
  }
  // the project folder
  fs.mkdirSync(path.join(paperpath, paperid));
  // the path for unprocessed tex files and related images
  fs.mkdir(path.join(paperpath, paperid, "tex"));
  // the output path
  fs.mkdir(path.join(paperpath, paperid, "html"));
  // the special content paths
  fs.mkdir(path.join(paperpath, paperid, "geotiff"));
  fs.mkdir(path.join(paperpath, paperid, "rdata"));
  fs.mkdir(path.join(paperpath, paperid, "geojson"));

  // a helper function to copy files
  function copyToIDFolder(subfolder, formname, fileno) {
    var sourcePath = path.join("./uploadcache/", req.files[formname][fileno].filename);
    var source = fs.createReadStream(sourcePath);
    var dest = fs.createWriteStream(path.join(paperpath, paperid, subfolder, req.files[formname][fileno].originalname));

    source.pipe(dest);
    source.on('error', function(err) { throw "Error copying file into."; });
  }

  // saving the tex file
  if( /^\.[t|T][e|E][x|X]$/.test(path.extname(req.files["texfile"][0].originalname)) ){
    copyToIDFolder("tex", "texfile", 0);
  }
  else{
    res.status(400).json({status:"uploaded file was not a tex file"});
  }
  
  // saving all other files.
  for(let fileno = 0; fileno < req.files["otherfiles"].length; fileno++) {
    if( /^\.[r|R][d|D][a|A][t|T][a|A]$/.test(path.extname(req.files["otherfiles"][fileno].originalname)) ){
      copyToIDFolder("rdata", "otherfiles", fileno);
    }
    else if( /^\.[t|T][i|I][f|F]$/.test(path.extname(req.files["otherfiles"][fileno].originalname)) ){
      copyToIDFolder("geotiff", "otherfiles", fileno);
    }
    else if( /^\.[j|J][s|S][o|O][n|N]$/.test(path.extname(req.files["otherfiles"][fileno].originalname)) ){
      copyToIDFolder("geojson", "otherfiles", fileno);
    }
    else {
      copyToIDFolder("tex", "otherfiles", fileno);
    }
  }
  // TODO start conversion

  res.status(200).json({
    status: "ok"
  });
});

app.get('/getPapers', function(req, res) {
  Paper.find({}, function(error, values) {
    if (error) {
      var message = "DB error: " + error;
      console.log(message);
      res.status(400).send(message);
    } else {
      res.json(values);
      res.end();
    }
  });
});


// finally start the server
app.listen(webPort, function() {
  console.log('http server now running on port ' + webPort);
});
