"use strict"

var express = require('express');
var multer = require('multer');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var fsextra = require('fs-extra');
var gdal = require('gdal');
var archiver = require('archiver');

var app = express();
var upload = multer({
  dest: 'uploadcache/'
});

var Paper = require('./models/paperSchema');
var Tiff = require('./models/tiffSchema');
var converter = require('./models/latex2html');
var User = require('./models/userSchema');

var passport = require('passport');
var StrategyGoogle = require('passport-google-openidconnect').Strategy;
var session = require('express-session');

var keys = require('./keys.js');


// Serve static pages...
app.use(express.static('./public'));

// Adds paper directory...
app.use(express.static('./papers'));

// Set up authentication 
app.use(session({
  secret: 'anything'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new StrategyGoogle({
    clientID: keys.clientID,
    clientSecret: keys.clientSecret,
    callbackURL: "/auth/google/callback"
  },
  function(iss, sub, profile, accessToken, refreshToken, done) {
    //check user table for anyone with a facebook ID of profile.id
    User.findOne({
      'googleID': profile.id
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      //No user was found... so create a new user
      if (!user) {
        user = new User({
          googleID: profile.id,
          name: profile.displayName
        });
        user.save(function(err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        //found user. Return
        return done(err, user);
      }
    });
  }
));


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
  if (req.user) { // check if there is a logged in user

  // Since we need the DB object id, we first create an entry
  // half-empty, then create the paths using the ID and then
  // insert the pathstrings into the entry.
  var paper = new Paper({
    title: req.body.title,
    author: req.body.author,
    publicaton_date: req.body.publication_date,
    search_terms: req.body.search_terms,
    htmlCode: "",
    geoTiff_ids: [],
    geoTiff_names: [],
    rData_path: [],
    geoJSON_path: [],
    publisher: req.user.googleID
  });
  paper.save(function(error) {
    if (error) {
      res.status(400).json({
        status: "Fail creating paper DB entry for " + req.body.title + ": " + error
      });
    }
  });

  // Create project folders.
  var paperid = paper._id.toString();
  var paperpath = path.join(process.cwd(), "/papers");

  // the papers folder
  // fs.exists - > Deprecated!!! maybe stats.isDirectory()
  if (!fs.existsSync(paperpath)) {
    fs.mkdirSync(paperpath);
  }
  // the project folder
  fs.mkdirSync(path.join(paperpath, paperid));
  // the path for unprocessed tex files and related images as well for the result
  fs.mkdir(path.join(paperpath, paperid, "tex"));
  // the special content paths
  fs.mkdir(path.join(paperpath, paperid, "geotiff"));
  fs.mkdir(path.join(paperpath, paperid, "rdata"));
  fs.mkdir(path.join(paperpath, paperid, "geojson"));

  // a helper function to move files into the specific papers directory
  function copyToIDFolder(subfolder, formname, fileno) {
    var sourcePath = path.join(process.cwd(), "/uploadcache/", req.files[formname][fileno].filename);
    var destPath = path.join(paperpath, paperid, subfolder, req.files[formname][fileno].originalname);

    // since moveSync isn't implemented yet...
    fsextra.copySync(sourcePath, destPath);
    fs.unlink(sourcePath);
  }

  // saving the tex file
  if (/^\.[t|T][e|E][x|X]$/.test(path.extname(req.files["texfile"][0].originalname))) {
    copyToIDFolder("tex", "texfile", 0);
    paper.htmlCode = path.join(paperpath, paperid, "tex", path.basename(req.files["texfile"][0].originalname, path.extname(req.files["texfile"][0].originalname)) + ".html");


  } else {
    res.status(400).json({
      status: "uploaded file was not a tex file"
    });
  }

  if (req.files["otherfiles"]) {
    // saving all other files.
    for (let fileno = 0; fileno < req.files["otherfiles"].length; fileno++) {
      if (/^\.[r|R][d|D][a|A][t|T][a|A]$/.test(path.extname(req.files["otherfiles"][fileno].originalname))) {
        copyToIDFolder("rdata", "otherfiles", fileno);
        paper.rData_path.push(path.join(paperpath, paperid, "rdata", req.files["otherfiles"][fileno].originalname));


        // start conversion for RData
        var spawn = require('child_process').spawn;
        var rConvert = spawn("Rscript", ["--vanilla", process.cwd() + '/RDataConversion.R', path.join(paperpath, paperid, "rdata", req.files["otherfiles"][fileno].originalname)]);
        rConvert.on('exit', function(code) {
          console.log('RData conversion finished, returning ' + code);
        })

      } else if (/^\.[t|T][i|I][f|F]$/.test(path.extname(req.files["otherfiles"][fileno].originalname))) {

        // copy file
        copyToIDFolder("geotiff", "otherfiles", fileno);

        // create tiff db entry
        let tiff = new Tiff({
          paperID: paper._id,
          tiffname: req.files["otherfiles"][fileno].originalname,
          pngpaths: [],
          coordinates: []
        });

        let tifpath = path.join(paperpath, paperid, "geotiff", req.files["otherfiles"][fileno].originalname);

        // convert image to png
        let dataset = gdal.open(tifpath);

        gdal.drivers.get("PNG").createCopy(path.join(paperpath, paperid, "geotiff", path.basename(req.files["otherfiles"][fileno].originalname, path.extname(req.files["otherfiles"][fileno].originalname)) + ".png"), dataset);

        tiff.pngpaths.push(path.basename(req.files["otherfiles"][fileno].originalname, path.extname(req.files["otherfiles"][fileno].originalname)) + ".png");

        // converting the offset into [minlat, minlon, maxlat, maxlon], assuming WGS84
        // based on http://stackoverflow.com/questions/2922532/obtain-latitude-and-longitude-from-a-geotiff-file
        let gt = dataset.geoTransform;
        let w = dataset.rasterSize.x;
        let h = dataset.rasterSize.y;

        let wgs84 = gdal.SpatialReference.fromEPSG(4326); //image data was from unknown 4030
        let transformer = new gdal.CoordinateTransformation(dataset.srs, wgs84);

        let rstcoord = transformer.transformPoint({
          x: gt[0] + 0 * gt[1] + h * gt[2],
          y: gt[3] + 0 * gt[4] + h * gt[5]
        });

        let sndcoord = transformer.transformPoint({
          x: gt[0] + w * gt[1] + 0 * gt[2],
          y: gt[3] + w * gt[4] + 0 * gt[5]
        });

        tiff.coordinates = [
          rstcoord.y,
          rstcoord.x,
          sndcoord.y,
          sndcoord.x
        ];

        console.log(tiff.coordinates);

        tiff.save(function(error) {
          if (error) {
            res.status(400).json({
              status: "Fail creating tiff DB entry for " + req.files["otherfiles"][fileno].originalname + ": " + error
            });
          }
        });

        paper.geoTiff_names.push(tiff.tiffname);
        paper.geoTiff_ids.push(tiff._id);

      } else if (/^\.[j|J][s|S][o|O][n|N]$/.test(path.extname(req.files["otherfiles"][fileno].originalname))) {
        copyToIDFolder("geojson", "otherfiles", fileno);
        paper.geoJSON_path.push(path.join(paperpath, paperid, "geojson", req.files["otherfiles"][fileno].originalname));
      } else {
        copyToIDFolder("tex", "otherfiles", fileno);
      }
    }
  }

  // set the state to 0, meaning "unprocessed"
  paper.processing_state = 0;

  paper.save(function(error) {
    if (error) {
      res.status(400).json({
        status: "Fail creating paper DB entry for " + req.body.title + ": " + error
      });
    }
  });

  var inputdir = path.join(paperpath, paperid, "tex");
  var input = path.basename(req.files["texfile"][0].originalname);

  converter.convert(inputdir, input, paper);

  // create zip file
  var archiveStream = fs.createWriteStream(path.join(paperpath, paperid + ".zip"));
  var archive = archiver('zip');
  archive.pipe(archiveStream);
  archive.directory(path.join(paperpath, paperid), paperid, "");
  archive.finalize();

  res.status(200).json({
    status: "ok",
    paperID: paper._id
  });
} else {
  // there is no logged in user
  console.log('there is a not-logged-in-user trying to upload a paper');
  res.status(401).json({
    status: "unauthorized"
  });
}
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

app.get('/getPaperById', function(req, res) {
  Paper.findById(req.query.id, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(value);
      res.end();
    }
  })
});

app.get('/getTiffById', function(req, res) {
  Tiff.findById(req.query.id, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(value);
      res.end();
    }
  })
});

