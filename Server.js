var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var app = express();

var Paper = require('../../models/paperschema');

