'use strict';
var fs = require('fs');

module.exports = new ComposeOptions();

function ComposeOptions () {
}

ComposeOptions.prototype.getOptions = function () {
  var defaultFilename = 'docker-compose.yml';
  var fileOptions = `-f ${defaultFilename}`;
  var customFiles = fs.readdirSync(__dirname + '/../../../etc/custom');
  customFiles.sort(); //allow to provide multiple custom files in an alphabetical order.
  customFiles.forEach(function (filename) {
    if(filename.endsWith('.yml') && filename !== defaultFilename) {
      fileOptions = `${fileOptions} -f custom/${filename}`;
    }
  });
  return fileOptions;
};