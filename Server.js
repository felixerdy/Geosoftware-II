"use strict"

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var Paper = require('./models/paperSchema');
var converter = require('./models/latex2html');

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb'
})); // to enable processing of the received post content
app.use(bodyParser.json({
  limit: '50mb'
}));

var webPort = 8080;
var dbPort = 27017;

mongoose.connect('mongodb://localhost:' + dbPort + '/paperCollection');

app.use(express.static('./public'));

app.post('/addPaper', function(req, res) {

  var paper = new Paper({
    title: req.body.title,
    author: req.body.author,
    publicaton_date: req.body.publication_date,
    htmlCode: req.body.htmlCode,
    geoTiff_path: req.body.geoTiff_path,
    rData_path: req.body.rData_path,
    geoJSON_path: req.body.geoJSON_path
  });
  paper.save(function(error) {

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
