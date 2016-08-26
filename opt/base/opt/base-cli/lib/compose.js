'use strict';
var path = require('path');
var exec = require('child_process').exec;

module.exports = new Compose();

function Compose () {
}

Compose.prototype.command = function (composeConfig, callback) {
  var command = getCommand(composeConfig.composeCommand.options, composeConfig.composeCommand.command, composeConfig.composeCommand.commandArgs);
  (global.command.args.options.verbose) && console.log('VERBOSE: command: %s', command);
  exec(command, composeConfig.commandExecOptions, callback)
};


function getCommand (composeOptions, command, commandArgs) {

  var commandString = '';
  commandString += (composeOptions ? ' ' + composeOptions : '');
  commandString += ' --project-name cubbles';
  commandString += ((global.command.args.options.verbose && ( composeOptions === undefined || composeOptions.indexOf('--verbose') < 0)) ? ' --verbose' : '');
  commandString += ' ' + command;
  commandString += (commandArgs ? ' ' + commandArgs : '');

  return 'docker-compose ' + commandString;
}
