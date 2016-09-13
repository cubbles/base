/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('down')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description(
      'Stop the Cubbles Base.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var execConfig = {
      composeCommand: {
        options: '-f docker-compose.yml -f custom/docker-compose-custom.yml',
        command: 'down',
        commandArgs: ''
      },
      commandExecOptions: {
        cwd: path.join(__dirname, '../../../..', 'etc'),
        env: {
          BASE_AUTH_DATASTORE_ADMINCREDENTIALS: 'not required'
        }
      }
    };
    execCompose(execConfig, function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        done(error);
        return
      }
      stdout && console.log('stdout: ########', stdout);
      //stderr && console.log('stderr: ', stderr);
    });
  }
};