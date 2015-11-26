var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();
var Paper = require('/models/paperschema');
var converter = require('/models/latex2html');

var webPort = 8080;
var dbPort  = 27017;

mongoose.connect('mongodb://localhost:' + dbPort + '/paperCollection');

server.post('/addPaper', function(req, res) {

    var paper = new Paper({
    	  title: req.body.title,
        author: req.body.author,
        publicaton_date: req.body.publication_date
        htmlCode: req.body.htmlCode,
        geoTiff_path: req.body.geoTiff_path,
        rData_path: req.body.rData_path,
        geoJSON_path: req.body.geoJSON_path
    });
});
