"use strict"

var express = require('express');
var multer  = require('multer');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var app = express();
var upload = multer({ dest: 'uploadcache/' });

var Paper = require('./models/paperSchema');
var converter = require('./models/latex2html');


var webPort = 8080;
var dbPort = 27017;

// Connect to database...
mongoose.connect('mongodb://localhost:' + dbPort + '/paperCollection');
var database = mongoose.connection;
var connection_failed = false;

database.on('error', function(error){
    console.log("ERROR: Couldn't establish database connection:\n" + error);
    connection_failed = true;
});


// Serve static pages...
app.use(express.static('./public'));

// Adds CORS-string into the header of each response.
// Also returns to all requests to avoid connection time-outs.
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  if(connection_failed) {
    res.status(400).send("database not connected");
  }
  else {
    next();
  }
});

// Handle paper upload request.
var paperupload = upload.fields([{ name: 'texfile', maxCount: 1 }, { name: 'otherfiles', maxCount: 50 }]);
app.post('/addPaper', paperupload, function(req, res) {
  
  // TODO saving stuff into folders/database and start conversion
  console.log("title: "+ req.body.title + "\nfilename: " + req.files["texfile"][0].originalname);
  /*var paper = new Paper({
    title: req.body.title,
    author: req.body.author,
    publicaton_date: req.body.publication_date,
    htmlCode: req.body.htmlCode,
    geoTiff_path: req.body.geoTiff_path,
    rData_path: req.body.rData_path,
    geoJSON_path: req.body.geoJSON_path
  });
  paper.save(function(error) {

  });*/
  res.status(200).json({status:"ok"});
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
