"use strict";

/**
 * @desc Converts a LaTeX file into HTML using latexml and does some additional conversations.
 */

exports.convert = function(inputdir, input, paper) {
  var path = require("path");
  var fs = require('fs');

  // store the current working directory
  // then switch to the input dir to prevent latexml from cluttering the main directory
  var currentwdir = process.cwd();
  process.chdir(inputdir);

  // start latexml
  var spawn = require('child_process').spawn;
  var latexml = spawn("latexml", ["--dest=" + path.basename(input, ".tex") + ".xml", input]);

  latexml.on('exit', function(code) {
    console.log("Step 1: latexml finished, returning " + code);

    if (code != 0) {
      paper.processing_state = -1;
      paper.save(function(error) {});
      return;
    }

    process.chdir(inputdir);

    // start latexmlpost
    var lmlpost = spawn("latexmlpost", ["-dest=" + path.basename(input, ".tex") + ".html", path.basename(input, ".tex") + ".xml"]);
    lmlpost.on('exit', function(code) {
      console.log("Step 2: latexmlpost finished, returning " + code);

      process.chdir(currentwdir);
      if (code != 0) {
        paper.processing_state = -2;
        paper.save(function(error) {});
        return;
      }


      // inject script tags
      try {
        var htmlData = fs.readFileSync(path.join(inputdir, path.basename(input, ".tex") + ".html"), "utf-8");

        htmlData = htmlData.replace('<head>',
          '<head><link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />' +
          '<script src="http://code.jquery.com/jquery-1.11.3.min.js"></script>' +
          '<script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>' +
          '<script src="/js/iframe.js"></script>' +
          '<script src="/js/bowerstuff/Flot/jquery.flot.js"></script>' +
          '<script src="/js/bowerstuff/Flot/jquery.flot.navigate.js"></script>' +
          '<script src="/js/bowerstuff/Flot/jquery.flot.resize.js"></script>' +
          '<script src="/js/bowerstuff/Flot/jquery.flot.time.js"></script>' +
          '<link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">' +
          '<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>' +
          '<script type="text/javascript" src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>' +
          '<script src="https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/leaflet.markercluster.js"></script>' +
          '<link href="https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.css" rel="stylesheet" />' +
          '<link href="https://api.mapbox.com/mapbox.js/plugins/leaflet-markercluster/v0.4.0/MarkerCluster.Default.css" rel="stylesheet" />' +
          '<script src="/js/bowerstuff/moment/moment.js"></script>' +
          '<script src="/js/bowerstuff/proj4/dist/proj4-src.js"></script>' +
          '<script src="/js/bowerstuff/proj4leaflet/src/proj4leaflet.js"></script>' +
          '<link href="/js/bowerstuff/polarmap.js/css/polarmap.css" rel="stylesheet" />' +
          '<script src="/js/bowerstuff/polarmap.js/dist/polarmap-src.js"></script>');

        fs.writeFileSync(path.join(inputdir, path.basename(input, ".tex") + ".html"), htmlData);

        console.log("Step 3: injecting script tags finished");
      } catch (e) {
        paper.processing_state = -3;
        paper.save(function(error) {});
        return;
      }

      // saving that the conversion was succesful
      paper.processing_state = 1;
      paper.save(function(error) {});
      return;

    });

  });

  process.chdir(currentwdir);

}
