/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var composeOptions = require('../../lib/compose-options');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('pull')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description('Pull all images for the Cubbles Base.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var execConfig = {
        composeCommand: {
          options: composeOptions.getOptions(),
          command: 'pull',
          commandArgs: ''
        },
        commandExecOptions: {
          cwd: path.join(__dirname, '../../../..', 'etc'),
          env: {
            BASE_AUTH_DATASTORE_ADMINCREDENTIALS: 'not required'
          }
        }
      }
      ;
    execCompose(execConfig, function (error, stdout, stderr) {
      if (error) {
        console.error('exec error: ', error);
        done(error);
        return
      }
      stdout && console.log('Command Response:') && console.log(stdout);
      //stderr && console.log('stderr: ', stderr);
    });
  }
};