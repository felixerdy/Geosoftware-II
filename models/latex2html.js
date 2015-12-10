"use strict";

/**
 * @desc Converts a LaTeX file into HTML using htlatex (TeX4ht) and does some additional conversations.
 */

// takes an input path, the input filename and an output path
exports.convert = function(inputdir, input) {
  var path = require("path");
  var fs = require('fs');

  // store the current working directory
  // then switch to the input dir to prevent htlatex from cluttering the main directory
  var currentwdir = process.cwd();
  process.chdir(inputdir);

  // start htlatex with the input file and the output directory
  var spawn = require('child_process').spawn,
    latexml = spawn("latexml", ["--dest=" + path.basename(input, ".tex") + ".xml", input]);

  latexml.on('exit', function(code) {
    console.log("Finished latexml with " + code);

    process.chdir(inputdir);
    var lmlpost = spawn("latexmlpost", ["-dest=" + path.basename(input, ".tex") + ".html", path.basename(input, ".tex") + ".xml"]);
    lmlpost.on('exit', function(code) {
      console.log("Finished latexmlpost with " + code);

      console.log(path.join(inputdir, path.basename(input, ".tex") + ".html"));

      var htmlData = fs.readFileSync(path.join(inputdir, path.basename(input, ".tex") + ".html"), "utf-8");

      htmlData = htmlData.replace('<head>',
        '<head><link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />' +
        '<script src="http://code.jquery.com/jquery-1.11.3.min.js">' +
        '</script><script src="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js"></script>' +
        '<script src="/js/iframe.js"></script>');

      fs.writeFileSync(path.join(inputdir, path.basename(input, ".tex") + ".html"), htmlData);

      process.chdir(currentwdir);

    });

  });

  // restore working directory
  process.chdir(currentwdir);

  // TODO: additional processing (replacing special stuff like references to RDATA files with regexes)
  // TODO: catching errors
}
