"use strict";

/**
 * @desc Converts a LaTeX file into HTML using htlatex (TeX4ht) and does some additional conversations.
 */

// takes an input path, the input filename and an output path
exports.convert = function(inputdir, input) {
  var path = require("path");

  // store the current working directory
  // then switch to the input dir to prevent htlatex from cluttering the main directory
  var currentwdir = process.cwd();
  process.chdir(inputdir);

  // start htlatex with the input file and the output directory
  var spawn   = require('child_process').spawn,
      latexml = spawn("latexml", ["--dest=" + path.basename(input, ".tex") + ".xml", input]);

  latexml.on('exit', function(code) {
    console.log("Finished latexml with " + code);

    process.chdir(inputdir);
    var lmlpost = spawn("latexmlpost", ["-dest=" + path.basename(input, ".tex") + ".html", path.basename(input, ".tex") + ".xml"]);
    lmlpost.on('exit', function(code) {
      console.log("Finished latexmlpost with " + code);
      process.chdir(currentwdir);
    });
  });

  // restore working directory
  process.chdir(currentwdir);

  // TODO: additional processing (replacing special stuff like references to RDATA files with regexes)
  // TODO: catching errors
}
