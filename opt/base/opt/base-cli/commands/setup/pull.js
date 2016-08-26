/**
 * Created by hrbu on 07.12.2015.
 */
'use strict';
var path = require('path');
var composeProxy = require('../../lib/compose');
var execCompose = composeProxy.command;

module.exports = function (vorpal) {

  vorpal
    .command('pull')
    .option('-v, --verbose [optionalBoolean]', 'Show details.')
    .description('Pull all images for the Cubbles Base.')
    .action(start);

  function start (args, done) {
    global.command = { args: args };
    var cluster = 'not needed';
    var execConfig = {
        composeCommand: {
          options: '-f docker-compose.yml',
          command: 'pull',
          commandArgs: ''
        },
        commandExecOptions: {
          cwd: path.join(__dirname, '../../../..', 'etc/docker-compose-config'),
          env: { BASE_CLUSTER: cluster }
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