app.get('/getPapersByGoogleID', function(req, res) {
  Paper.find({'publisher': req.query.id}, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.json(value);
      res.end();
    }
  })
});

app.get('/deletePaper', function(req, res) {
  Paper.findById(req.query.id, function(err, value) {
    if (err) {
      res.status(400).send(err);
    } else {
      if(req.user) { // check if there is currently a logged in user
        if(req.user.googleID == value.publisher) { // check if the logged in user is publisher of the paper
          console.log('deleting paper');
          res.json({
            result: "success!"
          });

          // delete tiff entries
          for (let t = 0; t < value.geoTiff_ids.length; t++) {
            Tiff.findOne({
              _id: value.geoTiff_ids[t]._id
            }).remove().exec();
          }

          Paper.findOne({
            _id: req.query.id
          }).remove().exec();
          if (req.query.id !== "" && req.query.id !== "/") {
            fsextra.removeSync(path.join(process.cwd(), "/papers", req.query.id));
            fsextra.removeSync(path.join(process.cwd(), "/papers", req.query.id + ".zip"));
          }
          res.end();
        } else {
          console.log('user is not allowed to delete paper');
          res.status(401).json({
            status: "unauthorized"
          });
        }
      } else {
        console.log('there is a not-logged-in-user trying to delete paper');
        res.status(401).json({
          status: "unauthorized"
        });
      }
    }
  })
});


/**
 * Authentication
 *
 */

app.get('/auth/google',
  passport.authenticate('google-openidconnect'));

app.get('/auth/google/callback',
  passport.authenticate('google-openidconnect', {
    failureRedirect: '/login'
  }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/**
 *   @desc checks if there is a logged in user and sends true or false
 */
app.get('/isLoggedIn', function(req, res) {
  if (req.user) {
    res.send(true);
  } else {
    res.send(false);
  }
});

/**
 *   @desc checks if there is a logged in user and sends the user data or false when there is nobody logged in
 */
app.get('/getLoggedInUser', function(req, res) {
  if (req.user) {
    res.send(req.user);
  } else {
    res.send(false);
  }
});


/**
 *   @desc logs out the current user
 */
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


// finally start the server
app.listen(webPort, function() {
  console.log('SkyPaper server now running on port ' + webPort + '!');
});
