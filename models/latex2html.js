"use strict";

/**
 * @desc Converts a LaTeX file into HTML using htlatex (TeX4ht) and does some additional conversations.
 */

// takes an input path, the input filename and an output path
exports.convert = function(inputdir, input) {
 
  // store the current working directory
  // then switch to the input dir to prevent htlatex from cluttering the main directory
  var currentwdir = process.cwd();
  process.chdir(inputdir);

  // start htlatex with the input file and the output directory
  var spawn   = require('child_process').spawn,
      htlatex = spawn("htlatex", [input, "", "-interaction=nonstopmode"]);

  htlatex.on('exit', function(code) {
    console.log("Finished htlatex with " + code);
  });

  // restore working directory
  process.chdir(currentwdir);

  // TODO: additional processing (replacing special stuff like references to RDATA files with regexes)
  // TODO: catching errors
}
